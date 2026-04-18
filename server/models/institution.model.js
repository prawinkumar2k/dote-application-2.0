const db = require('../config/db.config');

const Institution = {
  findByInsCode: async (insCode) => {
    const [rows] = await db.query('SELECT * FROM institution_master WHERE ins_code = ?', [insCode]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM institution_master WHERE id = ?', [id]);
    return rows[0];
  },

  getAll: async ({ search = '', city = '', type = '', page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, ins_code, ins_name, ins_type, ins_district, ins_city, ins_status,
                 ins_principal, ins_phone_number, ins_email_id_office
                 FROM institution_master WHERE ins_status = "1"`;
    const params = [];

    if (search) {
      query += ' AND (ins_name LIKE ? OR ins_code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (city) {
      query += ' AND ins_city = ?';
      params.push(city);
    }
    if (type) {
      query += ' AND ins_type = ?';
      params.push(type);
    }

    query += ' ORDER BY ins_name LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM institution_master WHERE ins_status = "1"';
    const countParams = [];
    if (search) { countQuery += ' AND (ins_name LIKE ? OR ins_code LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    if (city) { countQuery += ' AND ins_city = ?'; countParams.push(city); }
    if (type) { countQuery += ' AND ins_type = ?'; countParams.push(type); }

    const [[{ total }]] = await db.query(countQuery, countParams);
    return { rows, total };
  },

  getCities: async () => {
    const [rows] = await db.query(
      `SELECT DISTINCT ins_city FROM institution_master
       WHERE ins_status = "1" AND ins_city IS NOT NULL
       ORDER BY ins_city`
    );
    return rows.map(r => r.ins_city);
  },

  getTypes: async () => {
    const [rows] = await db.query(
      `SELECT DISTINCT ins_type FROM institution_master
       WHERE ins_type IS NOT NULL ORDER BY ins_type`
    );
    return rows.map(r => r.ins_type);
  },
};

module.exports = Institution;
