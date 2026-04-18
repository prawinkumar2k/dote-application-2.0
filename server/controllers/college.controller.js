const db = require('../config/db.config');
const Application = require('../models/application.model');

const getDashboard = async (req, res) => {
  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM student_master WHERE application_no IS NOT NULL'
    );
    res.json({ success: true, stats: { total, pending: total, approved: 0, rejected: 0 } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getApplications = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT id, application_no, student_name, email, mobile, community, gender,
                 differently_abled, eminent_sports, ex_servicemen, college_choices,
                 hsc_percentage, created_at
                 FROM student_master
                 LEFT JOIN mark_details ON mark_details.student_id = student_master.id
                 WHERE student_master.application_no IS NOT NULL`;
    const params = [];

    if (search) {
      query += ' AND (student_master.student_name LIKE ? OR student_master.application_no LIKE ? OR student_master.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY student_master.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM student_master WHERE application_no IS NOT NULL'
    );

    res.json({ success: true, applications: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(
      'SELECT * FROM student_master WHERE id = ? AND application_no IS NOT NULL', [id]
    );
    if (!students.length) return res.status(404).json({ message: 'Application not found' });

    const marks = await Application.findByStudentId(id);
    res.json({ success: true, student: students[0], marks: marks || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getApplications, getApplicationDetail };
