import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Users, Building, FileText, TrendingUp, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentColleges, setRecentColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
          withCredentials: true,
        });
        setStats(data.stats);
        setRecentColleges(data.recentColleges);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <MainLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
          <p className="text-slate-500 mt-1">System-wide monitoring and management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<Building className="text-blue-600" />}
            label="Total Colleges"
            value={loading ? null : stats?.totalColleges ?? '—'}
            loading={loading}
          />
          <StatCard
            icon={<Users className="text-emerald-600" />}
            label="Total Applications"
            value={loading ? null : stats?.totalApplications ?? '—'}
            loading={loading}
          />
          <StatCard
            icon={<FileText className="text-amber-600" />}
            label="Total Users"
            value={loading ? null : stats?.totalUsers ?? '—'}
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Colleges */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Colleges</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={20} /> Loading...
              </div>
            ) : recentColleges.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No colleges found.</p>
            ) : (
              <div className="space-y-4">
                {recentColleges.map((college, i) => (
                  <div
                    key={college.user_id || i}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                      {(college.name || college.institution_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {college.name || college.institution_name || college.user_id}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {college.location || college.district || ''}{college.code ? ` • Code: ${college.code}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">System Info</h2>
            </div>
            <div className="space-y-4">
              <InfoRow label="Database" value="MySQL — admission_dote" status="green" />
              <InfoRow label="Server" value="Node.js / Express — Port 5000" status="green" />
              <InfoRow label="Environment" value="Development" status="blue" />
              <InfoRow label="API Status" value={error ? 'Unreachable' : 'Connected'} status={error ? 'red' : 'green'} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, loading }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
    <div className="text-sm font-medium text-slate-500">{label}</div>
    {loading ? (
      <div className="flex items-center gap-2 mt-2">
        <Loader2 className="animate-spin text-slate-400" size={18} />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    ) : (
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    )}
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
