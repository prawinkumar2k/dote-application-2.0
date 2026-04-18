import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Plus, Users, Building, FileText, TrendingUp, Search } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <MainLayout role="admin">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Overview</h1>
            <p className="text-slate-500 mt-1">System-wide monitoring and management</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add New College
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard icon={<Building className="text-blue-600" />} label="Total Colleges" value="142" trend="+3 this month" />
          <StatCard icon={<Users className="text-emerald-600" />} label="Applications" value="12.4k" trend="+12% vs last year" />
          <StatCard icon={<FileText className="text-amber-600" />} label="Master Records" value="650" />
          <StatCard icon={<TrendingUp className="text-rose-600" />} label="Placement Rate" value="84%" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Recent Colleges</h2>
              <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-slate-500">{i}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">University College of Engineering {i}</p>
                    <p className="text-sm text-slate-500">Chennai • Code: AR2021</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
    <div className="text-sm font-medium text-slate-500">{label}</div>
    <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
    {trend && <div className="text-xs font-semibold text-emerald-600 mt-2">{trend}</div>}
  </div>
);

export default AdminDashboard;
