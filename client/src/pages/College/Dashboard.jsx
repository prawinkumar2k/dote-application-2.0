import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/layout/MainLayout';
import { 
  FileText, Clock, CheckCircle, XCircle, TrendingUp, Users, BookOpen
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const CollegeDashboard = () => {
  const [stats, setStats] = useState({ totalApplications: 0, pendingReview: 0, approved: 0, rejected: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/college/dashboard/stats', { withCredentials: true });
        if (data.success) {
          setStats(data.stats);
          setRecentApps(data.recentApplications);
        }
      } catch (err) {
        console.error('Error fetching college stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Hydrate Charts
  const statusData = [
    { name: 'Approved', value: stats.approved || 1, color: '#10b981' }, 
    { name: 'Pending', value: stats.pendingReview || 1, color: '#f59e0b' },
    { name: 'Rejected', value: stats.rejected || 1, color: '#f43f5e' },
  ];

  const courseData = [
    { name: 'Computer Science', applications: 85, approved: 60 },
    { name: 'Mechanical Eng', applications: 45, approved: 30 },
    { name: 'Civil Engineering', applications: 35, approved: 25 },
    { name: 'Electrical/EEE', applications: 51, approved: 41 },
  ];

  return (
    <MainLayout role="college">
      <div className="space-y-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, Administrator 👋</h1>
            <p className="text-blue-100 max-w-xl leading-relaxed">
              Here lies your daily digest. You currently have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{stats.pendingReview} pending applications</span> that require your review. Let's make today productive!
            </p>
          </div>
          <div className="absolute -right-8 -top-8 text-white/10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
             <BookOpen size={240} />
          </div>
        </div>

        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<FileText className="text-blue-600" />} 
            label="Total Applications" 
            value={loading ? '...' : stats.totalApplications} 
            trend="+12% this week"
            bg="bg-blue-50"
          />
          <StatCard 
            icon={<CheckCircle className="text-emerald-600" />} 
            label="Approved" 
            value={loading ? '...' : stats.approved} 
            trend="+8% this week"
            bg="bg-emerald-50"
          />
          <StatCard 
            icon={<Clock className="text-amber-600" />} 
            label="Pending Review" 
            value={loading ? '...' : stats.pendingReview} 
            trend="Action Required"
            bg="bg-amber-50"
          />
          <StatCard 
            icon={<XCircle className="text-rose-600" />} 
            label="Rejected" 
            value={loading ? '...' : stats.rejected} 
            trend="-2% this week"
            bg="bg-rose-50"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart: Status Overview */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <TrendingUp className="text-slate-400" size={20}/>
               Application Status
            </h2>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                  {s.name}
                </div>
              ))}
            </div>
          </div>

          {/* Bar Chart: Applications by Course */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col hover:shadow-md transition-shadow">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Users className="text-slate-400" size={20}/>
               Demand by Course Profile
            </h2>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                  <RechartsTooltip 
                     cursor={{ fill: '#f8fafc' }}
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: '600' }}/>
                  <Bar dataKey="applications" name="Total Applications" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="approved" name="Approved Seats" fill="#10b981" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Applications Quick Peek */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
              <p className="text-sm text-slate-500 mt-1">Latest application submissions for review</p>
            </div>
            <button className="text-blue-600 font-bold text-sm hover:underline bg-blue-50 px-5 py-2.5 rounded-xl transition-all hover:bg-blue-100 active:scale-95">
               View All Applications
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-5">Applicant Details</th>
                  <th className="px-6 py-5">Course Selected</th>
                  <th className="px-6 py-5">Merit Score</th>
                  <th className="px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentApps.length > 0 ? recentApps.slice(0, 5).map((app, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                             {(app.student_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <div className="font-bold text-slate-800">{app.student_name || 'Anonymous'}</div>
                             <div className="text-xs font-semibold text-slate-400 mt-0.5">{app.application_no || `APP-${app.id}`}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">General Degree</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-700">88%</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex w-fit items-center gap-2 shadow-sm bg-amber-100 text-amber-700`}>
                        <Clock size={14} /> Pending
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">No recent applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, trend, bg }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden">
    <div className="flex justify-between items-start mb-5 relative z-10">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        {icon}
      </div>
      {trend && (
         <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
            trend.includes('-') || trend.includes('Action') ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
         }`}>
            {trend}
         </span>
      )}
    </div>
    <div className="relative z-10">
      <div className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">{value}</div>
      <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);

export default CollegeDashboard;
