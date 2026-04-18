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
      user = await Institution.findByUserId(identifier);
    } else if (role === 'student') {
      // For students, use email instead of user_id
      user = await Student.findByEmail(identifier);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id || user.user_id, role: role, name: user.user_name || user.name || user.student_name },
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
        name: user.user_name || user.name || user.student_name,
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

module.exports = { login, logout };
