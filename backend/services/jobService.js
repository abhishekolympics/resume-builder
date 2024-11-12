// src/services/jobService.js
const Job = require("../models/Job");
const scrapeJobs = require("./jobScraperService"); // if you have a separate scraping service

// Fetch jobs from the database
async function getJobs(userId) {
  try {
    const existingJobs = await Job.findOne({ userid: userId });

    if (existingJobs) {
      return existingJobs.jobs;
    } else {
      return null;
    }
  } catch (error) {
    throw new Error("Error fetching jobs from database: " + error.message);
  }
}

// Scrape and save jobs if not found
async function scrapeAndSaveJobs(userId, searchTerm) {
  try {
    const scrapedJobs = await scrapeJobs(searchTerm); // scrape jobs if not found in DB

    const formattedJobs = scrapedJobs.map((job) => ({
      jobName: job.title,
      jobLink: job.link,
    }));

    if (scrapedJobs.length > 0) {
      if (userId !== null) {
        const newJob = new Job({
          userid: userId,
          jobs: formattedJobs,
        });
        await newJob.save();
      }
      return scrapedJobs;
    } else {
      throw new Error("No jobs found during scraping.");
    }
  } catch (error) {
    throw new Error("Error scraping and saving jobs: " + error.message);
  }
}

module.exports = {
  getJobs,
  scrapeAndSaveJobs,
};
