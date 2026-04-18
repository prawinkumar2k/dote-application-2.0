const express = require('express');
const { getDashboardStats, getAllColleges } = require('../controllers/admin.controller');
const db = require('../config/db.config');
const router = express.Router();

router.get('/dashboard/stats', getDashboardStats);
router.get('/colleges', getAllColleges);

// DEBUG: inspect institution_master schema and first row
router.get('/debug/institution', async (req, res) => {
  try {
    const [columns] = await db.query('SHOW COLUMNS FROM institution_master');
    const [sample] = await db.query('SELECT * FROM institution_master LIMIT 1');
    res.json({ columns: columns.map(c => c.Field), sample });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
