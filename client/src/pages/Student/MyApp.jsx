import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { FileText, CheckCircle, Download, Clock, MapPin, Phone, Mail, User } from 'lucide-react';

const MyApp = () => {
  return (
    <MainLayout role="student">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Application Overview</h1>
            <p className="text-slate-500">View your submitted details and current status</p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                <Download size={18} /> Download JSON
             </button>
             <button className="btn-primary flex items-center gap-2">
                <Download size={18} /> Print PDF
             </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-1 text-white shadow-xl">
           <div className="bg-[#1e1e1e]/20 backdrop-blur-sm rounded-[22px] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                    84%
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold">Application Verified</h2>
                    <p className="text-blue-100 italic">Your documents have been verified by the board.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl border border-white/10">
                 <CheckCircle size={32} className="text-emerald-400" />
                 <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Current Phase</p>
                    <p className="text-xl font-bold">Counseling Prep</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Details Sections */}
           <div className="lg:col-span-2 space-y-8">
              <Section title="Personal Information" icon={<User size={20} />}>
                 <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                    <DetailItem label="Full Name" value="Rajesh Kumar S" />
                    <DetailItem label="Date of Birth" value="12 May 2008" />
                    <DetailItem label="Gender" value="Male" />
                    <DetailItem label="Aadhaar" value="XXXX-XXXX-8829" />
                    <DetailItem label="Community" value="BC (Backward Class)" />
                    <DetailItem label="Blood Group" value="O+ Positive" />
                 </div>
              </Section>

              <Section title="Academic Performance" icon={<FileText size={20} />}>
                 <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                       <thead className="bg-slate-100/50">
                          <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <th className="px-6 py-3">Subject</th>
                             <th className="px-6 py-3">Theory</th>
                             <th className="px-6 py-3">Practical</th>
                             <th className="px-6 py-3">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          <tr className="text-sm">
                             <td className="px-6 py-4 font-bold text-slate-700">Mathematics</td>
                             <td className="px-6 py-4">98</td>
                             <td className="px-6 py-4">-</td>
                             <td className="px-6 py-4 font-bold text-blue-600">98/100</td>
                          </tr>
                          <tr className="text-sm">
                             <td className="px-6 py-4 font-bold text-slate-700">Physics</td>
                             <td className="px-6 py-4">78</td>
                             <td className="px-6 py-4">20</td>
                             <td className="px-6 py-4 font-bold text-blue-600">98/100</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </Section>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-8">
              <Section title="Quick Contacts" icon={<Phone size={20} />}>
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <Mail className="text-blue-500" size={18} />
                       <span className="text-sm text-slate-600">rajesh.s@email.com</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <Phone className="text-emerald-500" size={18} />
                       <span className="text-sm text-slate-600">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <MapPin className="text-rose-500" size={18} />
                       <span className="text-sm text-slate-600">Chennai, Tamil Nadu</span>
                    </div>
                 </div>
              </Section>

              <Section title="Recent Activity" icon={<Clock size={20} />}>
                 <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <ActivityItem title="Application Submitted" time="15 Apr, 10:20 AM" />
                    <ActivityItem title="Payment Successful" time="15 Apr, 10:25 AM" />
                    <ActivityItem title="Documents Uploaded" time="15 Apr, 11:00 AM" />
                 </div>
              </Section>
           </div>
        </div>
      </div>
    </MainLayout>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
     <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">{icon}</div>
        <h3 className="font-bold text-slate-900">{title}</h3>
     </div>
     {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="font-semibold text-slate-800">{value}</p>
  </div>
);

const ActivityItem = ({ title, time }) => (
  <div className="pl-8 relative">
     <div className="absolute left-1 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white "></div>
     <p className="text-sm font-bold text-slate-800">{title}</p>
     <p className="text-[10px] text-slate-400">{time}</p>
  </div>
);

export default MyApp;
