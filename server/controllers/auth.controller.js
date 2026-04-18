const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

/**
 * Helper: safely convert a DB password value to string.
 * MySQL2 can return BLOB/BINARY columns as Buffer — .toString() normalizes it.
 */
const toStr = (val) => (val ? val.toString() : null);

const register = async (req, res) => {
  try {
    const { name, email, password, mobile, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'student') {
      // Check if student already exists
      const [[existing]] = await db.query(
        'SELECT id FROM student_master WHERE email = ?',
        [email]
      );

      if (existing) {
        return res.status(409).json({ message: 'Student already registered with this email' });
      }

      // Create new student
      const [result] = await db.query(
        'INSERT INTO student_master (student_name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, mobile || null, hashedPassword, 'student']
      );

      const studentId = result.insertId;
      const token = jwt.sign(
        { id: studentId, role: 'student', name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        token,
        user: { id: studentId, name, email, role: 'student' }
      });
    } else {
      return res.status(400).json({ message: 'Registration only available for students' });
    }
  } catch (err) {
    console.error('[Register error]', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    let authUser = null;
    let displayName = '';

    // ─── COLLEGE ────────────────────────────────────────────────────────────
    if (role === 'college') {
      const [[college]] = await db.query(
        'SELECT * FROM institution_master WHERE ins_code = ?',
        [identifier]
      );

      console.log('[College login] Record:', college);

      if (!college) {
        return res.status(401).json({
          message: `No college found with ins_code "${identifier}"`,
        });
      }

      // FIX: Convert to string — MySQL2 may return Buffer for BINARY columns
      const storedPassword = toStr(college.password);
      console.log('[College login] storedPassword type:', typeof storedPassword, '| value:', storedPassword);

      if (!storedPassword) {
        return res.status(401).json({ message: 'Password not set for this college account' });
      }

      let isMatch = false;
      if (storedPassword.startsWith('$2')) {
        // bcrypt hashed
        isMatch = await bcrypt.compare(password, storedPassword);
      } else {
        // plain text
        isMatch = password.trim() === storedPassword.trim();
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      authUser = college;
      displayName = college.ins_name || college.ins_code;

    // ─── ADMIN ──────────────────────────────────────────────────────────────
    } else if (role === 'admin') {
      const [[userRecord]] = await db.query(
        'SELECT * FROM user_master WHERE user_id = ?',
        [identifier]
      );

      console.log('[Admin login] Record:', userRecord);

      if (!userRecord) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (userRecord.role !== role) {
        return res.status(401).json({ message: `This account is not registered as ${role}` });
      }

      const storedPassword = toStr(userRecord.password);
      let isMatch = false;
      if (storedPassword && storedPassword.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, storedPassword);
      } else {
        isMatch = password.trim() === (storedPassword || '').trim();
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      authUser = userRecord;
      displayName = toStr(userRecord.user_name) || userId;

    // ─── STUDENT ────────────────────────────────────────────────────────────
    } else if (role === 'student') {
      const [[student]] = await db.query(
        'SELECT * FROM student_master WHERE email = ? OR user_id = ?',
        [identifier, identifier]
      );

      console.log('[Student login] Record:', student);

      if (!student) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const storedPassword = toStr(student.password);
      let isMatch = false;
      if (storedPassword && storedPassword.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, storedPassword);
      } else {
        isMatch = password.trim() === (storedPassword || '').trim();
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      authUser = student;
      displayName = toStr(userRecord.user_name) || identifier;

    } else {
      return res.status(400).json({ message: `Unknown role: ${role}` });
    }

    // Guard: should never be null here, but safety first
    if (!authUser) {
      return res.status(500).json({ message: 'Authentication failed unexpectedly' });
    }

    const token = jwt.sign(
      { id: authUser.ins_code || authUser.user_id || authUser.id, role, name: displayName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const cookieOptions = {
      expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    res.status(200).cookie('token', token, cookieOptions).json({
      success: true,
      role,
      user: {
        id: authUser.ins_code || authUser.user_id || authUser.id,
        name: displayName,
        role,
      },
    });

  } catch (err) {
    console.error('[Login error]', err);
    res.status(500).json({ message: 'Server error', detail: err.message });
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
