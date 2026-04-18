import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Search, Filter, Edit, Trash2, Building, MapPin, Globe } from 'lucide-react';

const ManageColleges = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const colleges = [
    { id: '1', name: 'Government College of Technology', code: 'GCT001', location: 'Coimbatore', region: 'West', status: 'Active' },
    { id: '2', name: 'Alagappa Chettiar Govt College', code: 'ACC002', location: 'Karaikudi', region: 'South', status: 'Active' },
    { id: '3', name: 'Government College of Engineering', code: 'GCE003', location: 'Salem', region: 'West', status: 'Inactive' },
    { id: '4', name: 'Thanthai Periyar Govt Institute', code: 'TPG004', location: 'Vellore', region: 'North', status: 'Active' },
  ];

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
                {colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Building size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{college.name}</p>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{college.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {college.location}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Globe size={14} className="text-slate-400" />
                        {college.region}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        college.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {college.status}
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
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <p className="text-xs text-slate-500 font-medium">Showing 4 colleges</p>
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
