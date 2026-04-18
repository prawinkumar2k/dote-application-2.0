import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Upload, User, MapPin, Briefcase, GraduationCap, ClipboardList, Award, School, FileCheck } from 'lucide-react';
import { toast } from 'react-toastify';

const steps = [
  { id: 1, title: 'Personal Details', icon: <User size={18} /> },
  { id: 2, title: 'Contact Info', icon: <MapPin size={18} /> },
  { id: 3, title: 'Parent Details', icon: <Briefcase size={18} /> },
  { id: 4, title: 'Academic History', icon: <GraduationCap size={18} /> },
  { id: 5, title: 'Marks Entry', icon: <ClipboardList size={18} /> },
  { id: 6, title: 'Educational Hist', icon: <School size={18} /> },
  { id: 7, title: 'Special Category', icon: <Award size={18} /> },
  { id: 8, title: 'College Choice', icon: <School size={18} /> },
  { id: 9, title: 'Uploads', icon: <FileCheck size={18} /> }
];

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '', dob: '', gender: '', aadhaar: '', religion: '', community: '', caste: '', admissionType: 'First Year',
    // Step 2
    email: '', alternateMobile: '', commAddress: '', permAddress: '', sameAsComm: false,
    // Step 3
    fatherName: '', motherName: '', parentOccupation: '', annualIncome: '',
    // Step 4
    qualifyingBoard: '', registerNumber: '', lastInstitute: '',
    // Step 5 & 6
    marks: {},
    // Step 7
    isDifferentlyAbled: false, isExServiceman: false, isSportsPerson: false, isGovtStudent: false,
    // Step 8
    hostelRequired: false, preferences: ['', '', ''],
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < steps.length) {
      nextStep();
    } else {
      toast.success('Application submitted successfully!');
    }
  };

  return (
    <MainLayout role="student">
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Application Form</h1>
          <p className="text-slate-500">Please fill all the details carefully. You can save and continue later.</p>
        </div>

        {/* Stepper */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex justify-between items-center min-w-full">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                  {currentStep > step.id ? <Check size={20} /> : step.icon}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-600 absolute -bottom-6 w-max">{step.title}</div>
                {step.id < steps.length && (
                  <div className={`absolute left-1/2 top-5 w-full h-0.5 z-0 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <PersonalDetails data={formData} onChange={handleInputChange} />}
              {currentStep === 2 && <ContactInfo data={formData} onChange={handleInputChange} />}
              {currentStep === 3 && <ParentDetails data={formData} onChange={handleInputChange} />}
              {currentStep === 4 && <AcademicHistory data={formData} onChange={handleInputChange} />}
              {currentStep === 5 && <MarksEntry data={formData} onChange={handleInputChange} />}
              {currentStep === 6 && <DetailedHistory data={formData} onChange={handleInputChange} />}
              {currentStep === 7 && <SpecialCategory data={formData} onChange={handleInputChange} />}
              {currentStep === 8 && <CollegeChoice data={formData} onChange={handleInputChange} />}
              {currentStep === 9 && <DocumentUploads data={formData} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex justify-between pt-8 border-t border-slate-100">
            <button 
              type="button" 
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl"
            >
              {currentStep === steps.length ? 'Final Submit' : 'Save & Next'} <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

// Sub-components for each step
const SectionTitle = ({ title }) => <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-2">{title}</h3>;

const PersonalDetails = ({ data, onChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="1. Personal Details" /></div>
    <InputGroup label="Full Name (As per school records)" name="fullName" value={data.fullName} onChange={onChange} required />
    <InputGroup label="Date of Birth" name="dob" type="date" value={data.dob} onChange={onChange} required />
    <SelectGroup label="Gender" name="gender" options={['Male', 'Female', 'Other']} value={data.gender} onChange={onChange} required />
    <InputGroup label="Aadhaar Number" name="aadhaar" value={data.aadhaar} onChange={onChange} maxLength={12} required />
    <SelectGroup label="Religion" name="religion" options={['Hindu', 'Christian', 'Muslim', 'Others']} value={data.religion} onChange={onChange} required />
    <SelectGroup label="Community" name="community" options={['BC', 'MBC', 'SC/ST', 'OC']} value={data.community} onChange={onChange} required />
    <InputGroup label="Caste" name="caste" value={data.caste} onChange={onChange} required />
    <SelectGroup label="Admission Type" name="admissionType" options={['First Year', 'Lateral Entry (2nd Year)', 'Part-Time']} value={data.admissionType} onChange={onChange} required />
  </div>
);

const ContactInfo = ({ data, onChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="2. Contact Information" /></div>
    <InputGroup label="Email Address" name="email" type="email" value={data.email} onChange={onChange} required />
    <InputGroup label="Alternate Mobile" name="alternateMobile" value={data.alternateMobile} onChange={onChange} />
    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Communication Address</label>
      <textarea name="commAddress" className="input-field min-h-28" value={data.commAddress} onChange={onChange} placeholder="House No, Street, City, District, PIN Code" required />
    </div>
    <div className="md:col-span-2 flex items-center gap-2 my-2">
      <input type="checkbox" name="sameAsComm" checked={data.sameAsComm} onChange={onChange} className="w-4 h-4" />
      <span className="text-sm font-medium text-slate-600">Permanent Address same as Communication Address</span>
    </div>
    {!data.sameAsComm && (
      <div className="md:col-span-2">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Permanent Address</label>
        <textarea name="permAddress" className="input-field min-h-28" value={data.permAddress} onChange={onChange} />
      </div>
    )}
  </div>
);

const ParentDetails = ({ data, onChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="3. Parent / Guardian Details" /></div>
    <InputGroup label="Father's Name" name="fatherName" value={data.fatherName} onChange={onChange} required />
    <InputGroup label="Mother's Name" name="motherName" value={data.motherName} onChange={onChange} required />
    <SelectGroup label="Parent Occupation" name="parentOccupation" options={['Farmer', 'Business', 'Govt Employee', 'Private Employee', 'Others']} value={data.parentOccupation} onChange={onChange} required />
    <InputGroup label="Annual Income (in Rupees)" name="annualIncome" type="number" value={data.annualIncome} onChange={onChange} required />
  </div>
);

const AcademicHistory = ({ data, onChange }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><SectionTitle title="4. Academic History" /></div>
    <SelectGroup label="Qualifying Board" name="qualifyingBoard" options={['State Board', 'CBSE', 'ICSE', 'ITI', 'Others']} value={data.qualifyingBoard} onChange={onChange} required />
    <InputGroup label="Register Number" name="registerNumber" value={data.registerNumber} onChange={onChange} required />
    <div className="md:col-span-2">
        <InputGroup label="Last School/Institute Attended" name="lastInstitute" value={data.lastInstitute} onChange={onChange} required />
    </div>
  </div>
);

const MarksEntry = ({ data, onChange }) => (
  <div className="space-y-6">
    <SectionTitle title="5. Marks Entry (Qualifying Exam)" />
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm font-bold text-slate-600">
            <th className="pb-4">Subject</th>
            <th className="pb-4">Marks Obtained</th>
            <th className="pb-4">Max Marks</th>
            <th className="pb-4">Year</th>
          </tr>
        </thead>
        <tbody className="space-y-2">
          {['English', 'Maths', 'Physics', 'Chemistry'].map(sub => (
            <tr key={sub}>
              <td className="py-2 font-medium">{sub}</td>
              <td className="py-2"><input type="number" className="input-field py-2" /></td>
              <td className="py-2"><input type="number" className="input-field py-2" defaultValue={100} /></td>
              <td className="py-2"><input type="number" className="input-field py-2" defaultValue={2026} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DetailedHistory = ({ data, onChange }) => (
    <div className="space-y-6">
      <SectionTitle title="6. Detailed Educational History" />
      <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-500">
          Select relevant levels (SSLC/HSC/ITI) to add details.
      </div>
      <div className="grid md:grid-cols-2 gap-4">
          <button type="button" className="p-4 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">Add SSLC (10th) Details</button>
          <button type="button" className="p-4 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">Add HSC (12th) Details</button>
      </div>
    </div>
);

const SpecialCategory = ({ data, onChange }) => (
  <div className="space-y-6">
    <SectionTitle title="7. Special Category / Reservation" />
    <div className="grid md:grid-cols-2 gap-4">
      <CheckboxCard label="Differently Abled" name="isDifferentlyAbled" checked={data.isDifferentlyAbled} onChange={onChange} />
      <CheckboxCard label="Ex-Servicemen's Ward" name="isExServiceman" checked={data.isExServiceman} onChange={onChange} />
      <CheckboxCard label="Sports Person (District/State/National)" name="isSportsPerson" checked={data.isSportsPerson} onChange={onChange} />
      <CheckboxCard label="Government School Student" name="isGovtStudent" checked={data.isGovtStudent} onChange={onChange} />
    </div>
  </div>
);

const CollegeChoice = ({ data, onChange }) => (
  <div className="space-y-6">
    <SectionTitle title="8. College Choice" />
    <div className="flex items-center gap-3 mb-8 bg-blue-50 p-4 rounded-xl text-blue-800">
      <input type="checkbox" name="hostelRequired" checked={data.hostelRequired} onChange={onChange} className="w-5 h-5" />
      <label className="font-bold">I require hostel accommodation</label>
    </div>
    <div className="space-y-4">
      <p className="font-semibold text-slate-700">Preference List (Ordered by priority)</p>
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4">
          <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">{i}</span>
          <select className="input-field lg:max-w-md">
            <option>Select College...</option>
            <option>Government College of Technology, Coimbatore</option>
            <option>Alagappa Chettiar Govt College of Engineering</option>
          </select>
        </div>
      ))}
    </div>
  </div>
);

const DocumentUploads = () => (
    <div className="space-y-6">
      <SectionTitle title="9. Document Uploads & Submission" />
      <div className="grid md:grid-cols-2 gap-6">
          <UploadBox label="Passport Photo (Mandatory)" />
          <UploadBox label="Transfer Certificate (TC)" />
          <UploadBox label="Qualifying Marksheet" />
      </div>
      <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 italic text-amber-800 text-sm">
          <strong>Declaration:</strong> I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to the rejection of my application.
      </div>
    </div>
);

// Helpers
const InputGroup = ({ label, name, type = 'text', ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <input type={type} name={name} className="input-field" {...props} />
  </div>
);

const SelectGroup = ({ label, name, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
    <select name={name} className="input-field capitalize" {...props}>
      <option value="">Select {label}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

const UploadBox = ({ label }) => (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer group">
        <div className="p-3 bg-slate-100 rounded-full text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
            <Upload size={24} />
        </div>
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">JPG, PNG or PDF (Max 2MB)</p>
    </div>
);

export default ApplicationForm;
