const db = require('../config/db.config');

const Master = {
  getAllCommunities: async () => {
    const [rows] = await db.query('SELECT community_name FROM community_master ORDER BY community_name');
    return rows.map(r => r.community_name);
  },

  getAllDistricts: async () => {
    const [rows] = await db.query('SELECT district_name, state_name FROM district_master ORDER BY district_name');
    return rows.map(r => ({
      name: r.district_name,
      state: r.state_name
    }));
  }
};

module.exports = Master;
