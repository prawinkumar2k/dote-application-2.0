const db = require('../config/db.config');

const Institution = {
  findByUserId: async (userId) => {
    const [rows] = await db.query('SELECT * FROM institution_master WHERE user_id = ?', [userId]);
    return rows[0];
  },

  // Add more queries for college management here
};

module.exports = Institution;
