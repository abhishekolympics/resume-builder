// // Function to scrape job listings from Indeed
// async function scrapeJobs(searchTerm) {
//     const browser = await puppeteer.launch({ headless: false }); // Change to false for debugging
//     const page = await browser.newPage();
  
//     // Navigate to Indeed with the job term
//     await page.goto(
//       `https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`,
//       {
//         waitUntil: "domcontentloaded", // Wait for DOM to be fully loaded
//       }
//     );
  
//     // Wait for job elements to load
//     try {
//       await page.waitForSelector("h2.jobTitle a", { timeout: 15000 }); // Wait for the job titles to load
//     } catch (error) {
//       console.error("Job title selector not found:", error);
//     }
  
//     // Scrape job post URLs
//     const jobLinks = await page.evaluate(() => {
//       const links = [];
//       const jobElements = document.querySelectorAll("h2.jobTitle a"); // Adjusted selector
//       jobElements.forEach((element) => {
//         const relativeUrl = element.getAttribute("href"); // Get the relative URL
//         const absoluteUrl = `https://in.indeed.com${relativeUrl}`; // Construct the absolute URL
//         links.push(absoluteUrl);
//       });
//       return links.slice(0, 3); // Return the first three job links
//     });
  
//     await browser.close();
//     return jobLinks;
//   }
  
//   // API Endpoint to get jobs
//   app.get("/api/jobs", async (req, res) => {
//     const { searchTerm } = req.query; // Expecting search term as a query parameter
//     if (!searchTerm) {
//       return res.status(400).json({ error: "Search term is required" });
//     }
  
//     try {
//       const jobs = await scrapeJobs(searchTerm);
//       res.json(jobs);
//     } catch (error) {
//       res
//         .status(500)
//         .json({ error: "Failed to scrape jobs", details: error.message });
//     }
//   });

const express = require('express');
const { getJobs } = require('../controllers/jobsController'); // Import the controller

const router = express.Router();

// Define route for scraping jobs
router.get('/jobs', getJobs);

module.exports = router;
