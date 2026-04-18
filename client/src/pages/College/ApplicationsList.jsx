import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Search, Filter, Eye, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const ApplicationsList = () => {
  const [filter, setFilter] = useState('All');

  const apps = [
    { id: 'APP-1001', name: 'Arjun Sarja', course: 'Computer Science', mark: '98%', status: 'Approved', date: '2026-04-15' },
    { id: 'APP-1002', name: 'Bhavani K', course: 'Information Tech', mark: '92%', status: 'Pending', date: '2026-04-16' },
    { id: 'APP-1003', name: 'Chandru M', course: 'Mechanical Eng', mark: '85%', status: 'Rejected', date: '2026-04-16' },
    { id: 'APP-1004', name: 'Divya P', course: 'Civil Engineering', mark: '94%', status: 'Pending', date: '2026-04-17' },
    { id: 'APP-1005', name: 'Eswar Rao', course: 'EEE', mark: '89%', status: 'Approved', date: '2026-04-17' },
  ];

  const filteredApps = filter === 'All' ? apps : apps.filter(app => app.status === filter);

  return (
    <MainLayout role="college">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Incoming Applications</h1>
            <p className="text-slate-500">Review student details and process admissions</p>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={20} /> Export List
          </button>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by name or app ID..." className="input-field pl-10" />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">App ID</th>
                  <th className="px-4 py-4">Course Choice</th>
                  <th className="px-4 py-4 text-center">Mark</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-slate-800">{app.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-500">{app.id}</td>
                    <td className="px-4 py-5 font-medium text-slate-700">{app.course}</td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-bold text-blue-600">{app.mark}</span>
                    </td>
                    <td className="px-4 py-5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm">
                        <Eye size={20} />
                      </button>
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

const StatusBadge = ({ status }) => {
  const styles = {
    Approved: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    Rejected: 'bg-rose-100 text-rose-700',
  };
  const Icons = {
    Approved: <CheckCircle size={14} />,
    Pending: <Clock size={14} />,
    Rejected: <XCircle size={14} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {Icons[status]} {status}
    </span>
  );
};

export default ApplicationsList;
