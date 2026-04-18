const db = require('../config/db.config');

const Student = {
  findByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM student_master WHERE user_id = ?', [userId]);
    return rows[0];
  },

  // Add more queries for student application here
};

module.exports = Student;
