
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { Users, Clock, Brain, Trophy, Settings, Layout, Search, Bell, Activity, Sparkles, Home, Menu, X } from 'lucide-react';
import { ChildProfile, getAgeGroup, AgeGroup } from '../types';

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
}

const mockProgressData = [
  { name: 'Mon', focus: 65, engagement: 40 },
  { name: 'Tue', focus: 70, engagement: 45 },
  { name: 'Wed', focus: 68, engagement: 50 },
  { name: 'Thu', focus: 80, engagement: 60 },
  { name: 'Fri', focus: 85, engagement: 75 },
  { name: 'Sat', focus: 90, engagement: 80 },
  { name: 'Sun', focus: 92, engagement: 85 },
];

const mockSkillData = [
  { name: 'Logic', val: 85 },
  { name: 'Creativity', val: 92 },
  { name: 'Math', val: 65 },
  { name: 'Verbal', val: 78 },
];

const ParentDashboard: React.FC<Props> = ({ childrenData, familyStats }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate weekly activity data from stats
  const getWeeklyActivityData = () => {
    if (!familyStats) return mockProgressData;
    
    // For now, use mock data structure but with real weekly sessions count
    // In the future, we can fetch daily session data from API
    const baseData = [...mockProgressData];
    // Scale engagement based on weekly sessions
    const avgEngagement = Math.min(100, (familyStats.weeklySessions / 7) * 10);
    return baseData.map((day, index) => ({
      ...day,
      engagement: Math.floor(avgEngagement + (Math.random() * 20 - 10)),
    }));
  };

  // Generate skill data from children's progress
  const getSkillData = () => {
    if (!familyStats || !childrenData.length) return mockSkillData;
    
    // Calculate average progress per category (simplified)
    // In the future, we can fetch actual game progress by category
    const totalProgress = familyStats.children.reduce((sum, child) => sum + child.progress, 0);
    const avgProgress = Math.min(100, (totalProgress / childrenData.length) * 10);
    
    return [
      { name: 'Logic', val: Math.floor(avgProgress + 10) },
      { name: 'Creativity', val: Math.floor(avgProgress + 15) },
      { name: 'Math', val: Math.floor(avgProgress - 5) },
      { name: 'Verbal', val: Math.floor(avgProgress + 5) },
    ];
  };

  const weeklyData = getWeeklyActivityData();
  const skillData = getSkillData();

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
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-scandi-oat flex flex-col z-50 lg:z-20 shrink-0 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-8 border-b border-scandi-oat flex items-center justify-between">
           <div className="flex items-center gap-2 text-scandi-moss font-kids font-bold text-2xl">
             <div className="w-8 h-8 bg-scandi-moss text-white rounded-lg flex items-center justify-center"><Home size={18} /></div>
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
           <a href="#" className="flex items-center gap-3 px-4 py-3 bg-scandi-oat text-scandi-chocolate rounded-xl font-bold transition"><Layout size={18} /> Overview</a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate rounded-xl font-medium transition"><Activity size={18} /> Insights</a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate rounded-xl font-medium transition"><Users size={18} /> Children</a>
           <a href="#" className="flex items-center gap-3 px-4 py-3 text-scandi-stone hover:bg-scandi-cream hover:text-scandi-chocolate rounded-xl font-medium transition"><Settings size={18} /> Settings</a>
        </nav>
        <div className="p-6 border-t border-scandi-oat">
          <div className="flex items-center gap-3 p-3 bg-scandi-cream rounded-xl">
             <div className="w-10 h-10 rounded-full bg-scandi-sand flex items-center justify-center text-white font-bold">S</div>
             <div className="text-sm">
                <div className="font-bold text-scandi-chocolate">Smith Family</div>
                <div className="text-scandi-stone text-xs">Premium Plan</div>
             </div>
          </div>
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
             <h1 className="text-lg md:text-xl font-bold text-scandi-chocolate">Family Overview</h1>
           </div>
           <div className="flex items-center gap-2 md:gap-4">
              <div className="relative hidden md:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-scandi-stone w-4 h-4" />
                 <input className="pl-10 pr-4 py-2 bg-scandi-cream rounded-full text-sm outline-none focus:ring-2 focus:ring-scandi-sand w-64 placeholder:text-scandi-sand" placeholder="Search..." />
              </div>
              <button className="relative p-2 text-scandi-stone hover:bg-scandi-cream rounded-full transition">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-scandi-clay rounded-full"></span>
              </button>
           </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
           
           {/* Metric Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Active Learners', 
                  val: familyStats?.activeChildren?.toString() || childrenData.length.toString(), 
                  sub: 'Total children', 
                  icon: Users, 
                  color: 'text-scandi-moss', 
                  bg: 'bg-scandi-moss/10' 
                },
                { 
                  label: 'Total Sessions', 
                  val: familyStats?.totalSessions?.toString() || '0', 
                  sub: 'Games completed', 
                  icon: Clock, 
                  color: 'text-scandi-denim', 
                  bg: 'bg-scandi-denim/10' 
                },
                { 
                  label: 'Total Points', 
                  val: familyStats?.totalPoints?.toLocaleString() || '0', 
                  sub: 'All time earned', 
                  icon: Trophy, 
                  color: 'text-scandi-honey', 
                  bg: 'bg-scandi-honey/10' 
                },
                { 
                  label: 'This Week', 
                  val: familyStats?.weeklySessions?.toString() || '0', 
                  sub: 'Sessions this week', 
                  icon: Sparkles, 
                  color: 'text-scandi-clay', 
                  bg: 'bg-scandi-clay/10' 
                },
              ].map((m, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-scandi-oat shadow-soft flex flex-col justify-between h-40">
                   <div className="flex justify-between items-start">
                      <div className={`p-3 ${m.bg} ${m.color} rounded-2xl`}>
                        <m.icon size={20} />
                      </div>
                   </div>
                   <div>
                     <div className="text-3xl font-bold text-scandi-chocolate mb-1">{m.val}</div>
                     <div className="text-sm text-scandi-stone font-medium">{m.label}</div>
                   </div>
                </div>
              ))}
           </div>

           {/* Charts Row */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                 <h3 className="font-bold text-scandi-chocolate mb-6 text-lg">Activity Trends</h3>
                 <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9CAF88" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#9CAF88" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E79E85" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#E79E85" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3EFE0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A8A29E', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#A8A29E', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', fontFamily: 'Inter'}} />
                        <Area type="monotone" dataKey="focus" stroke="#9CAF88" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                        <Area type="monotone" dataKey="engagement" stroke="#E79E85" strokeWidth={3} fillOpacity={1} fill="url(#colorEngage)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-8 rounded-[2rem] border border-scandi-oat shadow-soft">
                 <h3 className="font-bold text-scandi-chocolate mb-6 text-lg">Growth Areas</h3>
                 <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillData} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3EFE0" />
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={{fill: '#5D4037', fontSize: 13, fontWeight: 600}} />
                         <Tooltip cursor={{fill: '#FDFBF7'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}} />
                         <Bar dataKey="val" fill="#F4C95D" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           {/* Children Table */}
           <div className="bg-white rounded-[2rem] border border-scandi-oat shadow-soft overflow-hidden">
             <div className="p-4 md:p-8 border-b border-scandi-oat flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <h3 className="font-bold text-lg text-scandi-chocolate">Child Accounts</h3>
               <button className="text-sm bg-scandi-cream text-scandi-chocolate font-bold px-4 py-2 rounded-full hover:bg-scandi-oat transition">Add Child +</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-scandi-cream/50 text-scandi-stone font-bold uppercase tracking-wider text-xs">
                   <tr>
                     <th className="px-4 md:px-8 py-4">Profile</th>
                     <th className="px-4 md:px-8 py-4 hidden sm:table-cell">Mode</th>
                     <th className="px-4 md:px-8 py-4">Points</th>
                     <th className="px-4 md:px-8 py-4 hidden md:table-cell">Status</th>
                     <th className="px-4 md:px-8 py-4 text-right">Settings</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-scandi-oat">
                   {childrenData.map(child => {
                     const ageGroup = getAgeGroup(child.age);
                     return (
                       <tr key={child.id} className="hover:bg-scandi-cream/30 transition">
                         <td className="px-4 md:px-8 py-4 flex items-center gap-4">
                           <img src={child.avatarUrl} className="w-10 h-10 rounded-full bg-scandi-oat" />
                           <div className="flex flex-col">
                             <span className="font-bold text-scandi-chocolate text-base">{child.name}</span>
                             <span className="sm:hidden text-xs text-scandi-stone">
                               {ageGroup === AgeGroup.EARLY ? 'Early Play' :
                                ageGroup === AgeGroup.DISCOVERY ? 'Discovery' : 'Junior'}
                             </span>
                           </div>
                         </td>
                         <td className="px-4 md:px-8 py-4 hidden sm:table-cell">
                           {ageGroup === AgeGroup.EARLY ? 
                              <span className="px-3 py-1 bg-early-primary/20 text-early-text rounded-full text-xs font-bold">Early Play</span> :
                            ageGroup === AgeGroup.DISCOVERY ? 
                              <span className="px-3 py-1 bg-disco-primary/20 text-disco-text rounded-full text-xs font-bold">Discovery</span> :
                              <span className="px-3 py-1 bg-junior-primary/20 text-junior-text rounded-full text-xs font-bold">Junior</span>
                           }
                         </td>
                         <td className="px-4 md:px-8 py-4 font-bold text-scandi-chocolate">{child.points} ★</td>
                         <td className="px-4 md:px-8 py-4 text-scandi-moss font-bold text-xs flex items-center gap-2 hidden md:table-cell">● Online</td>
                         <td className="px-4 md:px-8 py-4 text-right">
                            <button className="p-2 hover:bg-scandi-oat rounded-lg text-scandi-stone transition"><Settings size={18} /></button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>

        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
