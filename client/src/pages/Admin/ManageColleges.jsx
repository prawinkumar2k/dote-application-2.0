import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Search, Filter, Edit, Trash2, Building, MapPin, Globe, Loader2 } from 'lucide-react';
import axios from 'axios';

const ManageColleges = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/colleges', { withCredentials: true });
        if (data.success && data.colleges) {
          setColleges(data.colleges);
        }
      } catch (err) {
        console.error('Failed to load colleges', err);
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  return (
    <MainLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manage Colleges</h1>
            <p className="text-slate-500">Add, edit, or deactivate participating institutions</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add New College
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search by name, code or location..." className="input-field pl-10" />
          </div>
          <div className="flex gap-2">
            <select className="input-field w-auto min-w-[140px]">
              <option value="">All Regions</option>
              <option>North</option>
              <option>South</option>
              <option>West</option>
              <option>East</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

        {/* Colleges Table */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">College Name & Code</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <Loader2 className="animate-spin inline mr-2" size={20} /> Loading colleges...
                    </td>
                  </tr>
                ) : colleges.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No colleges found in the database.
                    </td>
                  </tr>
                ) : (
                  colleges.map((college) => (
                    <tr key={college.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <Building size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{college.ins_name}</p>
                            <p className="text-xs font-semibold text-blue-600 mt-0.5">{college.ins_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <MapPin size={14} className="text-slate-400" />
                          {college.ins_city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <Globe size={14} className="text-slate-400" />
                          {college.ins_district || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (college.ins_status || 'Active').toLowerCase() === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                        }`}>
                          {college.ins_status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm border border-transparent hover:border-rose-100">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">Showing {colleges.length} colleges</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-400 cursor-not-allowed">Prev</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:border-blue-300 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageColleges;
