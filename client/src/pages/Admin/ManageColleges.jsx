import { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Search, Building, MapPin } from 'lucide-react';
import axios from 'axios';

const ManageColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/districts', { withCredentials: true })
      .then(res => { if (res.data.success) setDistricts(res.data.districts); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/admin/colleges?search=${search}&district=${district}&page=${page}&limit=20`, { withCredentials: true })
      .then(res => { if (res.data.success) { setColleges(res.data.colleges); setTotal(res.data.total); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, district, page]);

  return (
    <MainLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Colleges</h1>
            <p className="text-slate-500">{total} active institutions in the system</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name or code..." className="input-field pl-10"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-field w-auto min-w-45" value={district} onChange={e => { setDistrict(e.target.value); setPage(1); }}>
            <option value="">All Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">College Name & Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">District</th>
                  <th className="px-6 py-4">Principal</th>
                  <th className="px-6 py-4">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading...</td></tr>
                ) : colleges.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No colleges found</td></tr>
                ) : colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{c.ins_name}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">Code: {c.ins_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">{c.ins_type || '—'}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />{c.ins_district || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{c.ins_principal || '—'}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{c.ins_phone_number || c.ins_email_id_office || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">Showing {colleges.length} of {total} colleges</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageColleges;
