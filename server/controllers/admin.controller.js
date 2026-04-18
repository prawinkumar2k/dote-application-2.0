const db = require('../config/db.config');
const Institution = require('../models/institution.model');
const Student = require('../models/student.model');

const getDashboard = async (req, res) => {
  try {
    const [[{ totalColleges }]] = await db.query('SELECT COUNT(*) as totalColleges FROM institution_master WHERE ins_status="1"');
    const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM student_master');
    const [[{ totalApplications }]] = await db.query('SELECT COUNT(*) as totalApplications FROM student_master WHERE application_no IS NOT NULL');
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM user_master');

    const [recentColleges] = await db.query(
      'SELECT id, ins_code, ins_name, ins_type, ins_district, ins_status FROM institution_master WHERE ins_status="1" ORDER BY id DESC LIMIT 5'
    );

    res.json({
      success: true,
      stats: { totalColleges, totalStudents, totalApplications, totalUsers },
      recentColleges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getColleges = async (req, res) => {
  try {
    const { search = '', district = '', page = 1, limit = 20 } = req.query;
    const result = await Institution.getAll({ search, district, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, colleges: result.rows, total: result.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFilters = async (req, res) => {
  try {
    const cities = await Institution.getCities();
    const types = await Institution.getTypes();
    res.json({ success: true, cities, types });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getStudents = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const result = await Student.getAll({ search, page: parseInt(page), limit: parseInt(limit) });
    res.json({ success: true, students: result.rows, total: result.total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getColleges, getFilters, getStudents };
