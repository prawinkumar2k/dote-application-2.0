const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db.config');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const collegeRoutes = require('./routes/college.routes');
const studentRoutes = require('./routes/student.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Allow any localhost port in dev (Vite can run on 5173, 5174, etc.)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from any localhost port (Vite may pick different ports)
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Static file serving for student uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/student', studentRoutes);

// Public: college list for application form dropdown
app.get('/api/colleges/list', async (req, res) => {
  try {
    const { search = '', city = '', type = '' } = req.query;
    let query = 'SELECT ins_code, ins_name, ins_city, ins_type FROM institution_master WHERE 1=1';
    const params = [];
    if (search) { query += ' AND ins_name LIKE ?'; params.push(`%${search}%`); }
    if (city)   { query += ' AND ins_city = ?';   params.push(city); }
    if (type)   { query += ' AND ins_type = ?';   params.push(type); }
    query += ' LIMIT 500';
    const [rows] = await db.query(query, params);
    res.json({ success: true, colleges: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: master data for form dropdowns
app.get('/api/master', async (req, res) => {
  try {
    const [[communityRows], [religionRows], [genderRows], [boardRows], [occupationRows], [insTypeRows], [cityRows]] =
      await Promise.all([
        db.query('SELECT DISTINCT community FROM student_master WHERE community IS NOT NULL ORDER BY community'),
        db.query('SELECT DISTINCT religion FROM student_master WHERE religion IS NOT NULL ORDER BY religion'),
        db.query('SELECT DISTINCT gender FROM student_master WHERE gender IS NOT NULL ORDER BY gender'),
        db.query('SELECT DISTINCT last_institution_board FROM student_master WHERE last_institution_board IS NOT NULL ORDER BY last_institution_board'),
        db.query('SELECT DISTINCT parent_occupation FROM student_master WHERE parent_occupation IS NOT NULL ORDER BY parent_occupation'),
        db.query('SELECT DISTINCT ins_type FROM institution_master WHERE ins_type IS NOT NULL ORDER BY ins_type'),
        db.query('SELECT DISTINCT ins_city FROM institution_master WHERE ins_city IS NOT NULL AND LENGTH(ins_city) BETWEEN 3 AND 25 ORDER BY ins_city'),
      ]);

    const merge = (dbVals, standards) => [...new Set([...dbVals, ...standards])].sort();

    res.json({
      success: true,
      community:         merge(communityRows.map(r => r.community),             ['BC', 'MBC', 'OBC', 'OC', 'SC/ST']),
      religion:          merge(religionRows.map(r => r.religion),               ['Hindu', 'Christian', 'Muslim', 'Others']),
      gender:            merge(genderRows.map(r => r.gender),                   ['Male', 'Female', 'Transgender']),
      qualifyingBoard:   merge(boardRows.map(r => r.last_institution_board),    ['State Board', 'CBSE', 'ICSE', 'ITI', 'Others']),
      parentOccupation:  merge(occupationRows.map(r => r.parent_occupation),    ['Farmer', 'Business', 'Govt Employee', 'Private Employee', 'Daily Wages', 'Others']),
      insType:           insTypeRows.map(r => r.ins_type),
      cities:            cityRows.map(r => r.ins_city),
      motherTongue:      ['Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Urdu', 'Others'],
      mediumOfInstruction: ['Tamil', 'English', 'Urdu', 'Others'],
      admissionType:     ['First Year', 'Lateral Entry (2nd Year)', 'Part-Time'],
      hscExamType:       ['Regular', 'Private', 'Improvement'],
      hscMajorStream:    ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts'],
      nativity:          ['Tamil Nadu', 'Other State'],
      cbseSubjects:      ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer Science'],
      icseSubjects:      ['English', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Science'],
      stateBoardSubjects:['Tamil', 'English', 'Maths', 'Physics', 'Chemistry', 'Biology'],
      itiSubjects:       ['Trade Practical', 'Trade Theory', 'Work Shop', 'Drawing', 'Social'],
      vocationalSubjects:['Language', 'English', 'Maths', 'Theory', 'Practical-I', 'Practical-II'],
      otherSubjects:     ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('DOTE Admission Portal API is running...'));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong' });
});

module.exports = app;
