import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Users, Building, FileText, TrendingUp, Search, ShieldCheck, Landmark, HandCoins, Wallet } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [communityData, setCommunityData] = useState([]);
  const [casteData, setCasteData] = useState([]);
  const [schoolTypeData, setSchoolTypeData] = useState([]);
  const [collegeDemographics, setCollegeDemographics] = useState(null);
  const [chartView, setChartView] = useState('community');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/dashboard-stats');
        if (response.data.success) {
          setStats(response.data.stats);
          setCommunityData(response.data.communityBreakdown);
          setCasteData(response.data.casteBreakdown);
          setSchoolTypeData(response.data.schoolTypeBreakdown);
          setCollegeDemographics(response.data.collegeDemographics);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = chartView === 'community' ? communityData : casteData;
  const chartLabel = chartView === 'community' ? 'community' : 'caste';
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map(d => d.count)) : 1;

  return (
    <MainLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 mt-1">System-wide monitoring and management</p>
        </div>

        {/* Stats Grid - Row 1: Existing + Live Total Colleges */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            icon={<Building className="text-blue-600" />}
            label="Total Colleges"
            value={loading ? '...' : stats?.totalColleges ?? '—'}
            color="blue"
          />
          <StatCard
            icon={<Users className="text-emerald-600" />}
            label="Total Students"
            value={loading ? '...' : stats?.totalStudents ?? '—'}
            color="emerald"
          />
          <StatCard icon={<FileText className="text-amber-600" />} label="Applications" value="12.4k" color="amber" />
          <StatCard icon={<TrendingUp className="text-rose-600" />} label="Placement Rate" value="84%" color="rose" />
        </div>

        {/* Stats Grid - Row 2: New Live Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            icon={<ShieldCheck className="text-indigo-600" />}
            label="Total Admins"
            value={loading ? '...' : stats?.totalAdmins ?? '—'}
            color="indigo"
          />
          <StatCard
            icon={<Landmark className="text-teal-600" />}
            label="Govt Colleges"
            value={loading ? '...' : stats?.govtColleges ?? '—'}
            color="teal"
          />
          <StatCard
            icon={<HandCoins className="text-orange-600" />}
            label="Aided Colleges"
            value={loading ? '...' : stats?.aidedColleges ?? '—'}
            color="orange"
          />
          <StatCard
            icon={<Wallet className="text-purple-600" />}
            label="Self Finance Colleges"
            value={loading ? '...' : stats?.selfFinanceColleges ?? '—'}
            color="purple"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bar Chart - Students by Community/Caste */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Students by {chartView === 'community' ? 'Community' : 'Caste'}</h2>
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setChartView('community')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    chartView === 'community' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Community
                </button>
                <button
                  onClick={() => setChartView('caste')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    chartView === 'caste' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Caste
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 font-medium">No data available</div>
            ) : (
              <div className="space-y-3">
                {chartData.map((item, index) => {
                  const percentage = Math.round((item.count / maxCount) * 100);
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-700">{item[chartLabel]}</span>
                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Students by School Type */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Students by School Type</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : schoolTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 font-medium">No data available</div>
            ) : (
              <div className="space-y-3">
                {schoolTypeData.map((item, index) => {
                  const schoolMax = Math.max(...schoolTypeData.map(d => d.count));
                  const percentage = Math.round((item.count / schoolMax) * 100);
                  const schoolColors = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                  const color = schoolColors[index % schoolColors.length];
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-slate-700 capitalize">{item.school_type}</span>
                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80"
                          style={{ width: `${percentage}%`, backgroundColor: color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* College Demographics */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">College Demographics</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Men's Colleges", value: collegeDemographics?.mens, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Women's Colleges", value: collegeDemographics?.womens, color: "text-pink-600", bg: "bg-pink-50" },
                  { label: "Co-ed Colleges", value: collegeDemographics?.coed, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Hostel Having Colleges", value: collegeDemographics?.hostel, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Non-Hostel Colleges", value: collegeDemographics?.nonHostel, color: "text-slate-600", bg: "bg-slate-50" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                           <Building className={item.color} size={18} />
                        </div>
                        <span className="font-semibold text-slate-700">{item.label}</span>
                     </div>
                     <span className="font-bold text-slate-900 text-lg">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Logs */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">System Logs</h2>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search logs..." className="bg-transparent border-none text-sm focus:outline-none" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                 <div>
                    <p className="text-sm font-semibold text-slate-800">Master Data Updated</p>
                    <p className="text-xs text-slate-500">System admin updated the community list template • 2 hours ago</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, color = 'blue' }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className={`bg-${color}-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>{icon}</div>
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
  </div>
);

const InfoRow = ({ label, value, status }) => {
  const colors = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status]}`}>{value}</span>
    </div>
  );
};

export default AdminDashboard;
