const express = require('express');
const { saveResume } = require('../controllers/resumeController');

const router = express.Router();

router.post('/save-resume', saveResume);

module.exports = router;
