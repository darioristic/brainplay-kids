"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  TrendingUp,
  Activity,
  Settings,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  emoji?: string | null;
  active: boolean;
  createdAt: string;
  _count: {
    families: number;
  };
}

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalFamilies: number;
  totalChildren: number;
  totalSessions: number;
  growthRate: number;
}

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tenants" | "features">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTenant, setShowAddTenant] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [tenantsRes] = await Promise.all([
        apiClient.get("/api/tenants"),
      ]);

      setTenants(tenantsRes.data.tenants || []);
      
      // Calculate platform stats
      const totalTenants = tenantsRes.data.tenants?.length || 0;
      const activeTenants = tenantsRes.data.tenants?.filter((t: Tenant) => t.active).length || 0;
      
      setStats({
        totalTenants,
        activeTenants,
        totalFamilies: tenantsRes.data.tenants?.reduce((sum: number, t: Tenant) => sum + (t._count?.families || 0), 0) || 0,
        totalChildren: 0, // Would need separate API call
        totalSessions: 0, // Would need separate API call
        growthRate: 12.5, // Mock data
      });

      // Mock feature toggles
      setFeatureToggles([
        {
          id: "1",
          name: "Smart Game Engine",
          description: "AI-powered game generation",
          enabled: true,
          category: "Games",
        },
        {
          id: "2",
          name: "Voice Assistant",
          description: "Owl Assistant voice interactions",
          enabled: true,
          category: "Features",
        },
        {
          id: "3",
          name: "Image Generator",
          description: "Reward image generation",
          enabled: true,
          category: "Features",
        },
        {
          id: "4",
          name: "Multi-tenant Routing",
          description: "Subdomain-based tenant isolation",
          enabled: true,
          category: "Infrastructure",
        },
      ]);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureId: string) => {
    setFeatureToggles(
      featureToggles.map((f) =>
        f.id === featureId ? { ...f, enabled: !f.enabled } : f
      )
    );
    // In real implementation, would call API to update feature toggle
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="md" color="primary" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-scandi-moss rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Platform Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="text-sm text-gray-600 mr-2">
                  {user.name} ({user.email})
                </div>
              )}
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <button className="px-4 py-2 bg-scandi-moss text-white rounded-lg font-medium hover:bg-scandi-moss/90 transition flex items-center gap-2">
                <Download size={16} />
                Export
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={clsx(
              "px-6 py-2 rounded-md font-medium transition",
              activeTab === "overview"
                ? "bg-scandi-moss text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("tenants")}
            className={clsx(
              "px-6 py-2 rounded-md font-medium transition",
              activeTab === "tenants"
                ? "bg-scandi-moss text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Tenants
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={clsx(
              "px-6 py-2 rounded-md font-medium transition",
              activeTab === "features"
                ? "bg-scandi-moss text-white"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            Features
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-scandi-moss/10 rounded-lg flex items-center justify-center">
                    <Globe className="text-scandi-moss" size={24} />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    +{stats.growthRate}%
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalTenants}
                </div>
                <div className="text-sm text-gray-500">Total Tenants</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-scandi-denim/10 rounded-lg flex items-center justify-center">
                    <Users className="text-scandi-denim" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.activeTenants}
                </div>
                <div className="text-sm text-gray-500">Active Tenants</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-scandi-sage/10 rounded-lg flex items-center justify-center">
                    <Users className="text-scandi-sage" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalFamilies}
                </div>
                <div className="text-sm text-gray-500">Total Families</div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-scandi-honey/10 rounded-lg flex items-center justify-center">
                    <Activity className="text-scandi-honey" size={24} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stats.totalSessions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Sessions</div>
              </div>
            </div>

            {/* Analytics Chart Placeholder */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Platform Growth</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    7D
                  </button>
                  <button className="px-3 py-1 text-sm bg-scandi-moss text-white rounded-md">
                    30D
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    90D
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">Analytics chart would be rendered here</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  { action: "New tenant created", tenant: "smith-family", time: "2 hours ago" },
                  { action: "Feature toggle updated", feature: "Smart Game Engine", time: "5 hours ago" },
                  { action: "Tenant activated", tenant: "test-family", time: "1 day ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-scandi-moss rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === "tenants" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-scandi-moss focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </button>
                <button
                  onClick={() => setShowAddTenant(true)}
                  className="px-4 py-2 bg-scandi-moss text-white rounded-lg font-medium hover:bg-scandi-moss/90 transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  New Tenant
                </button>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Subdomain
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Families
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Users className="mx-auto text-gray-400 mb-2" size={48} />
                          <p className="text-gray-500">No tenants found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{tenant.emoji || "🏠"}</div>
                              <div>
                                <div className="font-medium text-gray-900">{tenant.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {tenant.subdomain}
                            </code>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {tenant._count?.families || 0}
                          </td>
                          <td className="px-6 py-4">
                            {tenant.active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                                <CheckCircle2 size={12} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                                <XCircle size={12} />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(tenant.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                                <Edit size={16} />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Feature Toggles</h2>
              <div className="space-y-4">
                {featureToggles.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{feature.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                          {feature.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                    <button
                      onClick={() => toggleFeature(feature.id)}
                      className={clsx(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
                        feature.enabled
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      )}
                    >
                      {feature.enabled ? (
                        <>
                          <ToggleRight size={20} />
                          Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} />
                          Disabled
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

