const express = require('express');
const { getDashboardStats, getAllColleges } = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/colleges', getAllColleges);

module.exports = router;
