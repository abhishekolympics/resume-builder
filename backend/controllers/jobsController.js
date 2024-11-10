// const puppeteer = require('puppeteer');

// async function scrapeJobs(searchTerm) {
//   console.log('Starting Puppeteer scraping for search term:', searchTerm);

//   let browser;
//   try {
//     console.log('Launching browser...');
//     browser = await puppeteer.launch({
//       headless: true, // Keep it headless
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--remote-debugging-port=9222',
//         '--single-process',
//         '--disable-gpu',
//         '--disable-software-rasterizer', // Ensure it works without GPU
//       ],
//     });
//     console.log('Browser launched successfully.');

//     const page = await browser.newPage();
//     console.log('New page created.');

//     // Set a realistic viewport size and user agent
//     await page.setViewport({ width: 1280, height: 800 });
//     console.log('Viewport set to 1280x800.');

//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
//     );
//     console.log('User agent set.');

//     // Navigate to Indeed with the job term
//     console.log('Navigating to Indeed...');
//     await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
//       waitUntil: 'domcontentloaded',
//     });
//     console.log(`Navigation to https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)} completed.`);

//     // Confirm page load by printing title and a known element's content
//     const pageTitle = await page.title();
//     console.log(`Page title loaded: ${pageTitle}`);

//     const logoText = await page.evaluate(() => {
//       const logoElement = document.querySelector('div.icl-WhatWhere-logo');
//       return logoElement ? logoElement.innerText : 'Logo text not found';
//     });
//     console.log(`Indeed logo text found: ${logoText}`);

//     // Wait for job elements to load
//     console.log('Waiting for job title selector...');
//     try {
//       await page.waitForSelector('h2.jobTitle a', { timeout: 60000 });
//       console.log('Job title selector found.');
//     } catch (error) {
//       console.error('Job title selector not found:', error);
//       return [];
//     }

//     // Scrape job post titles and URLs
//     console.log('Scraping job titles and URLs...');
//     const jobData = await page.evaluate(() => {
//       const jobs = [];
//       const jobElements = document.querySelectorAll('h2.jobTitle a');

//       if (jobElements.length === 0) {
//         console.log('No job elements found.');
//       }

//       jobElements.forEach((element) => {
//         const relativeUrl = element.getAttribute('href'); // Get the relative URL
//         const absoluteUrl = `https://in.indeed.com${relativeUrl}`; // Construct the absolute URL
//         const jobTitle = element.innerText.trim(); // Get the job title

//         jobs.push({ title: jobTitle, link: absoluteUrl });
//       });

//       console.log(`Scraped ${jobs.length} job listings.`);
//       return jobs.slice(0, 3); // Return the first three job listings with title and link
//     });

//     console.log('Job scraping completed.');

//     await browser.close();
//     console.log('Browser closed.');

//     return jobData;
//   } catch (error) {
//     console.error('Error during job scraping process:', error);
//     if (browser) {
//       await browser.close();
//     }
//     return [];
//   }
// }

// // Controller function for handling the API endpoint
// async function getJobs(req, res) {
//   const { searchTerm } = req.query;
//   if (!searchTerm) {
//     return res.status(400).json({ error: 'Search term is required' });
//   }

//   try {
//     const jobs = await scrapeJobs(searchTerm);
//     res.json(jobs);
//   } catch (error) {
//     console.error('Error scraping jobs:', error.message);
//     res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
//   }
// }

// module.exports = { getJobs };

const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use stealth plugin for sites with strict bot detection (like LinkedIn)
puppeteerExtra.use(StealthPlugin());

async function scrapeJobs(searchTerm) {
  console.log('Starting Puppeteer scraping for search term:', searchTerm);

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteerExtra.launch({
      headless: true, // Keep it headless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222',
        '--single-process',
        '--disable-gpu',
        '--disable-software-rasterizer',
      ],
    });
    console.log('Browser launched successfully.');

    const page = await browser.newPage();
    console.log('New page created.');

    // Set a realistic viewport size and user agent
    await page.setViewport({ width: 1280, height: 800 });
    console.log('Viewport set to 1280x800.');

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );
    console.log('User agent set.');

    // Scrape jobs from all the portals
    const jobData = await Promise.all([
      // scrapeIndeed(page, searchTerm),
      scrapeGlassdoor(page, searchTerm),
      scrapeMonster(page, searchTerm),
      scrapeAdzuna(page, searchTerm),
      scrapeZipRecruiter(page, searchTerm),
    ]);

    console.log('Job scraping completed.');
    await browser.close();
    console.log('Browser closed.');

    return jobData.flat(); // Flatten the array and return all the jobs

  } catch (error) {
    console.error('Error during job scraping process:', error);
    if (browser) {
      await browser.close();
    }
    return [];
  }
}

// Scrape jobs from Indeed
async function scrapeIndeed(page, searchTerm) {
  console.log('Scraping jobs from Indeed...');
  await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, { waitUntil: 'domcontentloaded' });
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('h2.jobTitle a');
    jobElements.forEach((element) => {
      const relativeUrl = element.getAttribute('href');
      const absoluteUrl = `https://in.indeed.com${relativeUrl}`;
      const jobTitle = element.innerText.trim();
      jobs.push({ title: jobTitle, link: absoluteUrl });
    });
    return jobs.slice(0, 3);
  });
  return jobData;
}

// Scrape jobs from Glassdoor
async function scrapeGlassdoor(page, searchTerm) {
  console.log('Scraping jobs from Glassdoor...');
  await page.goto(`https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(searchTerm)}`, { waitUntil: 'domcontentloaded' });
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('.heading_Heading__BqX5J.heading_Level1__soLZs');
    jobElements.forEach((element) => {
      const jobTitle = element.innerText.trim();
      const jobUrl = element.closest('a') ? element.closest('a').href : ''; // Get link if exists
      jobs.push({ title: jobTitle, link: jobUrl });
    });
    return jobs.slice(0, 3);
  });
  return jobData;
}

// Scrape jobs from Monster
async function scrapeMonster(page, searchTerm) {
  console.log('Scraping jobs from Monster...');
  await page.goto(`https://www.monster.com/jobs/search?q=${encodeURIComponent(searchTerm)}`, { waitUntil: 'domcontentloaded' });
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('a[data-testid="jobTitle"]');
    jobElements.forEach((element) => {
      const jobTitle = element.innerText.trim();
      const jobUrl = `https://www.monster.com${element.getAttribute('href')}`;
      jobs.push({ title: jobTitle, link: jobUrl });
    });
    return jobs.slice(0, 3);
  });
  return jobData;
}

// Scrape jobs from Adzuna
async function scrapeAdzuna(page, searchTerm) {
  console.log('Scraping jobs from Adzuna...');
  await page.goto(`https://www.adzuna.com/jobs?q=${encodeURIComponent(searchTerm)}`, { waitUntil: 'domcontentloaded' });
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('.jobList-title');
    jobElements.forEach((element) => {
      const jobTitle = element.innerText.trim();
      const jobUrl = element.href;
      jobs.push({ title: jobTitle, link: jobUrl });
    });
    return jobs.slice(0, 3);
  });
  return jobData;
}

// Scrape jobs from ZipRecruiter
async function scrapeZipRecruiter(page, searchTerm) {
  console.log('Scraping jobs from ZipRecruiter...');
  await page.goto(`https://www.ziprecruiter.com/candidate/search?search=${encodeURIComponent(searchTerm)}`, { waitUntil: 'domcontentloaded' });
  const jobData = await page.evaluate(() => {
    const jobs = [];
    const jobElements = document.querySelectorAll('.job_link');
    jobElements.forEach((element) => {
      const jobTitle = element.querySelector('.job_title').innerText.trim();
      const jobUrl = element.href;
      jobs.push({ title: jobTitle, link: jobUrl });
    });
    return jobs.slice(0, 3);
  });
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
    console.error('Error scraping jobs:', error.message);
    res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
  }
}

module.exports = { getJobs };
