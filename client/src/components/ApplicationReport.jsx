import React from 'react';
import { Calendar, MapPin, Phone, Mail, User, BookOpen, Award } from 'lucide-react';

const ApplicationReport = ({ data }) => {
  const s = data?.student;
  const m = data?.marks;

  if (!s) return null;

  const handlePrint = () => {
    window.print();
  };

  const subjects = m ? [
    { name: m.hsc_subject1, obtained: m.hsc_subject1_obtained_mark, max: m.hsc_subject1_max_mark },
    { name: m.hsc_subject2, obtained: m.hsc_subject2_obtained_mark, max: m.hsc_subject2_max_mark },
    { name: m.hsc_subject3, obtained: m.hsc_subject3_obtained_mark, max: m.hsc_subject3_max_mark },
    { name: m.hsc_subject4, obtained: m.hsc_subject4_obtained_mark, max: m.hsc_subject4_max_mark },
    { name: m.hsc_subject5, obtained: m.hsc_subject5_obtained_mark, max: m.hsc_subject5_max_mark },
    { name: m.hsc_subject6, obtained: m.hsc_subject6_obtained_mark, max: m.hsc_subject6_max_mark },
  ].filter(sub => sub.name) : [];

  const sslcSubjects = m ? [
    { name: m.sslc_subject1, obtained: m.sslc_subject1_obtained_mark, max: m.sslc_subject1_max_mark },
    { name: m.sslc_subject2, obtained: m.sslc_subject2_obtained_mark, max: m.sslc_subject2_max_mark },
    { name: m.sslc_subject3, obtained: m.sslc_subject3_obtained_mark, max: m.sslc_subject3_max_mark },
    { name: m.sslc_subject4, obtained: m.sslc_subject4_obtained_mark, max: m.sslc_subject4_max_mark },
    { name: m.sslc_subject5, obtained: m.sslc_subject5_obtained_mark, max: m.sslc_subject5_max_mark },
  ].filter(sub => sub.name) : [];

  return (
    <div className="w-full print:w-full">
      {/* Print Button - Hidden when printing */}
      <div className="print:hidden mb-6">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-200 flex items-center gap-2"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Report Container - Optimized for Print */}
      <div className="bg-white p-8 print:p-4 print:max-w-full print:shadow-none"
        style={{
          '@media print': {
            margin: '0',
            padding: '0.5in'
          }
        }}
      >
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-slate-300 print:mb-4 print:pb-4">
          <div className="text-center mb-6 print:mb-3">
            <h1 className="text-3xl font-bold text-slate-900 print:text-2xl">ADMISSION APPLICATION FORM</h1>
            <p className="text-slate-500 text-sm mt-2 print:text-xs">DOTE - Department of Technical Education</p>
            {s.application_no && (
              <div className="mt-4 inline-block bg-emerald-50 px-6 py-3 rounded-lg border border-emerald-200">
                <p className="text-emerald-900 font-bold">Application No: <span className="text-emerald-600">{s.application_no}</span></p>
                <p className="text-emerald-700 text-sm">Status: SUBMITTED</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 print:gap-4 print:mb-4">
          {/* Passport Photo */}
          <div className="lg:col-span-1 flex flex-col items-center gap-4 print:gap-2">
            <div className="w-50 h-55 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-md flex items-center justify-center print:w-32 print:h-40 print:shadow-none print:rounded-sm">
              {s.photo ? (
                <img
                  src={s.photo}
                  alt="Passport Photo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={80} className="text-slate-300" />
              )}
            </div>
            <div className="text-center text-xs text-slate-600 max-w-50 print:text-[8px]">
              <p className="font-bold">Passport Size Photo</p>
              <p className="text-[10px] print:text-[7px]">3.5cm × 4.5cm</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-500 print:text-lg print:mb-3 print:pb-2">Personal Information</h2>
            
            <div className="grid grid-cols-2 gap-6 print:gap-3">
              <DetailField label="Full Name" value={s.student_name} icon={<User size={16} />} />
              <DetailField label="Date of Birth" value={s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'} icon={<Calendar size={16} />} />
              
              <DetailField label="Gender" value={s.gender} icon={<User size={16} />} />
              <DetailField label="Aadhaar Number" value={s.aadhar ? `XXXX-XXXX-${String(s.aadhar).slice(-4)}` : '—'} />
              
              <DetailField label="Community" value={s.community} />
              <DetailField label="Religion" value={s.religion} />
              
              <DetailField label="Caste" value={s.caste} />
              <DetailField label="Category" value={s.category || '—'} />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200 print:mb-4 print:p-3 print:bg-white print:border-slate-300 print:rounded-sm print:break-inside-avoid">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 print:text-base print:mb-2">
            <Phone size={18} className="print:hidden" /> Contact Information
          </h2>
          <div className="grid grid-cols-2 gap-6 print:gap-3">
            <DetailField label="Mobile Number" value={s.mobile} icon={<Phone size={16} />} />
            <DetailField label="Alternative Mobile" value={s.alt_mobile || '—'} />
            <DetailField label="Email" value={s.email || '—'} icon={<Mail size={16} />} />
            <DetailField label="State" value={s.state} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300 print:mt-2 print:pt-2">
            <p className="text-sm font-bold text-slate-700 mb-2 print:text-xs print:mb-1">Communication Address:</p>
            <p className="text-sm text-slate-600 print:text-xs">{s.communication_address || '—'}</p>
          </div>
        </div>

        {/* Parental Information */}
        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200 print:mb-4 print:p-3 print:bg-white print:border-slate-300 print:rounded-sm print:break-inside-avoid">
          <h2 className="text-lg font-bold text-slate-900 mb-4 print:text-base print:mb-2">Parental Information</h2>
          <div className="grid grid-cols-2 gap-6 print:gap-3">
            <DetailField label="Father's Name" value={s.father_name} />
            <DetailField label="Father's Occupation" value={s.father_occupation || '—'} />
            <DetailField label="Mother's Name" value={s.mother_name} />
            <DetailField label="Mother's Occupation" value={s.mother_occupation || '—'} />
            <DetailField label="Annual Income" value={s.parent_annual_income ? `₹${Number(s.parent_annual_income).toLocaleString('en-IN')}` : '—'} />
            <DetailField label="Guardian" value={s.guardian || '—'} />
          </div>
        </div>

        {/* Academic Information */}
        {m && (
          <div className="mb-8 print:mb-4 print:break-inside-avoid">
            {/* Qualifying Board */}
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200 print:mb-3 print:p-2 print:bg-white print:border-slate-300 print:rounded-sm">
              <h3 className="font-bold text-emerald-900 print:text-slate-900 print:text-sm">Qualifying Board: <span className="text-emerald-600 print:text-slate-700">{m.qualifying_board}</span></h3>
              <p className="text-sm text-emerald-800 mt-1 print:text-xs print:text-slate-700 print:mt-0">Year: {m.year_of_passing}</p>
            </div>

            {/* HSC Marks */}
            {subjects.length > 0 && (
              <div className="mb-6 print:mb-4 print:break-inside-avoid">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 print:text-base print:mb-2">
                  <BookOpen size={18} className="print:hidden" /> HSC Academic Performance
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse print:text-xs">
                    <thead>
                      <tr className="bg-blue-100 print:bg-blue-50">
                        <th className="border border-slate-300 p-3 text-left font-bold text-slate-900 print:p-1 print:text-xs">Subject</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Obtained</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Max Marks</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub, idx) => (
                        <tr key={idx} className="even:bg-slate-50 hover:bg-blue-50 print:even:bg-white print:hover:bg-white">
                          <td className="border border-slate-300 p-3 text-slate-700 print:p-1 print:text-xs">{sub.name}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 font-bold print:p-1 print:font-normal print:text-xs">{sub.obtained}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 print:p-1 print:text-xs">{sub.max}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 print:p-1 print:text-xs">
                            {sub.obtained && sub.max ? ((sub.obtained / sub.max) * 100).toFixed(2) : '—'}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 print:mt-2 print:gap-2">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 print:p-2 print:bg-white print:border-slate-300 print:rounded-sm">
                    <p className="text-sm text-emerald-700 font-bold print:text-xs print:text-slate-700">HSC Percentage</p>
                    <p className="text-2xl font-bold text-emerald-600 print:text-lg print:text-slate-700">{m.hsc_percentage || '—'}%</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 print:p-2 print:bg-white print:border-slate-300 print:rounded-sm">
                    <p className="text-sm text-purple-700 font-bold print:text-xs print:text-slate-700">HSC Cutoff Score</p>
                    <p className="text-2xl font-bold text-purple-600 print:text-lg print:text-slate-700">{m.hsc_cutoff || '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SSLC Marks */}
            {sslcSubjects.length > 0 && (
              <div className="mb-6 print:mb-4 print:break-inside-avoid">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 print:text-base print:mb-2">
                  <Award size={18} className="print:hidden" /> SSLC Academic Performance
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse print:text-xs">
                    <thead>
                      <tr className="bg-orange-100 print:bg-orange-50">
                        <th className="border border-slate-300 p-3 text-left font-bold text-slate-900 print:p-1 print:text-xs">Subject</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Obtained</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Max Marks</th>
                        <th className="border border-slate-300 p-3 text-center font-bold text-slate-900 print:p-1 print:text-xs">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sslcSubjects.map((sub, idx) => (
                        <tr key={idx} className="even:bg-slate-50 hover:bg-orange-50 print:even:bg-white print:hover:bg-white">
                          <td className="border border-slate-300 p-3 text-slate-700 print:p-1 print:text-xs">{sub.name}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 font-bold print:p-1 print:font-normal print:text-xs">{sub.obtained}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 print:p-1 print:text-xs">{sub.max}</td>
                          <td className="border border-slate-300 p-3 text-center text-slate-700 print:p-1 print:text-xs">
                            {sub.obtained && sub.max ? ((sub.obtained / sub.max) * 100).toFixed(2) : '—'}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 print:mt-2">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 w-fit print:p-2 print:bg-white print:border-slate-300 print:rounded-sm">
                    <p className="text-sm text-orange-700 font-bold print:text-xs print:text-slate-700">SSLC Percentage</p>
                    <p className="text-2xl font-bold text-orange-600 print:text-lg print:text-slate-700">{m.sslc_percentage || '—'}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-slate-300 text-center text-sm text-slate-600 print:mt-6 print:pt-3 print:border-t print:text-xs print:page-break-before-avoid">
          <p>This is an official admission application document. Please keep a copy for your records.</p>
          <p className="mt-2 print:mt-1">Generated on {new Date().toLocaleDateString('en-IN')} at {new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

const DetailField = ({ label, value, icon }) => (
  <div className="print:mb-1">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide print:text-[10px] print:tracking-normal">{label}</label>
    <div className="flex items-center gap-2 mt-1 print:mt-0">
      {icon && <span className="text-slate-400 print:hidden">{icon}</span>}
      <p className="text-slate-900 font-medium print:text-xs print:font-normal">{value || '—'}</p>
    </div>
  </div>
);

export default ApplicationReport;
