import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { FileText, Clock, Bell, ArrowRight, Download } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <MainLayout role="student">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, Student</h1>
            <p className="text-slate-500 mt-1">Track your admission status and complete your application</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-400">Application Status</span>
            <div className="text-emerald-600 font-bold">In Progress (40%)</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={120} />
             </div>
             <h2 className="text-2xl font-bold mb-4">Complete Application</h2>
             <p className="text-blue-100 mb-8 max-w-xs">You still have 5 sections to complete. Click here to continue from where you left off.</p>
             <Link to="/student/apply" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
                Continue Now <ArrowRight size={20} />
             </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Notifications</h2>
             <div className="space-y-4 flex-1">
                <NotificationItem 
                  icon={<Bell className="text-amber-500" />} 
                  title="Document Verification Pending" 
                  time="2 hours ago" 
                />
                <NotificationItem 
                  icon={<Clock className="text-blue-500" />} 
                  title="Admission Schedule Updated" 
                  time="Yesterday" 
                />
             </div>
             <button className="text-blue-600 font-semibold text-sm hover:underline mt-6">View all notifications</button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h2 className="text-xl font-bold text-slate-800 mb-8">Application Timeline</h2>
           <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
              <TimelineStep title="Registration" desc="Completed on 12-Apr" active />
              <TimelineStep title="Form Filling" desc="In Progress" active pulse />
              <TimelineStep title="Verification" desc="Pending" />
              <TimelineStep title="Allotment" desc="Pending" />
           </div>
        </div>

        {/* Downloads */}
        <div className="grid md:grid-cols-3 gap-6">
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Admission Prospectus</span>
              <button className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Download size={18} /></button>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Fee Structure 2026</span>
              <button className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><Download size={18} /></button>
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

const NotificationItem = ({ icon, title, time }) => (
  <div className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
     <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
     <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
     </div>
  </div>
);

const TimelineStep = ({ title, desc, active, pulse }) => (
  <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
     <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'} ${pulse ? 'animate-pulse' : ''}`}>
        {active ? <FileText size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
     </div>
     <p className={`font-bold text-sm ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</p>
     <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </div>
);

export default StudentDashboard;
