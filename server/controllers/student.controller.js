const Student = require('../models/student.model');
const Application = require('../models/application.model');
const path = require('path');

const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const marks = await Application.findByStudentId(student.id);

    const completedSteps = [
      student.student_name && student.dob && student.gender ? 1 : 0,
      student.email && student.communication_address ? 1 : 0,
      student.father_name && student.mother_name ? 1 : 0,
      student.last_institution_board && student.last_institution_register_no ? 1 : 0,
      marks && marks.hsc_subject1_obtained_mark ? 1 : 0,
      marks && marks.sslc_register_no ? 1 : 0,
      student.differently_abled !== null ? 1 : 0,
      student.college_choices ? 1 : 0,
      student.photo ? 1 : 0,
    ].filter(Boolean).length;

    res.json({
      success: true,
      student,
      marks: marks || null,
      completedSteps,
      isSubmitted: !!student.application_no,
      applicationNo: student.application_no,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const saveStep = async (req, res) => {
  try {
    const step = parseInt(req.params.step);
    const id = req.user.id;
    const data = req.body;

    switch (step) {
      case 1: await Student.updateStep1(id, data); break;
      case 2: await Student.updateStep2(id, data); break;
      case 3: await Student.updateStep3(id, data); break;
      case 4: await Student.updateStep4(id, data); break;
      case 5: await Application.upsertStep5(id, data); break;
      case 6: await Application.upsertStep6(id, data); break;
      case 7: await Student.updateStep7(id, data); break;
      case 8: await Student.updateStep8(id, data); break;
      default: return res.status(400).json({ message: 'Invalid step' });
    }

    res.json({ success: true, message: `Step ${step} saved` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const id = req.user.id;
    const docType = req.body.docType;
    const filePath = '/uploads/student/' + req.file.filename;

    switch (docType) {
      case 'photo': await Student.updatePhoto(id, filePath); break;
      case 'tc': await Student.updateTC(id, filePath); break;
      case 'marksheet': await Student.updateMarksheet(id, filePath); break;
      case 'community': await Student.updateCommunity(id, filePath); break;
      default: return res.status(400).json({ message: 'Invalid document type' });
    }

    res.json({ success: true, path: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitApplication = async (req, res) => {
  try {
    const id = req.user.id;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (student.application_no) {
      return res.json({ success: true, applicationNo: student.application_no, message: 'Already submitted' });
    }
    const appNo = await Student.submit(id);
    res.json({ success: true, applicationNo: appNo, message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMe, saveStep, uploadDocument, submitApplication };
