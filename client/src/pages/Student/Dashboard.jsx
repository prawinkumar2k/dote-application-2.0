import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { FileText, ArrowRight, Download, CheckCircle } from 'lucide-react';
import axios from 'axios';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  useEffect(() => {
    axios.get('/api/student/me', { withCredentials: true })
      .then(res => { if (res.data.success) setData(res.data); })
      .catch(() => {});
  }, []);

  const completedSteps = data?.completedSteps ?? 0;
  const pct = Math.round((completedSteps / 9) * 100);
  const isSubmitted = data?.isSubmitted;
  const appNo = data?.applicationNo;

  return (
    <MainLayout role="student">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name || 'Student'}</h1>
            <p className="text-slate-500 mt-1">Track your admission status and complete your application</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-400">Application Status</span>
            <div className={`font-bold ${isSubmitted ? 'text-emerald-600' : 'text-amber-500'}`}>
              {isSubmitted ? `Submitted — ${appNo}` : `In Progress (${pct}%)`}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={120} /></div>
            <h2 className="text-2xl font-bold mb-4">{isSubmitted ? 'Application Submitted' : 'Complete Application'}</h2>
            <p className="text-blue-100 mb-8 max-w-xs">
              {isSubmitted
                ? `Your application ${appNo} has been submitted successfully.`
                : `${9 - completedSteps} sections remaining. Continue from where you left off.`}
            </p>
            <Link to={isSubmitted ? '/student/my-application' : '/student/apply'}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-50 transition-colors">
              {isSubmitted ? 'View Application' : 'Continue Now'} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Info</h2>
            <div className="space-y-3 flex-1">
              {data?.student && (
                <>
                  <InfoRow label="Email" value={data.student.email} />
                  <InfoRow label="Community" value={data.student.community} />
                  <InfoRow label="Mobile" value={data.student.mobile} />
                  {appNo && <InfoRow label="Application No" value={appNo} highlight />}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Application Progress</h2>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>{completedSteps} of 9 steps completed</span>
            <span>{pct}%</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 mt-8">
            <TimelineStep title="Registration" desc="Account created" active />
            <TimelineStep title="Form Filling" desc={isSubmitted ? 'Completed' : 'In Progress'} active pulse={!isSubmitted} />
            <TimelineStep title="Verification" desc="Pending" active={isSubmitted} />
            <TimelineStep title="Allotment" desc="Pending" />
          </div>
        </div>

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

const InfoRow = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{value || '—'}</span>
  </div>
);

const TimelineStep = ({ title, desc, active, pulse }) => (
  <div className="flex-1 flex flex-col items-center text-center">
    <div className={`w-8 h-8 rounded-full mb-3 flex items-center justify-center ${active ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'} ${pulse ? 'animate-pulse' : ''}`}>
      {active ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
    </div>
    <p className={`font-bold text-sm ${active ? 'text-slate-800' : 'text-slate-400'}`}>{title}</p>
    <p className="text-xs text-slate-500 mt-1">{desc}</p>
  </div>
);

export default StudentDashboard;
