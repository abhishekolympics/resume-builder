const express = require('express');
const { getJobs } = require('../controllers/jobsController'); // Import the controller

const router = express.Router();

// Define route for scraping jobs
router.get('/jobs', getJobs);

module.exports = router;
