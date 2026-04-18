import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { ArrowLeft, User, FileText, Phone, MapPin, Award } from 'lucide-react';
import axios from 'axios';

const ApplicationDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/college/applications/${id}`, { withCredentials: true })
      .then(res => { if (res.data.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <MainLayout role="college"><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></MainLayout>;
  if (!data) return <MainLayout role="college"><div className="flex items-center justify-center h-64 text-slate-500">Application not found.</div></MainLayout>;

  const s = data.student;
  const m = data.marks;
  const subjects = m ? [
    { name: m.hsc_subject1, obt: m.hsc_subject1_obtained_mark, max: m.hsc_subject1_max_mark },
    { name: m.hsc_subject2, obt: m.hsc_subject2_obtained_mark, max: m.hsc_subject2_max_mark },
    { name: m.hsc_subject3, obt: m.hsc_subject3_obtained_mark, max: m.hsc_subject3_max_mark },
    { name: m.hsc_subject4, obt: m.hsc_subject4_obtained_mark, max: m.hsc_subject4_max_mark },
    { name: m.hsc_subject5, obt: m.hsc_subject5_obtained_mark, max: m.hsc_subject5_max_mark },
    { name: m.hsc_subject6, obt: m.hsc_subject6_obtained_mark, max: m.hsc_subject6_max_mark },
  ].filter(sub => sub.name) : [];

  return (
    <MainLayout role="college">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/college/applications" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{s.student_name}</h1>
            <p className="text-blue-600 font-semibold">{s.application_no}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Personal Details" icon={<User size={20} />}>
              <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                <Item label="Full Name" value={s.student_name} />
                <Item label="Date of Birth" value={s.dob ? new Date(s.dob).toLocaleDateString('en-IN') : '—'} />
                <Item label="Gender" value={s.gender} />
                <Item label="Aadhaar" value={s.aadhar ? `XXXX-${String(s.aadhar).slice(-4)}` : '—'} />
                <Item label="Religion" value={s.religion} />
                <Item label="Community" value={s.community} />
                <Item label="Caste" value={s.caste} />
                <Item label="Admission Type" value={s.standard_studied || '—'} />
                <Item label="Father's Name" value={s.father_name} />
                <Item label="Mother's Name" value={s.mother_name} />
                <Item label="Parent Occupation" value={s.parent_occupation} />
                <Item label="Annual Income" value={s.parent_annual_income ? `₹${Number(s.parent_annual_income).toLocaleString('en-IN')}` : '—'} />
              </div>
            </Section>

            {subjects.length > 0 && (
              <Section title="HSC Marks" icon={<FileText size={20} />}>
                <table className="w-full text-left bg-slate-50 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr className="text-xs font-bold text-slate-500 uppercase">
                      <th className="px-4 py-3">Subject</th><th className="px-4 py-3">Obtained</th><th className="px-4 py-3">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((sub, i) => (
                      <tr key={i}><td className="px-4 py-3 font-semibold text-slate-700">{sub.name}</td><td className="px-4 py-3 font-bold text-blue-600">{sub.obt || '—'}</td><td className="px-4 py-3">{sub.max || '—'}</td></tr>
                    ))}
                    {m?.hsc_percentage && <tr className="bg-blue-50"><td className="px-4 py-3 font-bold">Overall</td><td className="px-4 py-3 font-bold text-blue-700">{m.hsc_percentage}%</td><td className="px-4 py-3 font-semibold">Cutoff: {m.hsc_cutoff || '—'}</td></tr>}
                  </tbody>
                </table>
              </Section>
            )}

            {m && (m.sslc_register_no || m.sslc_subject1_obtained_mark) && (
              <Section title="SSLC Marks" icon={<FileText size={20} />}>
                <div className="mb-3 grid md:grid-cols-2 gap-2">
                  <Item label="Register No" value={m.sslc_register_no} />
                  <Item label="Percentage" value={m.sslc_percentage ? `${m.sslc_percentage}%` : '—'} />
                </div>
                <table className="w-full text-left bg-slate-50 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr className="text-xs font-bold text-slate-500 uppercase">
                      <th className="px-4 py-3">Subject</th><th className="px-4 py-3">Obtained</th><th className="px-4 py-3">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[1,2,3,4,5].map(n => m[`sslc_subject${n}`] && (
                      <tr key={n}><td className="px-4 py-3 font-semibold text-slate-700">{m[`sslc_subject${n}`]}</td><td className="px-4 py-3 font-bold text-blue-600">{m[`sslc_subject${n}_obtained_mark`] || '—'}</td><td className="px-4 py-3">{m[`sslc_subject${n}_max_mark`] || '—'}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            )}
          </div>

          <div className="space-y-6">
            <Section title="Contact" icon={<Phone size={20} />}>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><Phone size={16} className="text-emerald-500 shrink-0 mt-0.5" /><span>{s.mobile || '—'}</span></div>
                <div className="flex gap-3"><span className="text-blue-500 font-bold text-xs mt-0.5">@</span><span>{s.email || '—'}</span></div>
                <div className="flex gap-3"><MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" /><span>{s.communication_address || '—'}</span></div>
              </div>
            </Section>

            <Section title="Special Category" icon={<Award size={20} />}>
              <div className="space-y-2">
                <Flag label="Differently Abled" active={s.differently_abled === 'yes'} />
                <Flag label="Ex-Serviceman's Ward" active={s.ex_servicemen === 'yes'} />
                <Flag label="Sports Person" active={s.eminent_sports === 'yes'} />
                <Flag label="Govt School Student" active={s.school_type === 'govt'} />
                <Flag label="Hostel Required" active={s.hostel_choice === 'yes'} />
              </div>
            </Section>

            <Section title="College Preferences" icon={<FileText size={20} />}>
              {s.college_choices ? (
                <div className="space-y-2">
                  {(JSON.parse(s.college_choices) || []).filter(Boolean).map((code, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i+1}</span>
                      <span className="text-sm font-semibold text-slate-700">{code}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-slate-400">No preferences set</p>}
            </Section>

            <Section title="Documents" icon={<FileText size={20} />}>
              <div className="space-y-2">
                <DocLink label="Photo" path={s.photo} />
                <DocLink label="Transfer Cert" path={s.transfer_certificate} />
                <DocLink label="Marksheet" path={s.marksheet_certificate} />
                <DocLink label="Community Cert" path={s.community_certificate} />
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
    <div className="flex items-center gap-3 mb-5"><div className="p-2 bg-slate-50 text-slate-400 rounded-lg">{icon}</div><h3 className="font-bold text-slate-900">{title}</h3></div>
    {children}
  </div>
);

const Item = ({ label, value }) => (
  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p><p className="font-semibold text-slate-800">{value || '—'}</p></div>
);

const Flag = ({ label, active }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${active ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-400'}`}>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-300'}`} />{label}
  </div>
);

const DocLink = ({ label, path }) => (
  <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${path ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
    <span className="font-semibold">{label}</span>
    {path ? <a href={path} target="_blank" rel="noreferrer" className="text-xs underline font-bold">View</a> : <span className="text-xs">Pending</span>}
  </div>
);

export default ApplicationDetail;
