const express = require('express');
const { getDashboardStats, getAllApplications, updateApplicationStatus } = require('../controllers/college.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);
router.use(authorize('college'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/applications', getAllApplications);
router.put('/applications/:id/status', updateApplicationStatus);

module.exports = router;
