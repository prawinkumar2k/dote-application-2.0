import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { 
  FileText, ArrowRight, Download, CheckCircle, Clock, AlertCircle, BookOpen,
  DollarSign, Calendar, Users, Award, Zap, Info, Mail, Phone, MapPin,
  FileCheck, Upload, Eye, Settings
} from 'lucide-react';
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
  const student = data?.student;
  
  // Calculate document upload status
  const docsUploaded = [
    student?.photo ? 1 : 0,
    student?.transfer_certificate ? 1 : 0,
    student?.marksheet_certificate ? 1 : 0,
    student?.community_certificate ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  const docsPct = Math.round((docsUploaded / 4) * 100);

  return (
    <MainLayout role="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name || 'Student'}</h1>
            <p className="text-slate-500 mt-1">Track your admission status and complete your application</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-slate-400">Application Status</span>
            <div className={`font-bold text-lg ${isSubmitted ? 'text-emerald-600' : 'text-amber-500'}`}>
              {isSubmitted ? `Submitted ✓ ${appNo}` : `In Progress (${pct}%)`}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<FileText className="text-blue-600" />}
            label="Application Steps"
            value={completedSteps}
            subtext="of 9 completed"
            color="blue"
            percentage={pct}
          />
          <StatCard 
            icon={<FileCheck className="text-emerald-600" />}
            label="Documents"
            value={docsUploaded}
            subtext="of 4 uploaded"
            color="emerald"
            percentage={docsPct}
          />
          <StatCard 
            icon={<Clock className="text-amber-600" />}
            label="Status"
            value={isSubmitted ? 'Submitted' : 'In Progress'}
            subtext={isSubmitted ? 'Under Review' : `${9 - completedSteps} steps left`}
            color={isSubmitted ? 'emerald' : 'amber'}
          />
          <StatCard 
            icon={<Award className="text-indigo-600" />}
            label="Category"
            value={student?.community || '—'}
            subtext="Your community"
            color="indigo"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={120} /></div>
              <h2 className="text-2xl font-bold mb-4 relative z-10">
                {isSubmitted ? '✓ Application Submitted' : 'Complete Your Application'}
              </h2>
              <p className="text-blue-100 mb-6 max-w-md relative z-10">
                {isSubmitted
                  ? `Your application ${appNo} has been submitted successfully. You can view, download, or print your application anytime.`
                  : `${9 - completedSteps} sections remaining. Your progress is auto-saved as you fill.`}
              </p>
              <div className="flex flex-wrap gap-3 relative z-10">
                <Link to={isSubmitted ? '/student/my-application' : '/student/apply'}
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
                  {isSubmitted ? (
                    <><Eye size={18} /> View Application</>
                  ) : (
                    <><ArrowRight size={18} /> Continue Now</>
                  )}
                </Link>
                {isSubmitted && (
                  <Link to="/student/my-application"
                    className="bg-white/20 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-white/30 transition-colors border border-white/30">
                    <Download size={18} /> Download
                  </Link>
                )}
              </div>
            </div>

            {/* Application Progress */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Zap size={20} className="text-blue-600" />
                Application Progress
              </h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                  <span className="text-2xl font-bold text-slate-900">{pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {completedSteps} of 9 steps completed
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 1, title: 'Personal Info', done: true },
                  { id: 2, title: 'Contact Details', done: true },
                  { id: 3, title: 'Parent Info', done: true },
                  { id: 4, title: 'Academic', done: completedSteps >= 4 },
                  { id: 5, title: 'Qualifying Exam', done: completedSteps >= 5 },
                  { id: 6, title: 'Special Status', done: completedSteps >= 6 },
                  { id: 7, title: 'Preferences', done: completedSteps >= 7 },
                  { id: 8, title: 'Documents', done: completedSteps >= 8 },
                  { id: 9, title: 'Review', done: isSubmitted },
                ].slice(0, 4).map(step => (
                  <div key={step.id} className={`flex items-center gap-2 p-3 rounded-xl border ${
                    step.done 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      step.done 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-300'
                    }`}>
                      {step.done ? <CheckCircle size={14} /> : <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />}
                    </div>
                    <span className={`text-xs font-semibold ${
                      step.done ? 'text-emerald-700' : 'text-slate-600'
                    }`}>{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Upload Status */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-600" />
                Documents Status
              </h2>

              {/* Document Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Upload Progress</span>
                  <span className="text-lg font-bold text-slate-900">{docsUploaded}/4</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${docsPct}%` }} />
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-3">
                <DocumentItem 
                  label="Passport Photo" 
                  uploaded={!!student?.photo}
                  action={<Link to="/student/apply#step9" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Upload</Link>}
                />
                <DocumentItem 
                  label="Transfer Certificate" 
                  uploaded={!!student?.transfer_certificate}
                  action={<Link to="/student/apply#step9" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Upload</Link>}
                />
                <DocumentItem 
                  label="Marksheet/Qualifications" 
                  uploaded={!!student?.marksheet_certificate}
                  action={<Link to="/student/apply#step9" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Upload</Link>}
                />
                <DocumentItem 
                  label="Community Certificate" 
                  uploaded={!!student?.community_certificate}
                  action={<Link to="/student/apply#step9" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Upload</Link>}
                />
              </div>
            </div>

            {/* Important Dates */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                Important Dates
              </h2>
              <div className="space-y-4">
                <DateItem date="15 May 2026" event="Application Deadline" status="active" />
                <DateItem date="20 May 2026" event="Merit List Publication" status="upcoming" />
                <DateItem date="25 May 2026" event="Choice Filling Period" status="upcoming" />
                <DateItem date="01 June 2026" event="Final Allotment" status="upcoming" />
                <DateItem date="15 June 2026" event="Admission Reporting" status="upcoming" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Your Information</h2>
              <div className="space-y-4">
                {student && (
                  <>
                    <InfoItem icon={<User size={16} />} label="Name" value={student.student_name} />
                    <InfoItem icon={<Mail size={16} />} label="Email" value={student.email} />
                    <InfoItem icon={<Phone size={16} />} label="Mobile" value={student.mobile} />
                    <InfoItem icon={<MapPin size={16} />} label="Community" value={student.community} highlight />
                    {appNo && <InfoItem icon={<Award size={16} />} label="App No" value={appNo} highlight />}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <ActionBtn 
                  icon={<FileText size={18} />}
                  label="View Application"
                  href="/student/my-application"
                  color="blue"
                />
                <ActionBtn 
                  icon={<Upload size={18} />}
                  label="Upload Documents"
                  href="/student/apply"
                  color="emerald"
                />
                <ActionBtn 
                  icon={<Eye size={18} />}
                  label="View Report"
                  href="/student/my-application"
                  color="indigo"
                />
                <ActionBtn 
                  icon={<Download size={18} />}
                  label="Download Prospectus"
                  href="#"
                  color="amber"
                />
              </div>
            </div>

            {/* Status Badge */}
            <div className={`rounded-3xl p-6 text-white ${isSubmitted ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {isSubmitted ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <p className="font-bold text-lg">{isSubmitted ? 'Application Submitted' : 'In Progress'}</p>
                  <p className="text-sm opacity-90 mt-1">
                    {isSubmitted 
                      ? 'Your application is under review. Check status regularly.' 
                      : 'Complete all steps to submit your application.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Requirements</h2>
              <div className="space-y-2 text-sm">
                <CheckItem done={true} text="Valid Email Address" />
                <CheckItem done={true} text="Correct Phone Number" />
                <CheckItem done={!!student?.community} text="Community Proof" />
                <CheckItem done={docsUploaded >= 3} text="Academic Documents" />
                <CheckItem done={isSubmitted} text="Submit Application" />
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 mt-1" size={20} />
                <div>
                  <p className="font-bold text-slate-900 mb-2">Need Help?</p>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>📞 Helpline: +91-XXX-XXX-XXXX</li>
                    <li>📧 Email: support@dote.gov</li>
                    <li>🕐 Mon-Fri: 9 AM - 6 PM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// ─────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, subtext, color, percentage }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    indigo: 'bg-indigo-50 border-indigo-200'
  };
  
  return (
    <div className={`rounded-2xl p-5 border ${colors[color]} relative overflow-hidden`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-white rounded-lg">{icon}</div>
        {percentage && <span className="text-xs font-bold text-slate-600">{percentage}%</span>}
      </div>
      {percentage && (
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
          <div 
            className={`h-1.5 rounded-full transition-all ${color === 'blue' ? 'bg-blue-600' : color === 'emerald' ? 'bg-emerald-600' : color === 'amber' ? 'bg-amber-600' : 'bg-indigo-600'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-600 mt-2">{subtext}</p>
    </div>
  );
};

const DocumentItem = ({ label, uploaded, action }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-3 flex-1">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        uploaded ? 'bg-emerald-100' : 'bg-slate-100'
      }`}>
        {uploaded ? (
          <CheckCircle size={16} className="text-emerald-600" />
        ) : (
          <AlertCircle size={16} className="text-slate-400" />
        )}
      </div>
      <span className={`font-semibold ${uploaded ? 'text-slate-800' : 'text-slate-600'}`}>
        {label}
      </span>
    </div>
    <div className="text-right">
      {uploaded ? (
        <span className="text-xs font-bold text-emerald-600">✓ Uploaded</span>
      ) : (
        action && <div>{action}</div>
      )}
    </div>
  </div>
);

const DateItem = ({ date, event, status }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
    <div className={`px-3 py-2 rounded-lg text-xs font-bold ${
      status === 'active' 
        ? 'bg-blue-100 text-blue-700' 
        : 'bg-slate-100 text-slate-600'
    }`}>
      {date}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-slate-900">{event}</p>
      <p className="text-xs text-slate-500 mt-1">
        {status === 'active' ? '⏱️ Active now' : '📅 Upcoming'}
      </p>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
    <div className={`${highlight ? 'text-blue-600' : 'text-slate-400'}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-bold truncate ${highlight ? 'text-blue-600' : 'text-slate-900'}`}>
        {value || '—'}
      </p>
    </div>
  </div>
);

const ActionBtn = ({ icon, label, href, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
  };
  
  return (
    <Link to={href} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${colors[color]}`}>
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
};

const CheckItem = ({ done, text }) => (
  <div className="flex items-center gap-2">
    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
      done 
        ? 'bg-emerald-600 border-emerald-600' 
        : 'border-slate-300'
    }`}>
      {done && <CheckCircle size={12} className="text-white" fill="white" />}
    </div>
    <span className={`text-sm ${done ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>
      {text}
    </span>
  </div>
);

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
