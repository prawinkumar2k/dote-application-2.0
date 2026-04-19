const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Institution = require('../models/institution.model');
const Student = require('../models/student.model');

const login = async (req, res) => {
  try {
    const { userId, password, role } = req.body;

    if (!userId || !password || !role) {
      return res.status(400).json({ message: 'Please provide all details' });
    }

    let user;
    if (role === 'admin') {
      user = await User.findByUserId(userId);
    } else if (role === 'college') {
      user = await Institution.findByUserId(userId);
    } else if (role === 'student') {
      user = await Student.findByUserId(userId);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id || user.user_id, role: role, name: user.user_name || user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.status(200).cookie('token', token, cookieOptions).json({
      success: true,
      role: role,
      user: {
        id: user.id || user.user_id,
        name: user.user_name || user.name,
        role: role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const addCollege = async (req, res) => {
  try {
    const { ins_code, ins_name } = req.body;

    if (!ins_code || !ins_name) {
      return res.status(400).json({ message: 'Institution Code and Name are required' });
    }

    const insertId = await Institution.create(req.body);

    res.status(201).json({
      success: true,
      message: 'College added successfully',
      id: insertId
    });
  } catch (err) {
    console.error('Add college error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Institution with this code already exists' });
    }
    res.status(500).json({ message: 'Server error while adding college' });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const [totalColleges, totalStudents, totalAdmins, govtColleges, aidedColleges, selfFinanceColleges, communityBreakdown, casteBreakdown, schoolTypeBreakdown, collegeDemographics] = await Promise.all([
      Institution.getCount(),
      Student.getCount(),
      User.getAdminCount(),
      Institution.getCountByType('Government'),
      Institution.getCountByType('Aided'),
      Institution.getCountByType('Self Finance'),
      Student.getCommunityBreakdown(),
      Student.getCasteBreakdown(),
      Student.getSchoolTypeBreakdown(),
      Institution.getDemographics(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalColleges,
        totalStudents,
        totalAdmins,
        govtColleges,
        aidedColleges,
        selfFinanceColleges,
      },
      communityBreakdown,
      casteBreakdown,
      schoolTypeBreakdown,
      collegeDemographics,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};

const getColleges = async (req, res) => {
  try {
    const colleges = await Institution.getAll();
    res.status(200).json({ success: true, colleges });
  } catch (err) {
    console.error('Fetch colleges error:', err);
    res.status(500).json({ message: 'Server error while fetching colleges' });
  }
};

module.exports = { login, logout, addCollege, getDashboardStats, getColleges };
