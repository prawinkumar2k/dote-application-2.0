import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Users, Building, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalColleges: 0, totalStudents: 0, totalApplications: 0, totalUsers: 0 });
  const [recentColleges, setRecentColleges] = useState([]);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    axios.get('/api/admin/dashboard', { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentColleges(res.data.recentColleges || []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <MainLayout role="admin">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
            <p className="text-slate-500 mt-1">Welcome, {user.name} — System-wide monitoring and management</p>
          </div>
          <Link to="/admin/colleges" className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Manage Colleges
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StatCard icon={<Building className="text-blue-600" />} label="Active Colleges" value={stats.totalColleges} trend="from institution_master" />
          <StatCard icon={<Users className="text-emerald-600" />} label="Registered Students" value={stats.totalStudents} />
          <StatCard icon={<FileText className="text-amber-600" />} label="Submitted Applications" value={stats.totalApplications} />
          <StatCard icon={<TrendingUp className="text-rose-600" />} label="Admin Users" value={stats.totalUsers} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Colleges</h2>
              <Link to="/admin/colleges" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {recentColleges.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Loading colleges...</p>
              ) : recentColleges.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-slate-500 text-xs">{c.ins_code}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{c.ins_name}</p>
                    <p className="text-sm text-slate-500">{c.ins_district} · {c.ins_type}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold shrink-0">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <StatRow label="Total institutions in DB" value={stats.totalColleges} color="blue" />
              <StatRow label="Students registered" value={stats.totalStudents} color="emerald" />
              <StatRow label="Applications submitted" value={stats.totalApplications} color="amber" />
              <StatRow label="Applications in progress" value={stats.totalStudents - stats.totalApplications} color="slate" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    {trend && <div className="text-xs font-semibold text-emerald-600 mt-2">{trend}</div>}
  </div>
);

const StatRow = ({ label, value, color }) => {
  const colors = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', slate: 'bg-slate-400' };
  return (
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${colors[color]}`} />
      <span className="flex-1 text-sm font-medium text-slate-600">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
};

export default AdminDashboard;
