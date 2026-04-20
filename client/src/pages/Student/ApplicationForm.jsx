import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Check, Upload, User, MapPin,
  Briefcase, GraduationCap, ClipboardList, Award, School, FileCheck, Loader, Trash2, Percent
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, title: 'Personal Details', icon: <User size={18} /> },
  { id: 2, title: 'Contact Info', icon: <MapPin size={18} /> },
  { id: 3, title: 'Parent Details', icon: <Briefcase size={18} /> },
  { id: 4, title: 'Academic Details', icon: <GraduationCap size={18} /> },
  { id: 5, title: 'Marks Entry', icon: <ClipboardList size={18} /> },
  { id: 6, title: 'Special Category', icon: <Award size={18} /> },
  { id: 7, title: 'College Choice', icon: <School size={18} /> },
  { id: 8, title: 'Uploads', icon: <FileCheck size={18} /> },
  { id: 9, title: 'Review & Submit', icon: <Check size={18} /> },
];

const fieldLabels = {
  fullName: 'Full Name', dob: 'Date of Birth', gender: 'Gender', aadhaar: 'Aadhaar Number',
  religion: 'Religion', community: 'Community', caste: 'Caste', admissionType: 'Admission Type',
  email: 'Email Address', commAddress: 'Communication Address',
  fatherName: "Father's Name", motherName: "Mother's Name", parentOccupation: 'Parent Occupation',
  annualIncome: 'Annual Income', qualifyingBoard: 'Qualifying Board', registerNumber: 'Register Number',
  lastInstitute: 'Last Institute Name', hscRegisterNo: 'HSC Register Number',
  sslcRegisterNo: 'SSLC Register Number', sslcMarksheetNo: 'SSLC Marksheet Number',
  mediumOfInstruction: 'Medium of Instruction', civicSchoolType: 'Civic School Type',
  photoPath: 'Passport Photo', tcPath: 'Transfer Certificate', marksheetPath: 'Marksheet',
  communityPath: 'Community Certificate'
};

const stepRequiredFields = {
  1: ['fullName', 'dob', 'gender', 'aadhaar', 'religion', 'community', 'caste', 'admissionType'],
  2: ['email', 'commAddress'],
  3: ['fatherName', 'motherName', 'parentOccupation', 'annualIncome'],
  4: ['mediumOfInstruction', 'civicSchoolType', 'qualifyingBoard', 'registerNumber', 'lastInstitute'],
  5: ['qualifyingType'],
  6: [], // Optional booleans
  7: [], // At least 1 pref checked in validator
  8: ['photoPath', 'marksheetPath'] // Minimum mandatory uploads
};

const defaultForm = {
  // Step 1
  fullName: '', dob: '', gender: '', aadhaar: '', religion: '', community: '', caste: '',
  admissionType: 'First Year', motherTongue: '', mediumOfInstruction: '', nativity: '',
  // Step 2
  email: '', alternateMobile: '', commAddress: '', permAddress: '', sameAsComm: false,
  // Step 4 Merged
  mediumOfInstruction: '', civicSchoolType: '',
  qualifyingBoard: '', registerNumber: '', lastInstitute: '', lastInstituteDistrict: '', lastInstituteState: '',
  // Comma-separated Education History
  standard_studied: '', standard_school_name: '', standard_yop: '', standard_district: '', standard_state: '',
  // Step 5
  qualifyingType: '', // sslc | iti | voc | hsc
  // Step 7+
  isDifferentlyAbled: false, isExServiceman: false, isSportsPerson: false, isGovtStudent: false,
  hostelRequired: false, womensHostel: false, preferences: [],
  photoPath: '', tcPath: '', marksheetPath: '', communityPath: '',
};

import FormField from '../../components/Common/FormField';

const SUBJECT_CONFIG = {
  SSLC: { count: 5, subjects: ['Tamil', 'English', 'Maths', 'Science', 'Social'] },
  ITI: { count: 5, subjects: ['Trade Practical', 'Trade Theory', 'Work Shop', 'Drawing', 'Social'] },
  VOC: { count: 6, subjects: ['Language', 'English', 'Maths', 'Theory', 'Practical-I', 'Practical-II'] },
  HSC: { count: 6, subjects: ['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology'] }
};

const ApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NEW STRUCTURED STATE ---
  const [eduHistory, setEduHistory] = useState([{ standard: "6", school: "", year: "", state: "Tamil Nadu", district: "" }]);
  const [marksData, setMarksData] = useState({
    SSLC: { subjects: [] }, 
    ITI: { subjects: [] }, 
    HSC: { subjects: [] }, 
    VOC: { subjects: [] }
  });
  const [attempts, setAttempts] = useState({
    SSLC: { 1: { marksheetNo: "", registerNo: "", month: "", year: "", totalMatch: "" } },
    ITI: { 1: {} }, HSC: { 1: {} }, VOC: { 1: {} }
  });
  const [selectedAttempts, setSelectedAttempts] = useState({
    SSLC: [1], ITI: [1], HSC: [1], VOC: [1]
  });

  const [colleges, setColleges] = useState([]);
  const [master, setMaster] = useState(null); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationNo, setApplicationNo] = useState('');

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
    let countedSubjects = 0;

    marks.forEach(m => {
      const obt = Number(m.obt);
      const max = Number(m.max);
      if (!isNaN(obt) && !isNaN(max) && obt >= 0 && max > 0) {
        totalObtained += obt;
        totalMax += max;
        countedSubjects++;
      }
    });

    // Calculate percentage and cutoff only if we have at least one subject with marks
    if (countedSubjects > 0 && totalMax > 0) {
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      const cutoff = ((totalObtained / totalMax) * 200).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        hscPercentage: percentage,
        hscCutoff: cutoff,
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
    let countedSubjects = 0;

    sslcMarks.forEach(m => {
      const obt = Number(m.obt);
      const max = Number(m.max);
      if (!isNaN(obt) && !isNaN(max) && obt >= 0 && max > 0) {
        totalObtained += obt;
        totalMax += max;
        countedSubjects++;
      }
    });

    // Calculate percentage only if we have at least one subject with marks
    if (countedSubjects > 0 && totalMax > 0) {
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      
      setFormData(prev => ({
        ...prev,
        sslcPercentage: percentage,
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
  }, [formData.gender]);  // --- MAPPING HELPERS ---
  const flattenPayload = (data) => {
    const payload = {};
    const type = data.qualifyingType?.toLowerCase();

    // 1. Map student_master fields directly (allowed ones)
    const masterFields = [
      'fullName', 'dob', 'gender', 'aadhaar', 'religion', 'community', 'caste',
      'admissionType', 'motherTongue', 'mediumOfInstruction', 'nativity',
      'email', 'alternateMobile', 'commAddress', 'permAddress', 'sameAsComm',
      'fatherName', 'motherName', 'parentOccupation', 'annualIncome',
      'civicSchoolType', 'qualifyingBoard', 'registerNumber', 'lastInstitute', 'lastInstituteDistrict', 'lastInstituteState',
      'isDifferentlyAbled', 'isExServiceman', 'isSportsPerson', 'isGovtStudent',
      'hostelRequired', 'womensHostel'
    ];
    masterFields.forEach(f => { if (data[f] !== undefined) payload[f] = data[f]; });

    // 2. Flatten Edu History to Comma Separated Strings
    payload.standard_studied = eduHistory.map(row => row.standard).join(',');
    payload.standard_school_name = eduHistory.map(row => row.school).join(',');
    payload.standard_yop = eduHistory.map(row => row.year).join(',');
    payload.standard_district = eduHistory.map(row => row.district).join(',');
    payload.standard_state = eduHistory.map(row => row.state).join(',');

    // 3. Map Mark Details with Dynamic Prefixing
    if (type) {
      payload[type] = 'Yes'; // Flag e.g. hsc: "Yes"
      
      // Map basic mark fields
      payload[`${type}_register_no`] = data.registerNumber; // Critical fix!
      payload[`${type}_exam_type`] = data.hscExamType; 
      payload[`${type}_major_stream`] = data.hscMajorStream;

      // Map Totals and Aggregates
      const typeData = marksData[type.toUpperCase()] || { subjects: [] };
      const totalObt = typeData.subjects.reduce((sum, s) => sum + (Number(s?.obtained) || 0), 0);
      const totalMax = typeData.subjects.reduce((sum, s) => sum + (Number(s?.max) || 0), 0);
      const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '0.00';

      payload[`${type}_total_obtained_mark`] = totalObt.toString();
      payload[`${type}_total_mark`] = totalMax.toString();
      payload[`${type}_percentage`] = percentage;
      if (type === 'hsc') {
        payload[`${type}_cutoff`] = ((totalObt / totalMax) * 200).toFixed(2);
      }

      // Map Subject Marks
      typeData.subjects.forEach((s, i) => {
        const sIdx = i + 1;
        payload[`${type}_subject${sIdx}`] = s.name;
        payload[`${type}_subject${sIdx}_obtained_mark`] = s.obtained;
        payload[`${type}_subject${sIdx}_max_mark`] = s.max;
      });

      // 4. Map Dynamic Attempts
      if (selectedAttempts[type.toUpperCase()]) {
        selectedAttempts[type.toUpperCase()].forEach(attId => {
          const attData = attempts[type.toUpperCase()][attId];
          if (attData) {
            const attPrefix = `${type}_att${attId}_`;
            payload[`${attPrefix}marksheet_no`] = attData.marksheetNo;
            payload[`${attPrefix}register_no`] = attData.registerNo;
            payload[`${attPrefix}month`] = attData.month;
            payload[`${attPrefix}year`] = attData.year;
            payload[`${attPrefix}total_marks`] = attData.totalMatch;
          }
        });
      }
    }

    return payload;
  };

  const unflattenData = (s, m) => {
    // 1. Un-flatten Edu History
    if (s.standard_studied) {
      const standards = s.standard_studied.split(',');
      const schools = (s.standard_school_name || '').split(',');
      const years = (s.standard_yop || '').split(',');
      const districts = (s.standard_district || '').split(',');
      const states = (s.standard_state || '').split(',');
      
      const history = standards.map((std, i) => ({
        standard: std,
        school: schools[i] || '',
        year: years[i] || '',
        district: districts[i] || '',
        state: states[i] || ''
      }));
      setEduHistory(history);
    }

    // 2. Identify Qualifying Type and Un-flatten Marks & Attempts
    const types = ['SSLC', 'ITI', 'VOC', 'HSC'];
    const activeType = types.find(t => s[t.toLowerCase()] === 'yes' || s[t.toLowerCase()] === 'Yes') || 'HSC';
    const activePrefix = activeType.toLowerCase();
    
    const newMarksData = { ...marksData };
    const newAttempts = { ...attempts };
    const newSelected = { ...selectedAttempts };
    
    types.forEach(t => {
      const prefix = t.toLowerCase();
      
      // Un-flatten main subject marks for this type
      if (m[`${prefix}_subject1`]) {
        const subjects = [];
        for (let i = 1; i <= 6; i++) {
          if (m[`${prefix}_subject${i}`]) {
            subjects.push({
              name: m[`${prefix}_subject${i}`],
              obtained: m[`${prefix}_subject${i}_obtained_mark`] || '',
              max: m[`${prefix}_subject${i}_max_mark`] || '100'
            });
          }
        }
        if (subjects.length > 0) {
          newMarksData[t] = { subjects };
        }
      }

      // Un-flatten attempts for this type
      const typeSel = [];
      const typeAtts = {};
      for (let i = 1; i <= 5; i++) {
        const attPrefix = `${prefix}_att${i}_`;
        if (m && m[`${attPrefix}marksheet_no`]) {
          typeSel.push(i);
          typeAtts[i] = {
            marksheetNo: m[`${attPrefix}marksheet_no`],
            registerNo: m[`${attPrefix}register_no`],
            month: m[`${attPrefix}month`],
            year: m[`${attPrefix}year`],
            totalMatch: m[`${attPrefix}total_marks`]
          };
        }
      }
      if (typeSel.length > 0) {
        newSelected[t] = typeSel;
        newAttempts[t] = { ...newAttempts[t], ...typeAtts };
      }
    });

    setMarksData(newMarksData);
    setAttempts(newAttempts);
    setSelectedAttempts(newSelected);

    // Restore basic fields like registerNumber for the active type
    setFormData(prev => ({ 
      ...prev, 
      qualifyingType: activePrefix,
      registerNumber: m[`${activePrefix}_register_no`] || prev.registerNumber,
      lastInstituteState: s.last_institution_state || prev.lastInstituteState,
      hscExamType: m[`${activePrefix}_exam_type`] || prev.hscExamType,
      hscMajorStream: m[`${activePrefix}_major_stream`] || prev.hscMajorStream
    }));
  };

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
        preferences: s.college_choices ? (() => { try { return JSON.parse(s.college_choices); } catch { return []; } })() : [],
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

      // Re-hydrate structured state
      unflattenData(s, m);
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

  const handleDistrictChange = (field, districtName, stateTargetField) => {
    const districtObj = master?.districts?.find(d => d.name === districtName);
    setFormData(prev => ({
      ...prev,
      [field]: districtName,
      [stateTargetField]: districtObj ? districtObj.state : prev[stateTargetField]
    }));
  };

  const handleEduHistoryDistrictChange = (index, districtName) => {
    const districtObj = master?.districts?.find(d => d.name === districtName);
    const newHistory = [...eduHistory];
    newHistory[index].district = districtName;
    if (districtObj) newHistory[index].state = districtObj.state;
    setEduHistory(newHistory);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Numeric-only enforcement for specific fields
    const numericFields = ['aadhaar', 'alternateMobile', 'annualIncome', 'registerNumber', 'hscRegisterNo', 'sslcRegisterNo'];
    const markFields = ['Obtained', 'Max', 'Obt']; // Matches sub1Obtained, sslcSub1Obt, etc.
    
    if (numericFields.includes(name) || markFields.some(suffix => name.endsWith(suffix))) {
      // Allow only digits
      const cleanValue = value.replace(/\D/g, '');
      
      // Length limits
      if (name === 'aadhaar' && cleanValue.length > 12) return;
      if (name === 'alternateMobile' && cleanValue.length > 10) return;
      
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePreferenceChange = (index, value) => {
    setFormData(prev => {
      const prefs = Array.isArray(prev.preferences) ? [...prev.preferences] : [];
      // Ensure array is large enough
      while (prefs.length <= index) {
        prefs.push('');
      }
      // Set or remove value
      if (value === null) {
        prefs.pop(); // Remove last item
      } else {
        prefs[index] = value;
      }
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
    const payload = flattenPayload(formData);
    try {
      await axios.put(`/api/student/step/${currentStep}`, payload, { withCredentials: true });
      return true;
    } catch {
      toast.error('Failed to save. Please check your connection.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateStep = (id) => {
    // 1. Check basic required fields from stepRequiredFields
    const fields = stepRequiredFields[id] || [];
    const stepErrors = {};
    let isValid = true;

    fields.forEach(f => {
       if (!formData[f]) {
         stepErrors[f] = `${fieldLabels[f] || f} is required`;
         isValid = false;
       }
    });
    
    // 2. Format & Length validations
    if (id === 1) {
      if (formData.aadhaar && formData.aadhaar.length !== 12) {
        stepErrors.aadhaar = "Aadhaar must be exactly 12 digits";
        isValid = false;
      }
    }

    if (id === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        stepErrors.email = "Invalid email format";
        isValid = false;
      }
      if (formData.alternateMobile && formData.alternateMobile.length !== 10) {
        stepErrors.alternateMobile = "Mobile number must be 10 digits";
        isValid = false;
      }
    }

    if (id === 8) {
      if (!formData.preferences || formData.preferences.filter(Boolean).length === 0) {
        toast.error('Please select at least one college preference');
        isValid = false;
      }
    }

    if (!isValid) {
      setErrors(stepErrors);
      const labels = Object.values(stepErrors).join(', ');
      toast.error(`Please fix missing fields: ${labels}`, {
        position: 'top-center',
        autoClose: 5000
      });
    }

    return isValid;
  };

  const handleNext = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitted) { 
      setCurrentStep(p => Math.min(p + 1, steps.length)); 
      return; 
    }

    if (!validateStep(currentStep)) return;

    const saved = await saveCurrentStep();
    if (saved) {
      toast.success(`Step ${currentStep} saved!`, { autoClose: 1200 });
      setCurrentStep(p => Math.min(p + 1, steps.length));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitted) { navigate('/student/my-application'); return; }
    
    // Ensure all steps are valid before final submit
    for (let i = 1; i < 10; i++) {
       if (!validateStep(i)) {
         setCurrentStep(i);
         return;
       }
    }

    setSaving(true);
    try {
      const res = await axios.post('/api/student/submit', {}, { withCredentials: true });
      if (res.data.success) {
        setIsSubmitted(true);
        setApplicationNo(res.data.applicationNo);
        toast.success(`Application submitted! ID: ${res.data.applicationNo}`);
        setTimeout(() => navigate('/student/my-application'), 2000);
      } else {
        toast.error(res.data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <MainLayout role="student">
      <div className="flex items-center justify-center min-h-screen gap-3 text-slate-400">
        <Loader size={32} className="animate-spin" /> 
        <span className="text-lg font-black uppercase tracking-widest">Loading Application...</span>
      </div>
    </MainLayout>
  );

  const onFormAction = currentStep === 9 ? handleSubmit : handleNext;

  return (
    <MainLayout role="student">
      <div className="max-w-5xl mx-auto py-6 px-4 font-sans">
        {/* Simple Header with Status */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Admission Portal</h1>
            <p className="text-slate-500 text-sm font-semibold mt-4">DIRECTORATE OF TECHNICAL EDUCATION (DOTE) • ADMISSION 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {isSubmitted && applicationNo ? (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 border border-emerald-300 rounded font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                <Check size={16} strokeWidth={3} /> Submitted Application: {applicationNo}
              </div>
            ) : (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 border border-blue-200 rounded font-bold text-xs uppercase tracking-widest border-dashed">
                Current Status: Draft Mode
              </div>
            )}
          </div>
        </div>

        {/* Step Indicator Header */}
        <div className="mb-8 bg-slate-50 border border-slate-200 p-6 rounded-lg">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-slate-800">
                Step {currentStep} of {steps.length}: <span className="text-blue-600 ml-1">{steps.find(s => s.id === currentStep)?.title}</span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-600">{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
           </div>
           
           {/* Text-only Stepper List */}
           <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => (isSubmitted || currentStep > step.id) && setCurrentStep(step.id)}
                  disabled={!(isSubmitted || currentStep > step.id)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-all
                    ${currentStep === step.id ? 'bg-blue-600 text-white border-blue-700' : 
                      currentStep > step.id ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      'bg-white text-slate-400 border-slate-200 opacity-60'}`}
                >
                  {step.id}. {step.title}
                </button>
              ))}
           </div>
        </div>

        <form onSubmit={onFormAction} className="bg-white border border-slate-200 p-8 shadow-sm rounded-lg relative">
          <div className="space-y-8">
            {currentStep === 1 && <PersonalDetails data={formData} errors={errors} onChange={handleInputChange} master={master} disabled={isSubmitted} />}
            {currentStep === 2 && <ContactInfo data={formData} errors={errors} onChange={handleInputChange} disabled={isSubmitted} />}
            {currentStep === 3 && <ParentDetails data={formData} errors={errors} onChange={handleInputChange} master={master} disabled={isSubmitted} />}
            {currentStep === 4 && <AcademicDetails data={formData} errors={errors} onChange={handleInputChange} onDistrictChange={handleDistrictChange} onEduHistDistrictChange={handleEduHistoryDistrictChange} master={master} eduHistory={eduHistory} setEduHistory={setEduHistory} disabled={isSubmitted} />}
            {currentStep === 5 && (
              <div className="space-y-8">
                <SectionTitle title="5. Marks Entry" subtitle="Select your qualifying examination, enter subject marks, and manage attempts." />
                <EducationSelector selectedType={formData.qualifyingType} setQualifyingType={(t) => setFormData({...formData, qualifyingType: t})} disabled={isSubmitted} />
                {formData.qualifyingType && (
                  <>
                    <MarksTable type={formData.qualifyingType} data={marksData} setData={setMarksData} disabled={isSubmitted} />
                    <div className="pt-10 mt-10 border-t border-dashed border-slate-200">
                      <AttemptManager type={formData.qualifyingType} attempts={attempts} setAttempts={setAttempts} selectedAttempts={selectedAttempts} setSelectedAttempts={setSelectedAttempts} disabled={isSubmitted} />
                    </div>
                  </>
                )}
              </div>
            )}
            {currentStep === 6 && <SpecialCategory data={formData} onChange={handleInputChange} disabled={isSubmitted} />}
            {currentStep === 7 && <CollegeChoice data={formData} onChange={handleInputChange} onPrefChange={handlePreferenceChange} colleges={colleges} master={master} disabled={isSubmitted} />}
            {currentStep === 8 && <DocumentUploads data={formData} onUpload={handleFileUpload} disabled={isSubmitted} />}
            {currentStep === 9 && <FormSummary data={formData} onGoToStep={setCurrentStep} isSubmitted={isSubmitted} applicationNo={applicationNo} eduHistory={eduHistory} marksData={marksData} qualifyingType={formData.qualifyingType} attempts={attempts} selectedAttempts={selectedAttempts} />}
          </div>

          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 pt-10 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => setCurrentStep(p => Math.max(p - 1, 1))} 
              disabled={currentStep === 1}
              className={`px-8 py-2.5 rounded font-bold text-xs uppercase tracking-widest border transition-all ${currentStep === 1 ? 'text-slate-300 border-slate-100 cursor-not-allowed' : 'text-slate-700 border-slate-400 hover:bg-slate-50'}`}
            >
              Previous
            </button>
            
            {currentStep < 9 && (
               <button type="submit" disabled={saving}
                className="bg-blue-600 text-white px-10 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-70 transition-all border border-blue-700">
                {saving ? 'Processing...' : 'Save and Continue'}
              </button>
            )}

            {currentStep === 9 && !isSubmitted && (
               <button type="button" onClick={handleSubmit} disabled={saving}
                className="bg-emerald-600 text-white px-12 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-70 transition-all border border-emerald-700">
                {saving ? 'Submitting...' : 'Confirm Submission'}
              </button>
            )}
            
            {currentStep === 9 && isSubmitted && (
               <button type="button" onClick={() => navigate('/student/my-application')}
                className="bg-slate-800 text-white px-12 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all">
                Close View
              </button>
            )}
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

// ─────────────────────────────────────────────────────────
// Simplified Shared Components
// ─────────────────────────────────────────────────────────
const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6 pb-2 border-b border-slate-100">
    <h3 className="text-lg font-bold text-slate-800 tracking-tight underline underline-offset-4 decoration-blue-500 decoration-2">{title}</h3>
    {subtitle && <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-2 bg-slate-50 px-3 py-1.5 rounded inline-block">{subtitle}</p>}
  </div>
);

const CheckboxCard = ({ label, name, checked, onChange, disabled = false }) => (
  <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${disabled ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-60' : checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
      {checked && <Check size={14} strokeWidth={4} />}
    </div>
    <span className={`text-xs font-bold uppercase tracking-wider ${checked ? 'text-blue-800' : 'text-slate-600'}`}>{label}</span>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" disabled={disabled} />
  </label>
);

// ─────────────────────────────────────────────────────────
// Form Summary / Review Component
// ─────────────────────────────────────────────────────────
const FormSummary = ({ data, onGoToStep, isSubmitted, applicationNo }) => {
  const SummarySection = ({ title, stepId, children }) => (
    <div className="bg-white rounded-lg p-6 border border-slate-200 mb-6 relative">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
        {!isSubmitted && (
          <button type="button" onClick={() => onGoToStep(stepId)} className="text-xs font-bold text-blue-600 uppercase hover:underline">
            Modify
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const SummaryField = ({ label, value }) => (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="font-bold text-slate-700 break-words text-sm">{value || <span className="text-red-400 font-medium italic">Not Provided</span>}</p>
    </div>
  );

  return (
    <div className="px-2">
      <div className="mb-8 p-6 bg-slate-800 rounded-lg text-white">
        <h3 className="text-xl font-bold mb-2">Review Application Details</h3>
        <p className="text-slate-300 text-xs font-medium leading-relaxed">
          Please verify all information before final submission. Once submitted, details cannot be changed without administrative intervention.
        </p>
      </div>

      <SummarySection title="1. Personal Information" stepId={1}>
        <SummaryField label="Full Name" value={data.fullName} />
        <SummaryField label="Date of Birth" value={data.dob} />
        <SummaryField label="Gender" value={data.gender} />
        <SummaryField label="Aadhaar Number" value={data.aadhaar} />
        <SummaryField label="Religion" value={data.religion} />
        <SummaryField label="Community" value={data.community} />
        <SummaryField label="Caste" value={data.caste} />
        <SummaryField label="Admission Type" value={data.admissionType} />
      </SummarySection>

      <SummarySection title="2. Communication Details" stepId={2}>
        <SummaryField label="Email Address" value={data.email} />
        <SummaryField label="Alternate Mobile" value={data.alternateMobile} />
        <div className="md:col-span-2">
          <SummaryField label="Communication Address" value={data.commAddress} />
        </div>
      </SummarySection>

      <SummarySection title="4. Academic Details" stepId={4}>
        <SummaryField label="Medium" value={data.mediumOfInstruction} />
        <SummaryField label="School Type" value={data.civicSchoolType} />
        <SummaryField label="Qualifying Board" value={data.qualifyingBoard} />
        <SummaryField label="Register Number" value={data.registerNumber} />
        <SummaryField label="District" value={data.lastInstituteDistrict} />
        <SummaryField label="State" value={data.lastInstituteState} />
        <div className="md:col-span-3 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Schooling Progression</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {eduHistory.map((row, i) => (
              <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                <p className="text-[9px] font-black text-blue-600 mb-1">{row.standard}</p>
                <p className="text-[10px] font-bold text-slate-700 truncate">{row.school}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{row.year}</p>
              </div>
            ))}
          </div>
        </div>
      </SummarySection>

      <SummarySection title="5. Marks Entry" stepId={5}>
        <div className="md:col-span-3 grid md:grid-cols-3 gap-6">
          <div className="bg-blue-600 p-4 rounded text-white shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-1">Qualifying Track</p>
            <p className="text-xl font-black">{qualifyingType?.toUpperCase() || 'Not Selected'}</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            {marksData[qualifyingType?.toUpperCase()]?.subjects?.slice(0, 6).map((s, i) => (
              <div key={i} className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase">{s.name}</span>
                <span className="text-xs font-bold text-slate-800">{s.obtained} / {s.max}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 mt-4 space-y-4">
           <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attempts Detail</p>
           {selectedAttempts[qualifyingType?.toUpperCase()]?.map(id => (
             <div key={id} className="flex flex-wrap gap-x-8 gap-y-2 bg-slate-50 p-3 rounded border border-slate-200">
               <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-[10px] font-black">{id}</div>
               <SummaryField label="Reg No" value={attempts[qualifyingType?.toUpperCase()]?.[id]?.registerNo} />
               <SummaryField label="Marksheet" value={attempts[qualifyingType?.toUpperCase()]?.[id]?.marksheetNo} />
               <SummaryField label="Year" value={attempts[qualifyingType?.toUpperCase()]?.[id]?.year} />
               <SummaryField label="Total Marks" value={attempts[qualifyingType?.toUpperCase()]?.[id]?.totalMatch} />
             </div>
           ))}
        </div>
      </SummarySection>

      {isSubmitted && (
         <div className="mt-12 p-10 bg-emerald-600 rounded-lg text-white text-center shadow-lg border-2 border-emerald-700">
            <div className="w-16 h-16 bg-white text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Check size={32} strokeWidth={3} />
            </div>
            <h4 className="text-2xl font-bold mb-2">Application Submitted Successfully</h4>
            <p className="text-emerald-100 text-sm font-medium mb-8 max-w-lg mx-auto">Your application has been received. Please note your application number for reference.</p>
            
            <div className="inline-block bg-white/20 px-10 py-4 rounded border border-white/30">
               <p className="text-emerald-50 text-[10px] font-bold uppercase tracking-widest mb-1">Application Reference Number</p>
               <p className="text-4xl font-bold text-white tracking-widest">{applicationNo}</p>
            </div>
         </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Step components
// ─────────────────────────────────────────────────────────
const PersonalDetails = ({ data, errors, onChange, master, disabled }) => (
  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
    <div className="md:col-span-2">
      <SectionTitle title="1. Personal Information" subtitle="Enter your legal details as they appear on your official school and identification documents." />
    </div>
    
    <FormField label="Full Name" required error={errors.fullName} tooltip="Enter as per school records" disabled={disabled}>
        <input type="text" name="fullName" value={data.fullName} onChange={onChange} placeholder="Full Name" disabled={disabled} />
    </FormField>

    <FormField label="Date of Birth" required error={errors.dob} disabled={disabled}>
        <input type="date" name="dob" value={data.dob} onChange={onChange} disabled={disabled} />
    </FormField>

    <FormField label="Gender" required error={errors.gender} disabled={disabled}>
        <select name="gender" value={data.gender} onChange={onChange} disabled={disabled}>
            <option value="">Select Gender</option>
            {(master?.gender || ['Male', 'Female', 'Transgender']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>

    <FormField label="Aadhaar Number (12-Digit)" required error={errors.aadhaar} disabled={disabled}>
        <input type="text" name="aadhaar" value={data.aadhaar} onChange={onChange} maxLength={12} placeholder="XXXX XXXX XXXX" disabled={disabled} />
    </FormField>

    <FormField label="Religion" required error={errors.religion} disabled={disabled}>
        <select name="religion" value={data.religion} onChange={onChange} disabled={disabled}>
            <option value="">Select Religion</option>
            {(master?.religion || ['Hindu', 'Christian', 'Muslim', 'Sikh', 'Others']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>

    <FormField label="Community" required error={errors.community} disabled={disabled}>
        <select name="community" value={data.community} onChange={onChange} disabled={disabled}>
            <option value="">Select Community</option>
            {(master?.communities || ['BC', 'BCM', 'MBC', 'DNC', 'SC', 'ST', 'OC']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>

    <FormField label="Caste Name" required error={errors.caste} disabled={disabled}>
        <input type="text" name="caste" value={data.caste} onChange={onChange} placeholder="Enter sub-caste" disabled={disabled} />
    </FormField>

    <FormField label="Admission Category" required error={errors.admissionType} disabled={disabled}>
        <select name="admissionType" className="font-bold text-blue-700" value={data.admissionType} onChange={onChange} disabled={disabled}>
            {(master?.admissionType || ['First Year', 'Lateral Entry (2nd Year)']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>

    <FormField label="Mother Tongue" disabled={disabled}>
        <select name="motherTongue" className="input-field bg-slate-50/50" value={data.motherTongue} onChange={onChange} disabled={disabled}>
            <option value="">Select Language</option>
            {(master?.motherTongue || ['Tamil', 'English', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Others']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>
  </div>
);

const ContactInfo = ({ data, errors, onChange, disabled }) => (
  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
    <div className="md:col-span-2">
      <SectionTitle title="2. Communication Details" subtitle="Enter your contact information accurately for official correspondence and notifications." />
    </div>
    
    <FormField label="Email Address" required error={errors.email} disabled={disabled}>
        <input type="email" name="email" value={data.email} onChange={onChange} placeholder="email@example.com" disabled={disabled} />
    </FormField>

    <FormField label="Alternate Mobile Number" error={errors.alternateMobile} disabled={disabled}>
        <input type="text" name="alternateMobile" value={data.alternateMobile} onChange={onChange} placeholder="10-digit number" disabled={disabled} />
    </FormField>

    <div className="md:col-span-2">
      <FormField label="Full Communication Address" required error={errors.commAddress} disabled={disabled}>
        <textarea name="commAddress" className="min-h-[120px] py-3 px-4 resize-none" value={data.commAddress} onChange={onChange} placeholder="House No, Street, Village/City, District, Pincode" required disabled={disabled} />
      </FormField>
    </div>

    <div className="md:col-span-2 flex items-start gap-4 bg-slate-50 p-6 border border-slate-200 rounded">
      <input type="checkbox" name="sameAsComm" checked={data.sameAsComm} onChange={onChange} className="w-5 h-5 mt-1" disabled={disabled} />
      <div>
          <span className="text-sm font-bold text-slate-800 tracking-tight">Permanent Address is same as Communication Address</span>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Uncheck to enter a different permanent location</p>
      </div>
    </div>

    {!data.sameAsComm && (
      <div className="md:col-span-2">
        <FormField label="Permanent Address" disabled={disabled}>
            <textarea name="permAddress" className="min-h-[120px] py-3 px-4 resize-none" value={data.permAddress} onChange={onChange} placeholder="Enter full permanent address..." disabled={disabled} />
        </FormField>
      </div>
    )}
  </div>
);

const ParentDetails = ({ data, errors, onChange, master, disabled }) => (
  <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
    <div className="md:col-span-2">
      <SectionTitle title="3. Parent/Guardian Information" subtitle="Provide parental/guardian background details for identity and eligibility verification." />
    </div>
    
    <FormField label="Father's Full Name" required error={errors.fatherName} disabled={disabled}>
        <input type="text" name="fatherName" value={data.fatherName} onChange={onChange} placeholder="Full Name" disabled={disabled} />
    </FormField>

    <FormField label="Mother's Full Name" required error={errors.motherName} disabled={disabled}>
        <input type="text" name="motherName" value={data.motherName} onChange={onChange} placeholder="Full Name" disabled={disabled} />
    </FormField>

    <FormField label="Parent Occupation" required error={errors.parentOccupation} disabled={disabled}>
        <select name="parentOccupation" value={data.parentOccupation} onChange={onChange} required disabled={disabled}>
            <option value="">Select Occupation</option>
            {(master?.parentOccupation || ['Farmer', 'Business', 'Govt Employee', 'Private Employee', 'Daily Wages', 'Professionals', 'Others']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </FormField>

    <FormField label="Family Annual Income (₹)" required error={errors.annualIncome} tooltip="Total yearly household income" disabled={disabled}>
        <input type="number" name="annualIncome" value={data.annualIncome} onChange={onChange} placeholder="Amount in Rupees" required disabled={disabled} />
    </FormField>
  </div>
);

const AcademicDetails = ({ data, errors, onChange, onDistrictChange, onEduHistDistrictChange, master, eduHistory, setEduHistory, disabled }) => (
  <div className="space-y-12">
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
      <div className="md:col-span-2">
        <SectionTitle title="4. Academic Details" subtitle="Enter your medium of instruction, school type, and previous institution details." />
      </div>

      <FormField label="Medium of Instruction" required error={errors.mediumOfInstruction} disabled={disabled}>
          <select name="mediumOfInstruction" value={data.mediumOfInstruction} onChange={onChange} disabled={disabled}>
              <option value="">Select Medium</option>
              {(master?.mediumOfInstruction || ['Tamil', 'English', 'Other']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
      </FormField>

      <FormField label="Civic School Type" required error={errors.civicSchoolType} disabled={disabled}>
          <select name="civicSchoolType" value={data.civicSchoolType} onChange={onChange} disabled={disabled}>
              <option value="">Select Type</option>
              {['Government', 'Municipality', 'Corporation', 'Panchayat Union', 'Government Aided', 'Private', 'Central Government'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
      </FormField>
      
      <FormField label="Qualifying Examination Board" required error={errors.qualifyingBoard} disabled={disabled}>
          <select name="qualifyingBoard" value={data.qualifyingBoard} onChange={onChange} required disabled={disabled}>
              <option value="">Select Board</option>
              {(master?.qualifyingBoard || ['Tamil Nadu State Board', 'CBSE', 'ICSE', 'ITI/Diploma', 'Others']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
      </FormField>

      <FormField label="Roll Number / Register Number" required error={errors.registerNumber} disabled={disabled}>
          <input type="text" name="registerNumber" value={data.registerNumber} onChange={onChange} placeholder="Last Exam Reg No" required disabled={disabled} />
      </FormField>

      <div className="md:col-span-2">
          <FormField label="Last Institution Name (School / College)" required error={errors.lastInstitute} disabled={disabled}>
              <input type="text" name="lastInstitute" value={data.lastInstitute} onChange={onChange} placeholder="Full School / College Name" required disabled={disabled} />
          </FormField>
      </div>

      <FormField label="Institution District" disabled={disabled}>
          <select name="lastInstituteDistrict" value={data.lastInstituteDistrict} onChange={e => onDistrictChange('lastInstituteDistrict', e.target.value, 'lastInstituteState')} disabled={disabled}>
              <option value="">Select District</option>
              {master?.districts?.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
      </FormField>

      <FormField label="Institution State" disabled={disabled}>
          <input type="text" name="lastInstituteState" value={data.lastInstituteState} placeholder="Auto-filled" readOnly disabled={disabled} className="bg-slate-50 font-bold" />
      </FormField>
    </div>

    <div className="pt-8 border-t border-slate-200">
        <SectionTitle title="Educational History" subtitle="Add your schooling progression from 6th standard onwards." />
        <EducationHistory eduHistory={eduHistory} setEduHistory={setEduHistory} onDistrictChange={onEduHistDistrictChange} master={master} disabled={disabled} />
    </div>
  </div>
);

const MarksEntry = ({ data, errors, onChange, master, disabled }) => {
  const getSubjectsForBoard = () => {
    const board = data.qualifyingBoard?.trim().toLocaleLowerCase();
    if (board?.includes('cbse')) return master?.cbseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
    if (board?.includes('icse')) return master?.icseSubjects || ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Science'];
    if (board?.includes('state') || board?.includes('board')) return master?.stateBoardSubjects || ['Language', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology'];
    if (board?.includes('iti')) return master?.itiSubjects || ['Trade Practical', 'Trade Theory', 'Work Shop', 'Drawing', 'Social'];
    return master?.otherSubjects || ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'];
  };

  const defaultSubjects = getSubjectsForBoard();
  const subjects = [
    { nameKey: 'sub1Name', obtKey: 'sub1Obtained', maxKey: 'sub1Max', default: defaultSubjects[0] || 'Subject 1' },
    { nameKey: 'sub2Name', obtKey: 'sub2Obtained', maxKey: 'sub2Max', default: defaultSubjects[1] || 'Subject 2' },
    { nameKey: 'sub3Name', obtKey: 'sub3Obtained', maxKey: 'sub3Max', default: defaultSubjects[2] || 'Subject 3' },
    { nameKey: 'sub4Name', obtKey: 'sub4Obtained', maxKey: 'sub4Max', default: defaultSubjects[3] || 'Subject 4' },
    { nameKey: 'sub5Name', obtKey: 'sub5Obtained', maxKey: 'sub5Max', default: defaultSubjects[4] || 'Subject 5' },
    { nameKey: 'sub6Name', obtKey: 'sub6Obtained', maxKey: 'sub6Max', default: defaultSubjects[5] || 'Subject 6' },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title="5. Qualifying Marks Entry" subtitle="Enter your marks as per your official marksheet. Cutoff and percentage will be calculated automatically." />
      
      {!data.qualifyingBoard && (
        <div className="bg-red-50 p-8 border border-red-200 rounded text-center">
            <p className="text-red-700 font-bold mb-2 uppercase tracking-wide">Board Not Selected</p>
            <p className="text-sm text-red-600">Please go back to Step 4 and select your Qualifying examination board first.</p>
        </div>
      )}

      {data.qualifyingBoard && (
        <>
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-4 mb-8">
                <FormField label="HSC Register Number" required error={errors.hscRegisterNo} disabled={disabled}>
                    <input type="text" name="hscRegisterNo" value={data.hscRegisterNo} onChange={onChange} placeholder="Roll No" disabled={disabled} />
                </FormField>

                <FormField label="Exam Pattern" disabled={disabled}>
                    <select name="hscExamType" value={data.hscExamType} onChange={onChange} disabled={disabled}>
                        <option value="">Select Pattern</option>
                        {(master?.hscExamType || ['Regular', 'Private', 'Vocational']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FormField>

                <FormField label="Subject Stream" disabled={disabled}>
                    <select name="hscMajorStream" value={data.hscMajorStream} onChange={onChange} disabled={disabled}>
                        <option value="">Select Stream</option>
                        {(master?.hscMajorStream || ['Science (PCM)', 'Commerce', 'Arts', 'Diploma']).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </FormField>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sl.No</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject Name</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Marks Obtained</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Maximum Marks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {subjects.map((s, index) => (
                          <tr key={s.nameKey} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-slate-400">{index + 1}</td>
                            <td className="px-6 py-4">
                                <input type="text" name={s.nameKey} value={data[s.nameKey] || s.default} onChange={onChange} className="w-full text-xs font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-700" placeholder={s.default} disabled={disabled} />
                            </td>
                            <td className="px-6 py-4">
                                <input type="number" name={s.obtKey} value={data[s.obtKey]} onChange={onChange} className="w-24 mx-auto block text-center font-bold text-blue-600 border border-slate-200 rounded py-1.5 px-2 focus:ring-1 focus:ring-blue-500 text-sm" placeholder="0" disabled={disabled} />
                            </td>
                            <td className="px-6 py-4">
                                <input type="number" name={s.maxKey} value={data[s.maxKey]} onChange={onChange} className="w-24 mx-auto block text-center font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded py-1.5 px-2 text-sm" placeholder="100" disabled={disabled} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="p-6 border-2 border-slate-200 rounded-lg bg-white flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Percentage Aggregate</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{data.hscPercentage || '0.00'} %</p>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Percent size={24} />
                    </div>
                </div>
                <div className="p-6 border-2 border-blue-600 rounded-lg bg-blue-50 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Engineering Cutoff Score</p>
                        <p className="text-3xl font-black text-blue-900 tracking-tight">{data.hscCutoff || '0.00'} <span className="text-sm font-bold opacity-40">/ 200</span></p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600">
                        <Award size={24} />
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

const DetailedHistory = ({ data, errors, onChange, disabled }) => (
  <div className="space-y-8">
    <SectionTitle title="6. SSLC (10th) Mark Matrix" subtitle="Provide your secondary school leaving certificate details and mark breakdown." />
    
    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
      <FormField label="SSLC Register Number" required error={errors.sslcRegisterNo} disabled={disabled}>
          <input type="text" name="sslcRegisterNo" value={data.sslcRegisterNo} onChange={onChange} placeholder="Secondary Exam ID" disabled={disabled} />
      </FormField>
      <FormField label="Marksheet Serial Number" required error={errors.sslcMarksheetNo} disabled={disabled}>
          <input type="text" name="sslcMarksheetNo" value={data.sslcMarksheetNo} onChange={onChange} placeholder="Serial Number" disabled={disabled} />
      </FormField>
    </div>
    
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sl.No</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Marks Obtained</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Max Marks</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {[
                    { label: 'Language 1 (Tamil/Other)', nameKey: 'sslcSub1', obtKey: 'sslcSub1Obt', maxKey: 'sslcSub1Max' },
                    { label: 'Language 2 (English)', nameKey: 'sslcSub2', obtKey: 'sslcSub2Obt', maxKey: 'sslcSub2Max' },
                    { label: 'Mathematics', nameKey: 'sslcSub3', obtKey: 'sslcSub3Obt', maxKey: 'sslcSub3Max' },
                    { label: 'Science', nameKey: 'sslcSub4', obtKey: 'sslcSub4Obt', maxKey: 'sslcSub4Max' },
                    { label: 'Social Science', nameKey: 'sslcSub5', obtKey: 'sslcSub5Obt', maxKey: 'sslcSub5Max' },
                ].map((s, idx) => (
                    <tr key={s.nameKey} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{s.label}</td>
                        <td className="px-6 py-4">
                            <input type="number" name={s.obtKey} value={data[s.obtKey]} onChange={onChange} className="w-20 mx-auto block text-center font-bold text-blue-600 border border-slate-200 rounded py-1 px-2 text-sm" placeholder="0" disabled={disabled} />
                        </td>
                        <td className="px-6 py-4">
                            <input type="number" name={s.maxKey} value={data[s.maxKey]} onChange={onChange} className="w-20 mx-auto block text-center font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded py-1 px-2 text-sm" placeholder="100" disabled={disabled} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

    <div className="bg-slate-800 p-6 rounded-lg text-white flex justify-between items-center">
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SSLC Cumulative Percentage</p>
            <p className="text-xs text-slate-500">Calculated based on 5 primary subjects</p>
        </div>
        <p className="text-3xl font-black">{data.sslcPercentage || '0.00'} %</p>
    </div>
  </div>
);

const SpecialCategory = ({ data, onChange, disabled }) => (
  <div className="space-y-6">
    <SectionTitle title="7. Special Category Reservations" subtitle="Select applicable categories for reservation eligibility." />
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <CheckboxCard label="Physically Abled" name="isDifferentlyAbled" checked={data.isDifferentlyAbled} onChange={onChange} disabled={disabled} />
      <CheckboxCard label="Ex-Serviceman" name="isExServiceman" checked={data.isExServiceman} onChange={onChange} disabled={disabled} />
      <CheckboxCard label="Eminent Sports Person" name="isSportsPerson" checked={data.isSportsPerson} onChange={onChange} disabled={disabled} />
      <CheckboxCard label="7.5% Govt School" name="isGovtStudent" checked={data.isGovtStudent} onChange={onChange} disabled={disabled} />
    </div>
    <div className="p-4 bg-blue-50 text-blue-800 rounded border border-blue-200 text-xs font-semibold flex items-start gap-3">
        <div className="bg-blue-600 text-white rounded-full p-0.5 flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={4} /></div>
        <p>Information provided here must be supported by original government certificates during the time of admission verification.</p>
    </div>
  </div>
);

const CollegeChoice = ({ data, onChange, onPrefChange, colleges, master, disabled }) => {
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredColleges = colleges
    .filter(c => c.ins_type !== 'Self Finance')
    .filter(c => {
      const matchCity = !cityFilter || c.ins_city === cityFilter;
      const matchType = !typeFilter || c.ins_type === typeFilter;
      return matchCity && matchType;
    });

  const validColleges = colleges.filter(c => c.ins_type !== 'Self Finance');
  const cities = [...new Set(validColleges.map(c => c.ins_city).filter(Boolean))].sort();
  const allTypes = master?.insType || ['Government', 'Aided', 'Self Finance'];
  const types = allTypes.filter(t => t !== 'Self Finance');
  const prefs = Array.isArray(data.preferences) ? data.preferences : [];

  const addPreference = () => { if (!disabled) onPrefChange(prefs.length, ''); };
  const removePreference = (index) => {
    if (!disabled) {
      const newPrefs = prefs.filter((_, i) => i !== index);
      newPrefs.forEach((pref, idx) => onPrefChange(idx, pref));
      onPrefChange(newPrefs.length, null);
    }
  };

  return (
    <div className="space-y-8">
      <SectionTitle title="8. College Preferences" subtitle="Select your preferred colleges in order of priority. Only Government and Aided institutions are listed." />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Facility Requirements */}
        <div className="md:col-span-1 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Facilities</h4>
            <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${disabled ? 'bg-slate-50 opacity-60' : data.hostelRequired ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input type="checkbox" name="hostelRequired" checked={data.hostelRequired} onChange={onChange} className="w-4 h-4" disabled={disabled} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Hostel Required</span>
                </label>
                {data.gender?.toLowerCase() === 'female' && (
                <label className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-all ${disabled ? 'bg-slate-50 opacity-60' : data.womensHostel ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <input type="checkbox" name="womensHostel" checked={data.womensHostel} onChange={onChange} className="w-4 h-4" disabled={disabled} />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Women's Hostel</span>
                </label>
                )}
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded space-y-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Filters</h5>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">By City</label>
                   <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-slate-300 rounded">
                       <option value="">All Cities</option>
                       {cities.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">By Management</label>
                   <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-slate-300 rounded">
                       <option value="">All Types</option>
                       {types.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
            </div>
        </div>

        {/* Priority List */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Choice Priority List</h4>
                {!disabled && (
                  <button type="button" onClick={addPreference} disabled={prefs.length >= filteredColleges.length}
                    className="text-[10px] font-bold text-blue-600 uppercase hover:underline">
                    + Add New Choice
                  </button>
                )}
            </div>

            <div className="space-y-3">
                {prefs.map((pref, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="w-6 h-6 flex-shrink-0 bg-white border border-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {i + 1}
                      </span>
                      <select className="flex-1 text-xs font-bold bg-transparent border-none focus:ring-0 text-slate-700 py-1" value={pref || ''} onChange={e => onPrefChange(i, e.target.value)} disabled={disabled}>
                        <option value="">Choose College...</option>
                        {filteredColleges.map(c => (
                          <option key={c.id || c.ins_code} value={c.ins_code} disabled={prefs.includes(c.ins_code) && prefs[i] !== c.ins_code}>
                            [{c.ins_code}] {c.ins_name} — {c.ins_city}
                          </option>
                        ))}
                      </select>
                      {!disabled && (
                        <button type="button" onClick={() => removePreference(i)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                ))}
                {prefs.length === 0 && (
                  <div className="py-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                    Primary college choices go here
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

const DocumentUploads = ({ data, onUpload, disabled }) => (
  <div className="space-y-8">
    <SectionTitle title="9. Document Cabinet" subtitle="Upload clear scanned copies of your official certificates for verification." />
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      <UploadBox label="Passport Photo" subLabel="Mandatory • JPG/PNG" docType="photo" currentPath={data.photoPath} onUpload={onUpload} accept="image/*" disabled={disabled} />
      <UploadBox label="Qualifying Marksheet" subLabel="HSC / Result Scan" docType="marksheet" currentPath={data.marksheetPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={disabled} />
      <UploadBox label="Transfer Certificate" subLabel="PDF / Image" docType="tc" currentPath={data.tcPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={disabled} />
      <UploadBox label="Community Cert." subLabel="Optional for OC" docType="community" currentPath={data.communityPath} onUpload={onUpload} accept=".pdf,.jpg,.jpeg,.png" disabled={disabled} />
    </div>
    <div className="p-6 bg-slate-50 border border-slate-200 rounded">
      <div className="flex gap-4">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 mt-1"><Check size={18} strokeWidth={3} /></div>
        <div>
           <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-2">Applicant Declaration</h5>
           <p className="text-xs font-medium text-slate-600 leading-relaxed">
             I hereby solemnly declare that the facts given in this application are true to the best of my knowledge and belief. I understand that any false statement will disqualify me from the admission process and lead to immediate cancellation of my candidacy.
           </p>
        </div>
      </div>
    </div>
  </div>
);

const UploadBox = ({ label, subLabel, docType, currentPath, onUpload, accept, disabled }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const handleChange = async (e) => {
    if (disabled) return;
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File size exceeds 5MB'); return; }
    setUploading(true);
    await onUpload(file, docType);
    setUploading(false);
  };

  return (
    <div onClick={() => !uploading && !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded p-6 flex flex-col items-center justify-center gap-4 transition-all min-h-[160px]
        ${disabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'}
        ${currentPath ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white'}`}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} disabled={disabled} />
      
      <div className={`w-12 h-12 rounded flex items-center justify-center transition-all
        ${currentPath ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {uploading ? <Loader size={20} className="animate-spin" /> : currentPath ? <Check size={20} strokeWidth={3} /> : <Upload size={20} />}
      </div>

      <div className="text-center">
        <p className="font-bold text-xs text-slate-700 tracking-tight">{label}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{subLabel}</p>
      </div>
      
      {currentPath && (
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Document Secured</p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// NEW DYNAMIC COMPONENTS
// ─────────────────────────────────────────────────────────

const EducationHistory = ({ eduHistory, setEduHistory, onDistrictChange, master, disabled }) => {
  const addRow = () => {
    if (disabled) return;
    setEduHistory([...eduHistory, { standard: "", school: "", year: "", state: "Tamil Nadu", district: "" }]);
  };

  const removeRow = (index) => {
    if (disabled || eduHistory.length <= 1) return;
    setEduHistory(eduHistory.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    if (disabled) return;
    const newHistory = [...eduHistory];
    newHistory[index][field] = value;
    setEduHistory(newHistory);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Progression (6th - 12th)</h4>
        {!disabled && (
          <button type="button" onClick={addRow} className="text-[9px] font-bold bg-blue-600 text-white px-3 py-1 rounded uppercase tracking-wider hover:bg-blue-700 transition-colors">
            + Add Row
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-slate-50/30">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Standard</th>
              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">School Name</th>
              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">Year of Passing</th>
              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">District</th>
              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">State</th>
              {!disabled && <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eduHistory.map((row, idx) => (
              <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2">
                  <select value={row.standard} onChange={(e) => updateRow(idx, 'standard', e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-none bg-transparent focus:ring-0">
                    {['6', '7', '8', '9', '10', '11', '12'].map(s => <option key={s} value={s}>{s}th</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.school} onChange={(e) => updateRow(idx, 'school', e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-none bg-transparent focus:ring-0" placeholder="School Name" />
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.year} onChange={(e) => updateRow(idx, 'year', e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-none bg-transparent focus:ring-0" placeholder="YYYY" />
                </td>
                <td className="px-4 py-2">
                  <select value={row.district} onChange={(e) => onDistrictChange(idx, e.target.value)} disabled={disabled} className="w-full text-xs font-bold border-none bg-transparent focus:ring-0">
                    <option value="">Select District</option>
                    {master?.districts?.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input type="text" value={row.state} readOnly disabled={disabled} className="w-full text-xs font-bold border-none bg-transparent focus:ring-0 text-slate-400" placeholder="State" />
                </td>
                {!disabled && (
                  <td className="px-4 py-2 text-center">
                    <button type="button" onClick={() => removeRow(idx)} disabled={eduHistory.length <= 1} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EducationSelector = ({ selectedType, setQualifyingType, disabled }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
    {['SSLC', 'ITI', 'VOC', 'HSC'].map((type) => (
      <button
        key={type}
        type="button"
        disabled={disabled}
        onClick={() => setQualifyingType(type.toLowerCase())}
        className={`px-4 py-3 rounded border font-bold text-xs uppercase tracking-widest transition-all
          ${selectedType === type.toLowerCase() ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-100' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
      >
        {type}
      </button>
    ))}
  </div>
);

const AttemptManager = ({ type, attempts, setAttempts, selectedAttempts, setSelectedAttempts, disabled }) => {
  const toggleAttempt = (id) => {
    if (disabled || id === 1) return;
    const current = selectedAttempts[type] || [1];
    if (current.includes(id)) {
      setSelectedAttempts({ ...selectedAttempts, [type]: current.filter(a => a !== id) });
    } else {
      setSelectedAttempts({ ...selectedAttempts, [type]: [...current, id].sort() });
    }
  };

  const updateAttemptData = (id, field, value) => {
    if (disabled) return;
    const typeAtts = attempts[type] || {};
    setAttempts({
      ...attempts,
      [type]: {
        ...typeAtts,
        [id]: { ...(typeAtts[id] || {}), [field]: value }
      }
    });
  };

  const currentSelected = selectedAttempts[type] || [1];

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mark Attempt Tracking</h4>
          <p className="text-xs text-slate-500 font-medium italic mt-1">Select all attempts you have taken for this qualification.</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(id => (
            <label key={id} className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-all ${id === 1 ? 'opacity-50' : ''} ${currentSelected.includes(id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400'}`}>
              <input type="checkbox" checked={currentSelected.includes(id)} onChange={() => toggleAttempt(id)} disabled={disabled || id === 1} className="hidden" />
              <span className="text-[10px] font-black uppercase">Att {id}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {currentSelected.map(id => (
          <div key={id} className="p-6 border border-slate-200 rounded-lg bg-slate-50/30">
            <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px]">{id}</span>
              Details for Attempt {id}
            </h5>
            <div className="grid md:grid-cols-5 gap-4">
              <FormField label="Register Number">
                <input type="text" value={attempts[type]?.[id]?.registerNo || ''} onChange={e => updateAttemptData(id, 'registerNo', e.target.value)} disabled={disabled} className="text-xs font-bold" placeholder="Reg No" />
              </FormField>
              <FormField label="Marksheet No">
                <input type="text" value={attempts[type]?.[id]?.marksheetNo || ''} onChange={e => updateAttemptData(id, 'marksheetNo', e.target.value)} disabled={disabled} className="text-xs font-bold" placeholder="Serial No" />
              </FormField>
              <FormField label="Exam Month">
                <select value={attempts[type]?.[id]?.month || ''} onChange={e => updateAttemptData(id, 'month', e.target.value)} disabled={disabled} className="text-xs font-bold">
                  <option value="">Select</option>
                  {['March', 'April', 'May', 'June', 'September', 'October'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>
              <FormField label="Exam Year">
                <input type="text" value={attempts[type]?.[id]?.year || ''} onChange={e => updateAttemptData(id, 'year', e.target.value)} disabled={disabled} maxLength={4} className="text-xs font-bold" placeholder="YYYY" />
              </FormField>
              <FormField label="Total Marks">
                <input type="text" value={attempts[type]?.[id]?.totalMatch || ''} onChange={e => updateAttemptData(id, 'totalMatch', e.target.value)} disabled={disabled} className="text-xs font-bold text-blue-600" placeholder="0" />
              </FormField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarksTable = ({ type, data, setData, disabled }) => {
  const config = SUBJECT_CONFIG[type?.toUpperCase()] || { count: 0, subjects: [] };
  
  const updateMark = (idx, field, value) => {
    if (disabled) return;
    const typeMarks = data[type?.toUpperCase()] || { subjects: [] };
    const newSubjects = [...typeMarks.subjects];
    if (!newSubjects[idx]) newSubjects[idx] = { name: config.subjects[idx] || `Subject ${idx+1}`, obtained: '', max: '100' };
    newSubjects[idx][field] = value;
    setData({ ...data, [type?.toUpperCase()]: { ...typeMarks, subjects: newSubjects } });
  };

  // Auto-calculate Total
  const typeMarks = data[type?.toUpperCase()] || { subjects: [] };
  const totalObt = typeMarks.subjects.reduce((sum, s) => sum + (Number(s?.obtained) || 0), 0);
  const totalMax = typeMarks.subjects.reduce((sum, s) => sum + (Number(s?.max) || 0), 0);
  const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Marks Obtained</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Max Marks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {config.subjects.map((name, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-xs font-bold text-slate-700">{name}</td>
                <td className="px-6 py-4 text-center">
                  <input type="number" 
                    value={typeMarks.subjects[idx]?.obtained || ''} 
                    onChange={e => updateMark(idx, 'obtained', e.target.value)} 
                    disabled={disabled}
                    className="w-20 text-center font-bold text-blue-600 border-slate-200 p-1.5 text-sm" placeholder="0" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="number" 
                    value={typeMarks.subjects[idx]?.max || '100'} 
                    onChange={e => updateMark(idx, 'max', e.target.value)} 
                    disabled={disabled}
                    className="w-20 text-center font-bold text-slate-400 bg-slate-50 border-slate-200 p-1.5 text-sm" placeholder="100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
          <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Calculated</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">{totalObt} <span className="text-xs font-bold text-slate-400">/ {totalMax}</span></p>
              </div>
          </div>
          <div className="p-6 border-2 border-blue-600 rounded-lg bg-blue-50 flex justify-between items-center">
              <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Percentage Aggregate</p>
                  <p className="text-2xl font-black text-blue-800 tracking-tight">{percentage} %</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
