import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { FileCheck, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const CollegeDashboard = () => {
  return (
    <MainLayout role="college">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">College Portal</h1>
          <p className="text-slate-500 mt-1">Review and manage incoming student applications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard icon={<Clock className="text-amber-500" />} label="Pending Review" value="48" />
          <StatCard icon={<CheckCircle className="text-emerald-500" />} label="Approved" value="156" />
          <StatCard icon={<XCircle className="text-rose-500" />} label="Rejected" value="12" />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Student Applications</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search by name or ID..." className="bg-transparent border-none focus:outline-none" />
              </div>
              <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Application ID</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Mark(%)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: 'Rahul Kumar', id: 'APP-10293', course: 'Computer Science', mark: '94.5', status: 'Pending' },
                  { name: 'Priya Dharshini', id: 'APP-10294', course: 'Mechanical Eng', mark: '88.2', status: 'Approved' },
                  { name: 'Santhosh S', id: 'APP-10295', course: 'Civil Engineering', mark: '79.0', status: 'Rejected' },
                ].map((app, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{app.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{app.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{app.course}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{app.mark}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                        app.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 font-bold text-sm hover:underline">Mark Status</button>
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
