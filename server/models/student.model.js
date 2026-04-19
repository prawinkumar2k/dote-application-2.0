const db = require('../config/db.config');

const Student = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM student_master WHERE email = ?', [email]);
    return rows[0];
  },

  // Add more queries for student application here

  getCount: async () => {
    const [rows] = await db.query('SELECT COUNT(*) as total FROM student_master');
    return rows[0].total;
  },

  getCommunityBreakdown: async () => {
    const [rows] = await db.query(
      "SELECT COALESCE(community, 'Not Specified') as community, COUNT(*) as count FROM student_master GROUP BY community ORDER BY count DESC"
    );
    return rows;
  },

  getCasteBreakdown: async () => {
    const [rows] = await db.query(
      "SELECT COALESCE(caste, 'Not Specified') as caste, COUNT(*) as count FROM student_master GROUP BY caste ORDER BY count DESC"
    );
    return rows;
  },

  getSchoolTypeBreakdown: async () => {
    const [rows] = await db.query(
      "SELECT COALESCE(school_type, 'Not Specified') as school_type, COUNT(*) as count FROM student_master GROUP BY school_type ORDER BY count DESC"
    );
    return rows;
  },
};

module.exports = Student;
