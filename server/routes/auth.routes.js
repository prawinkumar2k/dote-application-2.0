const express = require('express');
const { login, logout, addCollege, getDashboardStats, getColleges } = require('../controllers/auth.controller');
const router = express.Router();

router.post('/login', login);
router.get('/logout', logout);
router.post('/add-college', addCollege);
router.get('/dashboard-stats', getDashboardStats);
router.get('/colleges', getColleges);

module.exports = router;
