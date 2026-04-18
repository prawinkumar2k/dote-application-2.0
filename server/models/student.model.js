const db = require('../config/db.config');

const Student = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM student_master WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM student_master WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO student_master (student_name, email, mobile, dob, gender, role, user_id, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.student_name, data.email, data.mobile, data.dob, data.gender, data.role, data.user_id, data.password]
    );
    return result.insertId;
  },

  updateStep1: async (id, d) => {
    await db.query(
      `UPDATE student_master SET student_name=?, dob=?, gender=?, aadhar=?, religion=?, community=?, caste=?,
       admission_type=?, mother_tongue=?, medium_of_instruction=?, nativity=? WHERE id=?`,
      [d.fullName, d.dob, d.gender, d.aadhaar, d.religion, d.community, d.caste,
       d.admissionType || null, d.motherTongue || null, d.mediumOfInstruction || null, d.nativity || null, id]
    );
  },

  updateStep2: async (id, d) => {
    await db.query(
      `UPDATE student_master SET email=?, alt_mobile=?, communication_address=?, permanent_address=? WHERE id=?`,
      [d.email, d.alternateMobile || null, d.commAddress, d.sameAsComm ? d.commAddress : d.permAddress, id]
    );
  },

  updateStep3: async (id, d) => {
    await db.query(
      `UPDATE student_master SET father_name=?, mother_name=?, parent_occupation=?, parent_annual_income=? WHERE id=?`,
      [d.fatherName, d.motherName, d.parentOccupation, d.annualIncome, id]
    );
  },

  updateStep4: async (id, d) => {
    await db.query(
      `UPDATE student_master SET last_institution_board=?, last_institution_register_no=?, last_institution_name=?,
       last_institution_district=? WHERE id=?`,
      [d.qualifyingBoard, d.registerNumber, d.lastInstitute, d.lastInstituteDistrict || null, id]
    );
  },

  updateStep7: async (id, d) => {
    await db.query(
      `UPDATE student_master SET differently_abled=?, ex_servicemen=?, eminent_sports=?, school_type=? WHERE id=?`,
      [d.isDifferentlyAbled ? 'yes' : 'no', d.isExServiceman ? 'yes' : 'no',
       d.isSportsPerson ? 'yes' : 'no', d.isGovtStudent ? 'govt' : 'private', id]
    );
  },

  updateStep8: async (id, d) => {
    await db.query(
      `UPDATE student_master SET college_choices=?, hostel_choice=?, womens_choice=? WHERE id=?`,
      [JSON.stringify(d.preferences || []), d.hostelRequired ? 'yes' : 'no', d.womensHostel ? 'yes' : 'no', id]
    );
  },

  updatePhoto: async (id, path) => {
    await db.query('UPDATE student_master SET photo=? WHERE id=?', [path, id]);
  },

  updateTC: async (id, path) => {
    await db.query('UPDATE student_master SET transfer_certificate=? WHERE id=?', [path, id]);
  },

  updateMarksheet: async (id, path) => {
    await db.query('UPDATE student_master SET marksheet_certificate=? WHERE id=?', [path, id]);
  },

  updateCommunity: async (id, path) => {
    await db.query('UPDATE student_master SET community_certificate=? WHERE id=?', [path, id]);
  },

  submit: async (id) => {
    const appNo = 'DOTE-2026-' + String(id).padStart(6, '0');
    await db.query('UPDATE student_master SET application_no=? WHERE id=?', [appNo, id]);
    return appNo;
  },

  getAll: async ({ search = '', page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, application_no, student_name, email, mobile, community, gender,
                 differently_abled, application_no, created_at FROM student_master WHERE 1=1`;
    const params = [];
    if (search) {
      query += ' AND (student_name LIKE ? OR email LIKE ? OR application_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(query, params);
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM student_master');
    return { rows, total };
  },
};

module.exports = Student;
