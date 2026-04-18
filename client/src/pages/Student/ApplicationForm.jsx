import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, Upload, User, MapPin,
  Briefcase, GraduationCap, ClipboardList, Award, School, FileCheck, Loader
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Personal Details', icon: <User size={18} /> },
  { id: 2, title: 'Contact Info', icon: <MapPin size={18} /> },
  { id: 3, title: 'Parent Details', icon: <Briefcase size={18} /> },
  { id: 4, title: 'Academic History', icon: <GraduationCap size={18} /> },
  { id: 5, title: 'Marks Entry', icon: <ClipboardList size={18} /> },
  { id: 6, title: 'Educational Hist', icon: <School size={18} /> },
  { id: 7, title: 'Special Category', icon: <Award size={18} /> },
  { id: 8, title: 'College Choice', icon: <School size={18} /> },
  { id: 9, title: 'Uploads', icon: <FileCheck size={18} /> },
];

const defaultForm = {
  // Step 1
  fullName: '', dob: '', gender: '', aadhaar: '', religion: '', community: '', caste: '',
  admissionType: 'First Year', motherTongue: '', mediumOfInstruction: '', nativity: '',
  // Step 2
  email: '', alternateMobile: '', commAddress: '', permAddress: '', sameAsComm: false,
  // Step 3
  fatherName: '', motherName: '', parentOccupation: '', annualIncome: '',
  // Step 4
  qualifyingBoard: '', registerNumber: '', lastInstitute: '', lastInstituteDistrict: '',
  // Step 5 HSC
  hscRegisterNo: '', hscExamType: '', hscMajorStream: '',
  sub1Name: 'English', sub1Obtained: '', sub1Max: '100',
  sub2Name: 'Maths', sub2Obtained: '', sub2Max: '100',
  sub3Name: 'Physics', sub3Obtained: '', sub3Max: '100',
  sub4Name: 'Chemistry', sub4Obtained: '', sub4Max: '100',
  sub5Name: '', sub5Obtained: '', sub5Max: '100',
  sub6Name: '', sub6Obtained: '', sub6Max: '100',
  hscPercentage: '', hscCutoff: '',
  // Step 6 SSLC
  sslc: 'yes', sslcRegisterNo: '', sslcMarksheetNo: '',
  sslcSub1: 'Tamil', sslcSub1Obt: '', sslcSub1Max: '100',
  sslcSub2: 'English', sslcSub2Obt: '', sslcSub2Max: '100',
  sslcSub3: 'Maths', sslcSub3Obt: '', sslcSub3Max: '100',
  sslcSub4: 'Science', sslcSub4Obt: '', sslcSub4Max: '100',
  sslcSub5: 'Social', sslcSub5Obt: '', sslcSub5Max: '100',
  sslcPercentage: '',
  // Step 7
  isDifferentlyAbled: false, isExServiceman: false, isSportsPerson: false, isGovtStudent: false,
  // Step 8
  hostelRequired: false, womensHostel: false, preferences: ['', '', ''],
  // Step 9 file paths
  photoPath: '', tcPath: '', marksheetPath: '', communityPath: '',
};

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [master, setMaster] = useState(null); // all dropdown options from DB
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([loadSavedData(), loadMaster(), loadColleges()])
      .finally(() => setLoading(false));
  }, []);

  // AUTO-UPDATE SUBJECTS WHEN BOARD CHANGES
  useEffect(() => {
    if (!master || !formData.qualifyingBoard) return;
    
    const board = formData.qualifyingBoard?.trim().toLocaleLowerCase();
    let subjects = [];
    
    if (board?.includes('cbse')) subjects = master.cbseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    else if (board?.includes('icse')) subjects = master.icseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Science'];
    else if (board?.includes('state') || board?.includes('board')) subjects = master.stateBoardSubjects || ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology'];
    else if (board?.includes('iti')) subjects = master.itiSubjects || ['Trade Practical', 'Trade Theory', 'Work Shop', 'Drawing', 'Social'];
    else if (board?.includes('vocational')) subjects = master.vocationalSubjects || ['Language', 'English', 'Maths', 'Theory', 'Practical-I', 'Practical-II'];
    else subjects = master.otherSubjects || ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'];
    
    // Update all 6 subject names with board subjects
    setFormData(prev => ({
      ...prev,
      sub1Name: subjects[0] || '',
      sub2Name: subjects[1] || '',
      sub3Name: subjects[2] || '',
      sub4Name: subjects[3] || '',
      sub5Name: subjects[4] || '',
      sub6Name: subjects[5] || '',
    }));
  }, [formData.qualifyingBoard, master]);

  // AUTO-CALCULATE HSC PERCENTAGE AND CUTOFF MARK BASED ON MARKS ENTERED
  useEffect(() => {
    const marks = [
      { obt: formData.sub1Obtained, max: formData.sub1Max },
      { obt: formData.sub2Obtained, max: formData.sub2Max },
      { obt: formData.sub3Obtained, max: formData.sub3Max },
      { obt: formData.sub4Obtained, max: formData.sub4Max },
      { obt: formData.sub5Obtained, max: formData.sub5Max },
      { obt: formData.sub6Obtained, max: formData.sub6Max },
    ];

    // Calculate totals - only count if both obtained and max are filled
    let totalObtained = 0;
    let totalMax = 0;
    let hasMarks = false;

    marks.forEach(m => {
      if (m.obt && m.max) {
        totalObtained += Number(m.obt) || 0;
        totalMax += Number(m.max) || 0;
        hasMarks = true;
      }
    });

    // Calculate percentage and cutoff
    if (hasMarks && totalMax > 0) {
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      const cutoff = ((totalObtained / totalMax) * 200).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        hscPercentage: percentage,
        hscCutoff: cutoff,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hscPercentage: '',
        hscCutoff: '',
      }));
    }
  }, [
    formData.sub1Obtained, formData.sub1Max,
    formData.sub2Obtained, formData.sub2Max,
    formData.sub3Obtained, formData.sub3Max,
    formData.sub4Obtained, formData.sub4Max,
    formData.sub5Obtained, formData.sub5Max,
    formData.sub6Obtained, formData.sub6Max,
  ]);

  // AUTO-CALCULATE SSLC PERCENTAGE BASED ON MARKS ENTERED
  useEffect(() => {
    const sslcMarks = [
      { obt: formData.sslcSub1Obt, max: formData.sslcSub1Max },
      { obt: formData.sslcSub2Obt, max: formData.sslcSub2Max },
      { obt: formData.sslcSub3Obt, max: formData.sslcSub3Max },
      { obt: formData.sslcSub4Obt, max: formData.sslcSub4Max },
      { obt: formData.sslcSub5Obt, max: formData.sslcSub5Max },
    ];

    // Calculate totals - only count if both obtained and max are filled
    let totalObtained = 0;
    let totalMax = 0;
    let hasMarks = false;

    sslcMarks.forEach(m => {
      if (m.obt && m.max) {
        totalObtained += Number(m.obt) || 0;
        totalMax += Number(m.max) || 0;
        hasMarks = true;
      }
    });

    // Calculate percentage
    if (hasMarks && totalMax > 0) {
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        sslcPercentage: percentage,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sslcPercentage: '',
      }));
    }
  }, [
    formData.sslcSub1Obt, formData.sslcSub1Max,
    formData.sslcSub2Obt, formData.sslcSub2Max,
    formData.sslcSub3Obt, formData.sslcSub3Max,
    formData.sslcSub4Obt, formData.sslcSub4Max,
    formData.sslcSub5Obt, formData.sslcSub5Max,
  ]);
  // CLEAR WOMEN'S HOSTEL PREFERENCE IF GENDER IS NOT FEMALE
  useEffect(() => {
    if (formData.gender && formData.gender?.toLowerCase() !== 'female' && formData.womensHostel) {
      setFormData(prev => ({
        ...prev,
        womensHostel: false,
      }));
    }
  }, [formData.gender]);
  const loadSavedData = async () => {
    try {
      const res = await axios.get('/api/student/me', { withCredentials: true });
      if (!res.data.success) return;
      const s = res.data.student;
      const m = res.data.marks;
      setIsSubmitted(res.data.isSubmitted);
      setApplicationNo(res.data.applicationNo || '');
      setFormData(prev => ({
        ...prev,
        fullName: s.student_name || '',
        dob: s.dob ? s.dob.split('T')[0] : '',
        gender: s.gender || '',
        aadhaar: s.aadhar || '',
        religion: s.religion || '',
        community: s.community || '',
        caste: s.caste || '',
        motherTongue: s.mother_tongue || '',
        mediumOfInstruction: s.medium_of_instruction || '',
        nativity: s.nativity || '',
        email: s.email || '',
        alternateMobile: s.alt_mobile ? String(s.alt_mobile) : '',
        commAddress: s.communication_address || '',
        permAddress: s.permanent_address || '',
        fatherName: s.father_name || '',
        motherName: s.mother_name || '',
        parentOccupation: s.parent_occupation || '',
        annualIncome: s.parent_annual_income || '',
        qualifyingBoard: s.last_institution_board || '',
        registerNumber: s.last_institution_register_no || '',
        lastInstitute: s.last_institution_name || '',
        lastInstituteDistrict: s.last_institution_district || '',
        isDifferentlyAbled: s.differently_abled === 'yes',
        isExServiceman: s.ex_servicemen === 'yes',
        isSportsPerson: s.eminent_sports === 'yes',
        isGovtStudent: s.school_type === 'govt',
        hostelRequired: s.hostel_choice === 'yes',
        womensHostel: s.womens_choice === 'yes',
        preferences: s.college_choices ? (() => { try { return JSON.parse(s.college_choices); } catch { return ['','','']; } })() : ['', '', ''],
        photoPath: s.photo || '',
        tcPath: s.transfer_certificate || '',
        marksheetPath: s.marksheet_certificate || '',
        communityPath: s.community_certificate || '',
        ...(m ? {
          hscRegisterNo: m.hsc_register_no || '',
          hscExamType: m.hsc_exam_type || '',
          hscMajorStream: m.hsc_major_stream || '',
          sub1Name: m.hsc_subject1 || 'English', sub1Obtained: m.hsc_subject1_obtained_mark || '', sub1Max: m.hsc_subject1_max_mark || '100',
          sub2Name: m.hsc_subject2 || 'Maths', sub2Obtained: m.hsc_subject2_obtained_mark || '', sub2Max: m.hsc_subject2_max_mark || '100',
          sub3Name: m.hsc_subject3 || 'Physics', sub3Obtained: m.hsc_subject3_obtained_mark || '', sub3Max: m.hsc_subject3_max_mark || '100',
          sub4Name: m.hsc_subject4 || 'Chemistry', sub4Obtained: m.hsc_subject4_obtained_mark || '', sub4Max: m.hsc_subject4_max_mark || '100',
          sub5Name: m.hsc_subject5 || '', sub5Obtained: m.hsc_subject5_obtained_mark || '', sub5Max: m.hsc_subject5_max_mark || '100',
          sub6Name: m.hsc_subject6 || '', sub6Obtained: m.hsc_subject6_obtained_mark || '', sub6Max: m.hsc_subject6_max_mark || '100',
          hscPercentage: m.hsc_percentage || '', hscCutoff: m.hsc_cutoff || '',
          sslcRegisterNo: m.sslc_register_no || '', sslcMarksheetNo: m.sslc_marksheet_no || '',
          sslcSub1: m.sslc_subject1 || 'Tamil', sslcSub1Obt: m.sslc_subject1_obtained_mark || '', sslcSub1Max: m.sslc_subject1_max_mark || '100',
          sslcSub2: m.sslc_subject2 || 'English', sslcSub2Obt: m.sslc_subject2_obtained_mark || '', sslcSub2Max: m.sslc_subject2_max_mark || '100',
          sslcSub3: m.sslc_subject3 || 'Maths', sslcSub3Obt: m.sslc_subject3_obtained_mark || '', sslcSub3Max: m.sslc_subject3_max_mark || '100',
          sslcSub4: m.sslc_subject4 || 'Science', sslcSub4Obt: m.sslc_subject4_obtained_mark || '', sslcSub4Max: m.sslc_subject4_max_mark || '100',
          sslcSub5: m.sslc_subject5 || 'Social', sslcSub5Obt: m.sslc_subject5_obtained_mark || '', sslcSub5Max: m.sslc_subject5_max_mark || '100',
          sslcPercentage: m.sslc_percentage || '',
        } : {}),
      }));
    } catch {}
  };

  const loadMaster = async () => {
    try {
      const res = await axios.get('/api/master');
      setMaster(res.data);
    } catch {}
  };

  const loadColleges = async () => {
    try {
      const res = await axios.get('/api/colleges/list');
      setColleges(res.data.colleges || []);
    } catch {}
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePreferenceChange = (index, value) => {
    setFormData(prev => {
      const prefs = [...prev.preferences];
      prefs[index] = value;
      return { ...prev, preferences: prefs };
    });
  };

  const handleFileUpload = async (file, docType) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await axios.post(`/api/student/upload?docType=${docType}`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        const pathKey = { photo: 'photoPath', tc: 'tcPath', marksheet: 'marksheetPath', community: 'communityPath' }[docType];
        setFormData(prev => ({ ...prev, [pathKey]: res.data.path }));
        toast.success('File uploaded successfully!');
      }
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  const saveCurrentStep = async () => {
    if (currentStep === 9) return true;
    setSaving(true);
    try {
      await axios.put(`/api/student/step/${currentStep}`, formData, { withCredentials: true });
      return true;
    } catch {
      toast.error('Failed to save. Please check your connection.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (isSubmitted) { setCurrentStep(p => Math.min(p + 1, steps.length)); return; }
    const saved = await saveCurrentStep();
    if (saved) {
      toast.success(`Step ${currentStep} saved!`, { autoClose: 1200 });
      setCurrentStep(p => Math.min(p + 1, steps.length));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitted) { navigate('/student/my-application'); return; }
    setSaving(true);
    try {
      const res = await axios.post('/api/student/submit', {}, { withCredentials: true });
      if (res.data.success) {
        setIsSubmitted(true);
        setApplicationNo(res.data.applicationNo);
        toast.success(`Application submitted! ID: ${res.data.applicationNo}`);
        setTimeout(() => navigate('/student/my-application'), 2000);
      }
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <MainLayout role="student">
      <div className="flex items-center justify-center h-96 gap-3 text-slate-400">
        <Loader size={24} className="animate-spin" /> Loading your application...
      </div>
    </MainLayout>
  );

  const onFormAction = currentStep === steps.length ? handleSubmit : handleNext;

  return (
    <MainLayout role="student">
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Application Form</h1>
          <p className="text-slate-500">Please fill all the details carefully. Each step is auto-saved.</p>
          {isSubmitted && applicationNo && (
            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl font-semibold text-sm">
              <Check size={16} /> Submitted — App No: {applicationNo}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex justify-between items-center min-w-full">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all
                  ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                  {currentStep > step.id ? <Check size={20} /> : step.icon}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-600 absolute -bottom-6 w-max">{step.title}</div>
                {step.id < steps.length && (
                  <div className={`absolute left-1/2 top-5 w-full h-0.5 z-0 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={onFormAction} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {currentStep === 1 && <PersonalDetails data={formData} onChange={handleInputChange} master={master} />}
              {currentStep === 2 && <ContactInfo data={formData} onChange={handleInputChange} />}
              {currentStep === 3 && <ParentDetails data={formData} onChange={handleInputChange} master={master} />}
              {currentStep === 4 && <AcademicHistory data={formData} onChange={handleInputChange} master={master} />}
              {currentStep === 5 && <MarksEntry data={formData} onChange={handleInputChange} master={master} />}
              {currentStep === 6 && <DetailedHistory data={formData} onChange={handleInputChange} />}
              {currentStep === 7 && <SpecialCategory data={formData} onChange={handleInputChange} />}
              {currentStep === 8 && <CollegeChoice data={formData} onChange={handleInputChange} onPrefChange={handlePreferenceChange} colleges={colleges} master={master} />}
              {currentStep === 9 && <DocumentUploads data={formData} onUpload={handleFileUpload} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
            <button type="button" onClick={() => setCurrentStep(p => Math.max(p - 1, 1))} disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-50'}`}>
              <ChevronLeft size={20} /> Previous
            </button>
            <button type="submit" disabled={saving}
              className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl disabled:opacity-70">
              {saving
                ? <><Loader size={18} className="animate-spin" /> Saving...</>
                : currentStep === steps.length
                  ? (isSubmitted ? 'View Application' : 'Final Submit')
                  : 'Save & Next'}
              {!saving && <ChevronRight size={20} />}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

// ─────────────────────────────────────────────────────────
// Reusable helpers
// ─────────────────────────────────────────────────────────
const SectionTitle = ({ title }) => (
  <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-2">{title}</h3>
);

const InputGroup = ({ label, name, type = 'text', ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input type={type} name={name} className="input-field" {...props} />
  </div>
);

// Dynamic select — options come from DB master data
const SelectGroup = ({ label, name, options = [], value, onChange, required, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select name={name} className="input-field" value={value} onChange={onChange} required={required}>
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const CheckboxCard = ({ label, name, checked, onChange }) => (
  <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
    <div className="flex items-center justify-between">
      <span className={`font-semibold ${checked ? 'text-blue-700' : 'text-slate-700'}`}>{label}</span>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-5 h-5 rounded-md" />
    </div>
  </label>
);

// ─────────────────────────────────────────────────────────
// Step components
// ─────────────────────────────────────────────────────────
const PersonalDetails = ({ data, onChange, master }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="1. Personal Details" /></div>
    <InputGroup label="Full Name (As per school records)" name="fullName" value={data.fullName} onChange={onChange} required />
    <InputGroup label="Date of Birth" name="dob" type="date" value={data.dob} onChange={onChange} required />
    <SelectGroup label="Gender" name="gender" options={master?.gender || ['Male', 'Female', 'Transgender']} value={data.gender} onChange={onChange} required />
    <InputGroup label="Aadhaar Number" name="aadhaar" value={data.aadhaar} onChange={onChange} maxLength={12} placeholder="12-digit Aadhaar" required />
    <SelectGroup label="Religion" name="religion" options={master?.religion || ['Hindu', 'Christian', 'Muslim', 'Others']} value={data.religion} onChange={onChange} required />
    <SelectGroup label="Community" name="community" options={master?.community || ['BC', 'MBC', 'OBC', 'OC', 'SC/ST']} value={data.community} onChange={onChange} required />
    <InputGroup label="Caste" name="caste" value={data.caste} onChange={onChange} required />
    <SelectGroup label="Admission Type" name="admissionType" options={master?.admissionType || ['First Year', 'Lateral Entry (2nd Year)', 'Part-Time']} value={data.admissionType} onChange={onChange} required />
    <SelectGroup label="Mother Tongue" name="motherTongue" options={master?.motherTongue || ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Urdu', 'Others']} value={data.motherTongue} onChange={onChange} />
    <SelectGroup label="Medium of Instruction" name="mediumOfInstruction" options={master?.mediumOfInstruction || ['Tamil', 'English', 'Urdu', 'Others']} value={data.mediumOfInstruction} onChange={onChange} />
    <SelectGroup label="Nativity" name="nativity" options={master?.nativity || ['Tamil Nadu', 'Other State']} value={data.nativity} onChange={onChange} />
  </div>
);

const ContactInfo = ({ data, onChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="2. Contact Information" /></div>
    <InputGroup label="Email Address" name="email" type="email" value={data.email} onChange={onChange} required />
    <InputGroup label="Alternate Mobile" name="alternateMobile" value={data.alternateMobile} onChange={onChange} placeholder="Optional" />
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Communication Address</label>
      <textarea name="commAddress" className="input-field min-h-28" value={data.commAddress} onChange={onChange} placeholder="House No, Street, City, District, PIN Code" required />
    </div>
    <div className="md:col-span-2 flex items-center gap-2 my-1">
      <input type="checkbox" name="sameAsComm" checked={data.sameAsComm} onChange={onChange} className="w-4 h-4" />
      <span className="text-sm font-medium text-slate-600">Permanent Address same as Communication Address</span>
    </div>
    {!data.sameAsComm && (
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Permanent Address</label>
        <textarea name="permAddress" className="input-field min-h-28" value={data.permAddress} onChange={onChange} placeholder="House No, Street, City, District, PIN Code" />
      </div>
    )}
  </div>
);

const ParentDetails = ({ data, onChange, master }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="3. Parent / Guardian Details" /></div>
    <InputGroup label="Father's Name" name="fatherName" value={data.fatherName} onChange={onChange} required />
    <InputGroup label="Mother's Name" name="motherName" value={data.motherName} onChange={onChange} required />
    <SelectGroup label="Parent Occupation" name="parentOccupation" options={master?.parentOccupation || ['Farmer', 'Business', 'Govt Employee', 'Private Employee', 'Daily Wages', 'Others']} value={data.parentOccupation} onChange={onChange} required />
    <InputGroup label="Annual Income (₹)" name="annualIncome" type="number" value={data.annualIncome} onChange={onChange} placeholder="In Rupees" required />
  </div>
);

const AcademicHistory = ({ data, onChange, master }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="4. Academic History" /></div>
    <SelectGroup label="Qualifying Board" name="qualifyingBoard" options={master?.qualifyingBoard || ['State Board', 'CBSE', 'ICSE', 'ITI', 'Others']} value={data.qualifyingBoard} onChange={onChange} required />
    <InputGroup label="Register Number" name="registerNumber" value={data.registerNumber} onChange={onChange} required />
    <InputGroup label="Last School / Institute Attended" name="lastInstitute" value={data.lastInstitute} onChange={onChange} required />
    <InputGroup label="Last Institute District" name="lastInstituteDistrict" value={data.lastInstituteDistrict} onChange={onChange} />
  </div>
);

const MarksEntry = ({ data, onChange, master }) => {
  // Get board-specific subjects based on qualifyingBoard selection
  const getSubjectsForBoard = () => {
    const board = data.qualifyingBoard?.trim().toLocaleLowerCase();
    if (board?.includes('cbse')) return master?.cbseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    if (board?.includes('icse')) return master?.icseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Science'];
    if (board?.includes('state') || board?.includes('board')) return master?.stateBoardSubjects || ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology'];
    if (board?.includes('iti')) return master?.itiSubjects || ['Trade Practical', 'Trade Theory', 'Work Shop', 'Drawing', 'Social'];
    if (board?.includes('vocational')) return master?.vocationalSubjects || ['Language', 'English', 'Maths', 'Theory', 'Practical-I', 'Practical-II'];
    return master?.otherSubjects || ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'];
  };

  const defaultSubjects = getSubjectsForBoard();
  const hscSubjects = [
    { nameKey: 'sub1Name', obtKey: 'sub1Obtained', maxKey: 'sub1Max', default: defaultSubjects[0] || 'Subject 1' },
    { nameKey: 'sub2Name', obtKey: 'sub2Obtained', maxKey: 'sub2Max', default: defaultSubjects[1] || 'Subject 2' },
    { nameKey: 'sub3Name', obtKey: 'sub3Obtained', maxKey: 'sub3Max', default: defaultSubjects[2] || 'Subject 3' },
    { nameKey: 'sub4Name', obtKey: 'sub4Obtained', maxKey: 'sub4Max', default: defaultSubjects[3] || 'Subject 4' },
    { nameKey: 'sub5Name', obtKey: 'sub5Obtained', maxKey: 'sub5Max', default: defaultSubjects[4] || 'Subject 5' },
    { nameKey: 'sub6Name', obtKey: 'sub6Obtained', maxKey: 'sub6Max', default: defaultSubjects[5] || 'Subject 6' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title={`5. Marks Entry (${data.qualifyingBoard || 'Qualifying Exam'})`} />
      {!data.qualifyingBoard && <div className="bg-amber-50 p-3 rounded text-amber-800 text-sm">⚠️ Select a Qualifying Board in Step 4 to see subject options</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <InputGroup label="Exam Register Number" name="hscRegisterNo" value={data.hscRegisterNo} onChange={onChange} />
        <SelectGroup label="Exam Type" name="hscExamType" options={master?.hscExamType || ['Regular', 'Private', 'Improvement']} value={data.hscExamType} onChange={onChange} />
        <SelectGroup label="Major Stream (if applicable)" name="hscMajorStream" options={master?.hscMajorStream || ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts']} value={data.hscMajorStream} onChange={onChange} />
      </div>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left min-w-full">
          <thead>
            <tr className="text-sm font-bold text-slate-600 border-b border-slate-200">
              <th className="pb-3 pr-3">Subject Name</th>
              <th className="pb-3 pr-3">Marks Obtained</th>
              <th className="pb-3">Max Marks</th>
            </tr>
          </thead>
          <tbody>
            {hscSubjects.map(s => (
              <tr key={s.nameKey} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3"><input type="text" name={s.nameKey} className="input-field py-2" value={data[s.nameKey] || s.default} onChange={onChange} placeholder={s.default} /></td>
                <td className="py-2 pr-3"><input type="number" name={s.obtKey} className="input-field py-2" value={data[s.obtKey]} onChange={onChange} min="0" placeholder="0" /></td>
                <td className="py-2"><input type="number" name={s.maxKey} className="input-field py-2" value={data[s.maxKey]} onChange={onChange} min="0" placeholder="100" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <InputGroup label="Overall Percentage (%)" name="hscPercentage" type="number" value={data.hscPercentage} onChange={onChange} placeholder="Auto-calculated" disabled={true} />
        <InputGroup label="Cutoff Mark (out of 200)" name="hscCutoff" type="number" value={data.hscCutoff} onChange={onChange} placeholder="Auto-calculated" disabled={true} />
      </div>
    </div>
  );
};

const DetailedHistory = ({ data, onChange }) => (
  <div className="space-y-8">
    <SectionTitle title="6. SSLC (10th Standard) Details" />
    <div className="grid md:grid-cols-2 gap-4">
      <InputGroup label="SSLC Register Number" name="sslcRegisterNo" value={data.sslcRegisterNo} onChange={onChange} />
      <InputGroup label="SSLC Marksheet Number" name="sslcMarksheetNo" value={data.sslcMarksheetNo} onChange={onChange} />
    </div>
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-x-auto">
      <table className="w-full text-left min-w-full">
        <thead>
          <tr className="text-sm font-bold text-slate-600 border-b border-slate-200">
            <th className="pb-3 pr-3">Subject</th><th className="pb-3 pr-3">Marks Obtained</th><th className="pb-3">Max Marks</th>
          </tr>
        </thead>
        <tbody>
          {[
            { nameKey: 'sslcSub1', obtKey: 'sslcSub1Obt', maxKey: 'sslcSub1Max' },
            { nameKey: 'sslcSub2', obtKey: 'sslcSub2Obt', maxKey: 'sslcSub2Max' },
            { nameKey: 'sslcSub3', obtKey: 'sslcSub3Obt', maxKey: 'sslcSub3Max' },
            { nameKey: 'sslcSub4', obtKey: 'sslcSub4Obt', maxKey: 'sslcSub4Max' },
            { nameKey: 'sslcSub5', obtKey: 'sslcSub5Obt', maxKey: 'sslcSub5Max' },
          ].map(s => (
            <tr key={s.nameKey} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-3"><input type="text" name={s.nameKey} className="input-field py-2" value={data[s.nameKey]} onChange={onChange} /></td>
              <td className="py-2 pr-3"><input type="number" name={s.obtKey} className="input-field py-2" value={data[s.obtKey]} onChange={onChange} min="0" /></td>
              <td className="py-2"><input type="number" name={s.maxKey} className="input-field py-2" value={data[s.maxKey]} onChange={onChange} min="0" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <InputGroup label="SSLC Overall Percentage (%)" name="sslcPercentage" type="number" value={data.sslcPercentage} onChange={onChange} placeholder="Auto-calculated" disabled={true} />
  </div>
);

const SpecialCategory = ({ data, onChange }) => (
  <div className="space-y-6">
    <SectionTitle title="7. Special Category / Reservation" />
    <p className="text-sm text-slate-500">Select all categories that apply to you. These will be verified during document submission.</p>
    <div className="grid md:grid-cols-2 gap-4">
      <CheckboxCard label="Differently Abled" name="isDifferentlyAbled" checked={data.isDifferentlyAbled} onChange={onChange} />
      <CheckboxCard label="Ex-Servicemen's Ward" name="isExServiceman" checked={data.isExServiceman} onChange={onChange} />
      <CheckboxCard label="Sports Person (District / State / National)" name="isSportsPerson" checked={data.isSportsPerson} onChange={onChange} />
      <CheckboxCard label="Government School Student" name="isGovtStudent" checked={data.isGovtStudent} onChange={onChange} />
    </div>
  </div>
);

const CollegeChoice = ({ data, onChange, onPrefChange, colleges, master }) => {
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredColleges = colleges
    .filter(c => c.ins_type !== 'Self Finance') // Exclude Self Finance colleges
    .filter(c => {
      const matchCity = !cityFilter || c.ins_city === cityFilter;
      const matchType = !typeFilter || c.ins_type === typeFilter;
      return matchCity && matchType;
    });

  const validColleges = colleges.filter(c => c.ins_type !== 'Self Finance');
  const cities = [...new Set(validColleges.map(c => c.ins_city).filter(Boolean))].sort();
  // Exclude "Self Finance" from college type filter
  const allTypes = master?.insType || ['Government', 'Aided', 'Self Finance'];
  const types = allTypes.filter(t => t !== 'Self Finance');

  return (
    <div className="space-y-6">
      <SectionTitle title="8. College Choice" />

      <div className="flex flex-col gap-3 bg-blue-50 p-4 rounded-xl text-blue-800">
        <label className="flex items-center gap-3">
          <input type="checkbox" name="hostelRequired" checked={data.hostelRequired} onChange={onChange} className="w-5 h-5" />
          <span className="font-bold">I require hostel accommodation</span>
        </label>
        {/* Women's hostel option only shows for female students */}
        {data.gender?.toLowerCase() === 'female' && (
          <label className="flex items-center gap-3">
            <input type="checkbox" name="womensHostel" checked={data.womensHostel} onChange={onChange} className="w-5 h-5" />
            <span className="font-bold">I require women's hostel</span>
          </label>
        )}
      </div>

      {/* Filters for college dropdown */}
      <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter by City</label>
          <select className="input-field" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
            <option value="">All Cities ({validColleges.length} colleges)</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter by Type</label>
          <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <p className="font-semibold text-slate-700">
          Preference List (ordered by priority) —&nbsp;
          <span className="text-blue-600">{filteredColleges.length} college{filteredColleges.length !== 1 ? 's' : ''} shown</span>
        </p>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">{i + 1}</span>
            <select className="input-field" value={data.preferences[i] || ''} onChange={e => onPrefChange(i, e.target.value)}>
              <option value="">Select College...</option>
              {filteredColleges.map(c => (
                <option key={c.id} value={c.ins_code}
                  disabled={data.preferences.includes(c.ins_code) && data.preferences[i] !== c.ins_code}>
                  [{c.ins_code}] {c.ins_name} — {c.ins_city}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentUploads = ({ data, onUpload }) => (
  <div className="space-y-6">
    <SectionTitle title="9. Document Uploads & Submission" />
    <div className="grid md:grid-cols-2 gap-6">
      <UploadBox label="Passport Photo" subLabel="Mandatory • JPG or PNG" docType="photo" currentPath={data.photoPath} onUpload={onUpload} accept="image/*" />
      <UploadBox label="Transfer Certificate (TC)" subLabel="JPG, PNG or PDF" docType="tc" currentPath={data.tcPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" />
      <UploadBox label="Qualifying Marksheet" subLabel="HSC / SSLC marksheet" docType="marksheet" currentPath={data.marksheetPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" />
      <UploadBox label="Community Certificate" subLabel="For BC / MBC / SC / ST" docType="community" currentPath={data.communityPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" />
    </div>
    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-sm">
      <strong>Declaration:</strong> I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. Any false information may lead to the rejection of my application.
    </div>
  </div>
);

const UploadBox = ({ label, subLabel, docType, currentPath, onUpload, accept }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB allowed.'); return; }
    setUploading(true);
    await onUpload(file, docType);
    setUploading(false);
  };

  return (
    <div onClick={() => !uploading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group
        ${currentPath ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div className={`p-3 rounded-full transition-colors
        ${currentPath ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'}`}>
        {uploading ? <Loader size={24} className="animate-spin" /> : currentPath ? <Check size={24} /> : <Upload size={24} />}
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
      </div>
      {currentPath
        ? <p className="text-xs text-emerald-600 font-semibold">✓ Uploaded — click to replace</p>
        : <p className="text-xs text-slate-400">Max 5MB</p>}
    </div>
  );
};

export default ApplicationForm;
