// const puppeteer = require('puppeteer');

// // Function to scrape job listings from Indeed
// async function scrapeJobs(searchTerm) {
//   const browser = await puppeteer.launch({
//     headless: true,  // Keep it headless
//     args: ['--no-sandbox', '--disable-setuid-sandbox'], // To avoid sandbox issues
//   });
//   const page = await browser.newPage();

//   // Set a realistic viewport size
//   await page.setViewport({ width: 1280, height: 800 });

//   // Set a user-agent to avoid detection
//   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

//   // Navigate to Indeed with the job term
//   await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
//     waitUntil: 'networkidle2', // Wait for network to be idle
//   });

//   // Wait for job elements to load
//   try {
//     await page.waitForSelector('h2.jobTitle a', { timeout: 60000 }); // Increased timeout if necessary
//   } catch (error) {
//     console.error('Job title selector not found:', error);
//   }

//   // Scrape job post URLs
//   const jobLinks = await page.evaluate(async () => {
//     const links = [];
//     const jobElements = document.querySelectorAll('h2.jobTitle a');

//     jobElements.forEach((element) => {
//       const relativeUrl = element.getAttribute('href');
//       const absoluteUrl = `https://in.indeed.com${relativeUrl}`;
//       links.push(absoluteUrl);
//     });
//     return links.slice(0, 3); // Return the first three job links
//   });

//   await browser.close();
//   return jobLinks;
// }

// // Controller function for handling the API endpoint
// async function getJobs(req, res) {
//   const { searchTerm } = req.query; // Expecting search term as a query parameter
//   if (!searchTerm) {
//     return res.status(400).json({ error: 'Search term is required' });
//   }

//   try {
//     const jobs = await scrapeJobs(searchTerm);
//     res.json(jobs);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
//   }
// }

// module.exports = { getJobs };

const puppeteer = require('puppeteer');

// Function to scrape job listings from Indeed
async function scrapeJobs(searchTerm) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // To avoid sandbox issues
  });
  const page = await browser.newPage();

  // Set a realistic viewport size and user agent
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  // Navigate to Indeed with the job term
  await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
    waitUntil: 'networkidle2',
  });

  // Wait for job elements to load
  try {
    await page.waitForSelector('h2.jobTitle a', { timeout: 60000 });
  } catch (error) {
    console.error('Job title selector not found:', error);
  }

  // Scrape job post titles and URLs
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('h2.jobTitle a');
    
    jobElements.forEach((element) => {
      const relativeUrl = element.getAttribute('href'); // Get the relative URL
      const absoluteUrl = `https://in.indeed.com${relativeUrl}`; // Construct the absolute URL
      const jobTitle = element.innerText.trim(); // Get the job title

      jobs.push({ title: jobTitle, link: absoluteUrl });
    });
    
    return jobs.slice(0, 3); // Return the first three job listings with title and link
  });

  await browser.close();
  return jobData;
}

// Controller function for handling the API endpoint
async function getJobs(req, res) {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const jobs = await scrapeJobs(searchTerm);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
  }
}

module.exports = { getJobs };
