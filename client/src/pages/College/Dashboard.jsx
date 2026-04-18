import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Clock, CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import axios from 'axios';

const CollegeDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    axios.get('/api/college/dashboard', { withCredentials: true })
      .then(res => { if (res.data.success) setStats(res.data.stats); })
      .catch(() => {});
    axios.get('/api/college/applications?limit=5', { withCredentials: true })
      .then(res => { if (res.data.success) setApps(res.data.applications); })
      .catch(() => {});
  }, []);

  const filtered = apps.filter(a =>
    !search || a.student_name?.toLowerCase().includes(search.toLowerCase()) || a.application_no?.includes(search)
  );

  return (
    <MainLayout role="college">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">College Portal</h1>
          <p className="text-slate-500 mt-1">Welcome, {user.name} — Review and manage incoming student applications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard icon={<Clock className="text-amber-500" />} label="Total Submitted" value={stats.total} />
          <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Approved" value={stats.approved} />
          <StatCard icon={<XCircle className="text-rose-500" />} label="Rejected" value={stats.rejected} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Applications</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search by name or App No..." className="bg-transparent border-none focus:outline-none"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Link to="/college/applications" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                View All
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Community</th>
                  <th className="px-6 py-4">HSC %</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No submitted applications yet</td></tr>
                ) : filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{app.student_name}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{app.application_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{app.community || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{app.hsc_percentage ? `${app.hsc_percentage}%` : '—'}</td>
                    <td className="px-6 py-4">
                      <Link to={`/college/applications/${app.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
    <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl">{icon}</div>
    <div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  </div>
);

export default CollegeDashboard;
