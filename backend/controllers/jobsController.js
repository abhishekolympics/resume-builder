const jobService = require('../services/jobService');

async function getJobs(req, res) {
  const userId = req.query.id || null; // Assuming you have user information in the request
  const searchTerm = req.query.searchTerm || ''; // If a search term is passed

  try {
    // Try fetching the jobs from the database
    let jobs = await jobService.getJobs(userId);

    // If jobs are not found, scrape and save them
    if (!jobs) {
      jobs = await jobService.scrapeAndSaveJobs(userId, searchTerm);
    }

    return res.status(200).json({ jobs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getJobs
};
