"use client";

import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Users,
  Clock,
  Trophy,
  Settings,
  Layout,
  Search,
  Bell,
  Activity,
  Sparkles,
  Home,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Brain,
  Target,
  TrendingUp,
  Award,
  Gamepad2,
  Zap,
  Star,
} from "lucide-react";
import { ChildProfile, getAgeGroup, AgeGroup } from "@/types";
import { AddChildModal } from "../AddChildModal";
import { ChildSettingsModal } from "../ChildSettingsModal";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { apiClient } from "@/lib/api-client";
import { useRouter, useParams } from "next/navigation";
import clsx from "clsx";

interface Props {
  childrenData: ChildProfile[];
  familyStats?: {
    totalPoints: number;
    totalSessions: number;
    activeChildren: number;
    weeklySessions: number;
    children: Array<{
      id: string;
      name: string;
      points: number;
      progress: number;
    }>;
  } | null;
  familyId?: string;
  familyName?: string;
  onRefresh?: () => void;
}

const mockProgressData = [
  { name: "Mon", focus: 65, engagement: 40 },
  { name: "Tue", focus: 70, engagement: 45 },
  { name: "Wed", focus: 68, engagement: 50 },
  { name: "Thu", focus: 80, engagement: 60 },
  { name: "Fri", focus: 85, engagement: 75 },
  { name: "Sat", focus: 90, engagement: 80 },
  { name: "Sun", focus: 92, engagement: 85 },
];

const mockSkillData = [
  { name: "Logic", val: 85 },
  { name: "Creativity", val: 92 },
  { name: "Math", val: 65 },
  { name: "Verbal", val: 78 },
];

const cognitiveMetrics = [
  { skill: "Problem Solving", score: 88 },
  { skill: "Memory", score: 75 },
  { skill: "Creativity", score: 92 },
  { skill: "Logic", score: 85 },
  { skill: "Language", score: 78 },
  { skill: "Focus", score: 82 },
];

const PremiumParentDashboard: React.FC<Props> = ({
  childrenData: initialChildrenData,
  familyStats: initialFamilyStats,
  familyId,
  familyName = "Family",
  onRefresh,
}) => {
  const router = useRouter();
  const params = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [childrenData, setChildrenData] = useState(initialChildrenData);
  const [familyStats, setFamilyStats] = useState(initialFamilyStats);
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [deletingChild, setDeletingChild] = useState<ChildProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "analytics" | "games" | "rewards">("overview");

  useEffect(() => {
    setChildrenData(initialChildrenData);
  }, [initialChildrenData]);

  useEffect(() => {
    setFamilyStats(initialFamilyStats);
  }, [initialFamilyStats]);

  const getWeeklyActivityData = () => {
    if (!familyStats) return mockProgressData;
    const baseData = [...mockProgressData];
    const avgEngagement = Math.min(100, (familyStats.weeklySessions / 7) * 10);
    return baseData.map((day) => ({
      ...day,
      engagement: Math.floor(avgEngagement + (Math.random() * 20 - 10)),
    }));
  };

  const getSkillData = () => {
    if (!familyStats || !childrenData.length) return mockSkillData;
    const totalProgress = familyStats.children.reduce(
      (sum, child) => sum + child.progress,
      0
    );
    const avgProgress = Math.min(100, (totalProgress / childrenData.length) * 10);
    return [
      { name: "Logic", val: Math.floor(avgProgress + 10) },
      { name: "Creativity", val: Math.floor(avgProgress + 15) },
      { name: "Math", val: Math.floor(avgProgress - 5) },
      { name: "Verbal", val: Math.floor(avgProgress + 5) },
    ];
  };

  const weeklyData = getWeeklyActivityData();
  const skillData = getSkillData();

  const refreshStats = async () => {
    if (!familyId) return;
    try {
      const statsRes = await apiClient.get(`/api/families/${familyId}/stats`);
      if (statsRes.data?.stats) {
        setFamilyStats(statsRes.data.stats);
      }
    } catch (err: any) {
      console.error("Failed to refresh stats:", err);
    }
  };

  const handleAddChild = async (newChild: ChildProfile) => {
    setChildrenData([...childrenData, newChild]);
    setShowAddChild(false);
    await refreshStats();
    if (onRefresh) onRefresh();
  };

  const handleUpdateChild = async (updatedChild: ChildProfile) => {
    setChildrenData(
      childrenData.map((child) =>
        child.id === updatedChild.id ? updatedChild : child
      )
    );
    setEditingChild(null);
    await refreshStats();
    if (onRefresh) onRefresh();
  };

  const handleDeleteChild = async () => {
    if (!deletingChild || !familyId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/children/${deletingChild.id}`);
      setChildrenData(
        childrenData.filter((child) => child.id !== deletingChild.id)
      );
      setDeletingChild(null);
      await refreshStats();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Failed to delete child:", err);
      alert(err.response?.data?.error || err.message || "Failed to delete child.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    router.push("/");
  };

  return (
    <div className="min-h-full bg-scandi-cream flex font-sans text-scandi-chocolate">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-scandi-oat flex flex-col z-50 lg:z-20 shrink-0 transform transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-8 border-b border-scandi-oat flex items-center justify-between">
          <div className="flex items-center gap-2 text-scandi-moss font-kids font-bold text-2xl">
            <div className="w-8 h-8 bg-scandi-moss text-white rounded-lg flex items-center justify-center">
              <Home size={18} />
            </div>
            BrainPlay
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 hover:bg-scandi-cream rounded-lg transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView("overview")}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition",
              activeView === "overview"
                ? "bg-scandi-oat text-scandi-chocolate font-bold"
                : "text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate"
            )}
          >
            <Layout size={18} /> Overview
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition",
              activeView === "analytics"
                ? "bg-scandi-oat text-scandi-chocolate font-bold"
                : "text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate"
            )}
          >
            <Brain size={18} /> Cognitive Analytics
          </button>
          <button
            onClick={() => setActiveView("games")}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition",
              activeView === "games"
                ? "bg-scandi-oat text-scandi-chocolate font-bold"
                : "text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate"
            )}
          >
            <Gamepad2 size={18} /> Smart Games
          </button>
          <button
            onClick={() => setActiveView("rewards")}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition",
              activeView === "rewards"
                ? "bg-scandi-oat text-scandi-chocolate font-bold"
                : "text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate"
            )}
          >
            <Award size={18} /> Rewards
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate rounded-xl font-medium transition"
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
        <div className="p-6 border-t border-scandi-oat">
          <div className="flex items-center gap-3 p-3 bg-scandi-cream rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-scandi-sand flex items-center justify-center text-white font-bold">
              {familyName.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm flex-1">
              <div className="font-bold text-scandi-chocolate">{familyName}</div>
              <div className="text-scandi-stone text-xs">Premium Plan</div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-scandi-oat flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-scandi-cream rounded-lg transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-scandi-chocolate">
              {activeView === "overview" && "Family Overview"}
              {activeView === "analytics" && "Cognitive Analytics"}
              {activeView === "games" && "Smart Game Configuration"}
              {activeView === "rewards" && "Rewards System"}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone w-4 h-4" />
              <input
                className="pl-10 pr-4 py-2 bg-scandi-cream rounded-full text-sm outline-none focus:ring-2 focus:ring-scandi-sand w-64 placeholder:text-scandi-sand"
                placeholder="Search..."
              />
            </div>
            <button className="relative p-2 text-scandi-stone hover:bg-scandi-cream rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-scandi-clay rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Overview View */}
          {activeView === "overview" && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    label: "Active Learners",
                    val:
                      familyStats?.activeChildren?.toString() ||
                      childrenData.length.toString(),
                    sub: "Total children",
                    icon: Users,
                    color: "text-scandi-moss",
                    bg: "bg-scandi-moss/10",
                  },
                  {
                    label: "Total Sessions",
                    val: familyStats?.totalSessions?.toString() || "0",
                    sub: "Games completed",
                    icon: Clock,
                    color: "text-scandi-denim",
                    bg: "bg-scandi-denim/10",
                  },
                  {
                    label: "Total Points",
                    val: familyStats?.totalPoints?.toLocaleString() || "0",
                    sub: "All time earned",
                    icon: Trophy,
                    color: "text-scandi-honey",
                    bg: "bg-scandi-honey/10",
                  },
                  {
                    label: "This Week",
                    val: familyStats?.weeklySessions?.toString() || "0",
                    sub: "Sessions this week",
                    icon: Sparkles,
                    color: "text-scandi-clay",
                    bg: "bg-scandi-clay/10",
                  },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-[2rem] border border-scandi-oat shadow-soft flex flex-col justify-between h-40 hover:shadow-soft-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 ${m.bg} ${m.color} rounded-2xl`}>
                        <m.icon size={20} />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-scandi-chocolate mb-1">
                        {m.val}
                      </div>
                      <div className="text-sm text-scandi-stone font-medium">
                        {m.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                  <h3 className="font-bold text-scandi-chocolate mb-6 text-lg">
                    Activity Trends
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9CAF88" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#9CAF88" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E79E85" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#E79E85" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#F3EFE0"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#A8A29E", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#A8A29E", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
                            fontFamily: "Inter",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="focus"
                          stroke="#9CAF88"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorFocus)"
                        />
                        <Area
                          type="monotone"
                          dataKey="engagement"
                          stroke="#E79E85"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorEngage)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                  <h3 className="font-bold text-scandi-chocolate mb-6 text-lg">
                    Growth Areas
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                          stroke="#F3EFE0"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          width={70}
                          tick={{ fill: "#5D4037", fontSize: 13, fontWeight: 600 }}
                        />
                        <Tooltip
                          cursor={{ fill: "#FDFBF7" }}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                          }}
                        />
                        <Bar
                          dataKey="val"
                          fill="#F4C95D"
                          radius={[0, 8, 8, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Children Table */}
              <div className="bg-white rounded-[2rem] border border-scandi-oat shadow-soft overflow-hidden">
                <div className="p-4 md:p-8 border-b border-scandi-oat flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-bold text-lg text-scandi-chocolate">
                    Child Accounts
                  </h3>
                  <Button
                    onClick={() => setShowAddChild(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add Child
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-scandi-cream/50 text-scandi-stone font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-4 md:px-8 py-4">Profile</th>
                        <th className="px-4 md:px-8 py-4 hidden sm:table-cell">Mode</th>
                        <th className="px-4 md:px-8 py-4">Points</th>
                        <th className="px-4 md:px-8 py-4 hidden md:table-cell">Status</th>
                        <th className="px-4 md:px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-scandi-oat">
                      {childrenData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 md:px-8 py-12 text-center text-scandi-stone">
                            <div className="flex flex-col items-center gap-4">
                              <Users size={48} className="text-scandi-oat" />
                              <p className="font-bold">No children added yet</p>
                              <Button
                                onClick={() => setShowAddChild(true)}
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Plus size={16} />
                                Add Your First Child
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        childrenData.map((child) => {
                          const ageGroup = getAgeGroup(child.age);
                          return (
                            <tr key={child.id} className="hover:bg-scandi-cream/30 transition">
                              <td className="px-4 md:px-8 py-4 flex items-center gap-4">
                                <img
                                  src={child.avatarUrl}
                                  className="w-10 h-10 rounded-full bg-scandi-oat"
                                  alt={child.name}
                                />
                                <div className="flex flex-col">
                                  <span className="font-bold text-scandi-chocolate text-base">
                                    {child.name}
                                  </span>
                                  <span className="sm:hidden text-xs text-scandi-stone">
                                    {ageGroup === AgeGroup.EARLY
                                      ? "Early Play"
                                      : ageGroup === AgeGroup.DISCOVERY
                                      ? "Discovery"
                                      : "Junior"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 hidden sm:table-cell">
                                {ageGroup === AgeGroup.EARLY ? (
                                  <span className="px-3 py-1 bg-early-primary/20 text-early-text rounded-full text-xs font-bold">
                                    Early Play
                                  </span>
                                ) : ageGroup === AgeGroup.DISCOVERY ? (
                                  <span className="px-3 py-1 bg-disco-primary/20 text-disco-text rounded-full text-xs font-bold">
                                    Discovery
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-junior-primary/20 text-junior-text rounded-full text-xs font-bold">
                                    Junior
                                  </span>
                                )}
                              </td>
                              <td className="px-4 md:px-8 py-4 font-bold text-scandi-chocolate">
                                {child.points} ★
                              </td>
                              <td className="px-4 md:px-8 py-4 text-scandi-moss font-bold text-xs flex items-center gap-2 hidden md:table-cell">
                                ● Active
                              </td>
                              <td className="px-4 md:px-8 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingChild(child)}
                                    className="p-2 hover:bg-scandi-oat rounded-lg text-scandi-stone hover:text-scandi-chocolate transition"
                                    aria-label="Edit child"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => setDeletingChild(child)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-scandi-stone hover:text-red-600 transition"
                                    aria-label="Delete child"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Cognitive Analytics View */}
          {activeView === "analytics" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                <h3 className="font-bold text-scandi-chocolate mb-6 text-lg flex items-center gap-2">
                  <Brain className="text-scandi-moss" size={24} />
                  Cognitive Performance Radar
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={cognitiveMetrics}>
                      <PolarGrid stroke="#F3EFE0" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: "#5D4037", fontSize: 12, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#A8A29E", fontSize: 10 }}
                      />
                      <Radar
                        name="Cognitive Skills"
                        dataKey="score"
                        stroke="#9CAF88"
                        fill="#9CAF88"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-scandi-oat shadow-soft">
                  <h4 className="font-bold text-scandi-chocolate mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-scandi-moss" />
                    Learning Trends
                  </h4>
                  <div className="space-y-3">
                    {cognitiveMetrics.map((metric, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-scandi-stone">{metric.skill}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-scandi-oat rounded-full overflow-hidden">
                            <div
                              className="h-full bg-scandi-sage rounded-full transition-all"
                              style={{ width: `${metric.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-scandi-chocolate w-12 text-right">
                            {metric.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-scandi-oat shadow-soft">
                  <h4 className="font-bold text-scandi-chocolate mb-4 flex items-center gap-2">
                    <Target size={20} className="text-scandi-denim" />
                    Improvement Areas
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-scandi-cream rounded-xl">
                      <p className="text-sm font-medium text-scandi-chocolate mb-2">
                        Math Skills
                      </p>
                      <p className="text-xs text-scandi-stone">
                        Focus on number games and counting activities to improve math
                        performance.
                      </p>
                    </div>
                    <div className="p-4 bg-scandi-cream rounded-xl">
                      <p className="text-sm font-medium text-scandi-chocolate mb-2">
                        Memory Training
                      </p>
                      <p className="text-xs text-scandi-stone">
                        Practice memory games regularly to enhance recall abilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Smart Games View */}
          {activeView === "games" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                <h3 className="font-bold text-scandi-chocolate mb-6 text-lg flex items-center gap-2">
                  <Gamepad2 className="text-scandi-moss" size={24} />
                  Smart Game Configuration
                </h3>
                <p className="text-scandi-stone mb-6">
                  Configure game difficulty, categories, and unlock settings for each
                  child.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {childrenData.map((child) => (
                    <div
                      key={child.id}
                      className="p-6 bg-scandi-cream rounded-xl border border-scandi-oat"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={child.avatarUrl}
                          className="w-12 h-12 rounded-full"
                          alt={child.name}
                        />
                        <div>
                          <h4 className="font-bold text-scandi-chocolate">
                            {child.name}
                          </h4>
                          <p className="text-xs text-scandi-stone">
                            {getAgeGroup(child.age) === AgeGroup.EARLY
                              ? "Early Play"
                              : getAgeGroup(child.age) === AgeGroup.DISCOVERY
                              ? "Discovery"
                              : "Junior"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-scandi-chocolate mb-1 block">
                            Preferred Difficulty
                          </label>
                          <select className="w-full px-4 py-2 bg-white border border-scandi-oat rounded-lg text-sm">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-scandi-chocolate mb-1 block">
                            Game Categories
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {["Logic", "Math", "Memory", "Creativity", "Language"].map(
                              (cat) => (
                                <span
                                  key={cat}
                                  className="px-3 py-1 bg-white border border-scandi-oat rounded-full text-xs font-medium text-scandi-stone"
                                >
                                  {cat}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rewards View */}
          {activeView === "rewards" && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                <h3 className="font-bold text-scandi-chocolate mb-6 text-lg flex items-center gap-2">
                  <Award className="text-scandi-honey" size={24} />
                  Rewards System
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {childrenData.map((child) => (
                    <div
                      key={child.id}
                      className="p-6 bg-gradient-to-br from-scandi-honey/20 to-scandi-clay/20 rounded-xl border border-scandi-oat"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={child.avatarUrl}
                          className="w-16 h-16 rounded-full border-4 border-white"
                          alt={child.name}
                        />
                        <div>
                          <h4 className="font-bold text-scandi-chocolate">
                            {child.name}
                          </h4>
                          <div className="flex items-center gap-1 text-scandi-honey">
                            <Star size={16} />
                            <span className="font-bold">{child.points}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-scandi-stone">Total Points</span>
                          <span className="font-bold text-scandi-chocolate">
                            {child.points}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-scandi-stone">Next Reward</span>
                          <span className="font-bold text-scandi-chocolate">
                            {Math.ceil((child.points + 100) / 100) * 100} points
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {familyId && (
        <AddChildModal
          isOpen={showAddChild}
          onClose={() => setShowAddChild(false)}
          onAdd={handleAddChild}
          familyId={familyId}
        />
      )}

      {editingChild && (
        <ChildSettingsModal
          isOpen={true}
          onClose={() => setEditingChild(null)}
          child={editingChild}
          onUpdate={handleUpdateChild}
        />
      )}

      <Modal
        isOpen={deletingChild !== null}
        onClose={() => setDeletingChild(null)}
        title="Delete Child"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-scandi-chocolate">
            Are you sure you want to delete{" "}
            <span className="font-bold">{deletingChild?.name}</span>? This action
            cannot be undone and all their progress will be lost.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDeleteChild}
              variant="danger"
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              onClick={() => setDeletingChild(null)}
              variant="outline"
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PremiumParentDashboard;

