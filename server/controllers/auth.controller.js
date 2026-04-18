const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Institution = require('../models/institution.model');
const Student = require('../models/student.model');

const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Please provide all details' });
    }

    let user;
    if (role === 'admin') {
      user = await User.findByUserId(identifier);
    } else if (role === 'college') {
      user = await Institution.findByInsCode(identifier);
    } else if (role === 'student') {
      user = await Student.findByEmail(identifier);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const name = user.user_name || user.student_name || user.ins_name;
    const token = jwt.sign(
      { id: user.id, role, name },
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
      role,
      user: { id: user.id, name, role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, mobile, dob, gender, password, confirmPassword } = req.body;

    if (!name || !email || !mobile || !dob || !gender || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await Student.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'STU' + Date.now();

    const studentId = await Student.create({
      student_name: name,
      email,
      mobile,
      dob,
      gender,
      role: 'student',
      user_id: userId,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: studentId, role: 'student', name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.status(201).cookie('token', token, cookieOptions).json({
      success: true,
      role: 'student',
      user: { id: studentId, name, role: 'student' },
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

module.exports = { login, register, logout };
