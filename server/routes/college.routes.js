const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getApplications, getApplicationDetail } = require('../controllers/college.controller');

const router = express.Router();

router.use(protect, authorize('college'));

router.get('/dashboard', getDashboard);
router.get('/applications', getApplications);
router.get('/applications/:id', getApplicationDetail);

module.exports = router;
