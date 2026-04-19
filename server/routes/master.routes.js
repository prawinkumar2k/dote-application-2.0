const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');

router.get('/', masterController.getMasterData);

module.exports = router;
