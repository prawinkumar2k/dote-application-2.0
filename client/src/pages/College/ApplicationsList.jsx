import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { Search, Eye } from 'lucide-react';
import axios from 'axios';

const ApplicationsList = () => {
  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/college/applications?search=${search}&page=${page}&limit=20`, { withCredentials: true })
      .then(res => { if (res.data.success) { setApps(res.data.applications); setTotal(res.data.total); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <MainLayout role="college">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Incoming Applications</h1>
            <p className="text-slate-500">{total} submitted application{total !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by name, email or App ID..." className="input-field pl-10"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">App ID</th>
                  <th className="px-4 py-4">Community</th>
                  <th className="px-4 py-4 text-center">HSC %</th>
                  <th className="px-4 py-4">Special</th>
                  <th className="px-4 py-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : apps.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No applications found</td></tr>
                ) : apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {app.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{app.student_name}</p>
                          <p className="text-xs text-slate-400">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-blue-600">{app.application_no}</td>
                    <td className="px-4 py-5 font-medium text-slate-700">{app.community || '—'}</td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-bold text-blue-600">{app.hsc_percentage ? `${app.hsc_percentage}%` : '—'}</span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex gap-1 flex-wrap">
                        {app.differently_abled === 'yes' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">DA</span>}
                        {app.ex_servicemen === 'yes' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">EX</span>}
                        {app.eminent_sports === 'yes' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">SP</span>}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <Link to={`/college/applications/${app.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all inline-flex shadow-none hover:shadow-sm">
                        <Eye size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-xs text-slate-500">Showing {apps.length} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-40">Prev</button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplicationsList;
