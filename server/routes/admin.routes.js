const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getColleges, getFilters, getStudents } = require('../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/colleges', getColleges);
router.get('/filters', getFilters);
router.get('/students', getStudents);

module.exports = router;
