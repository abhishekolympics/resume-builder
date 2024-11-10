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


const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function scrapeJobs(searchTerm) {
  console.log('Starting Puppeteer scraping for search term:', searchTerm);

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
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

    // Navigate to Indeed with the job term
    console.log('Navigating to Indeed...');
    await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
      waitUntil: 'domcontentloaded',
    });
    console.log(`Navigation to https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)} completed.`);

    // Confirm page load by printing title and a known element's content
    const pageTitle = await page.title();
    console.log(`Page title loaded: ${pageTitle}`);

    const logoText = await page.evaluate(() => {
      const logoElement = document.querySelector('div.icl-WhatWhere-logo');
      return logoElement ? logoElement.innerText : 'Logo text not found';
    });
    console.log(`Indeed logo text found: ${logoText}`);

    // Wait for job elements to load
    console.log('Waiting for job title selector...');
    try {
      await page.waitForSelector('h2.jobTitle a', { timeout: 60000 });
      console.log('Job title selector found.');
    } catch (error) {
      console.error('Job title selector not found:', error);
      return [];
    }

    // Scrape job post titles and URLs
    console.log('Scraping job titles and URLs...');
    const jobData = await page.evaluate(() => {
      const jobs = [];
      const jobElements = document.querySelectorAll('h2.jobTitle a');

      if (jobElements.length === 0) {
        console.log('No job elements found.');
      }

      jobElements.forEach((element) => {
        const relativeUrl = element.getAttribute('href'); // Get the relative URL
        const absoluteUrl = `https://in.indeed.com${relativeUrl}`; // Construct the absolute URL
        const jobTitle = element.innerText.trim(); // Get the job title

        jobs.push({ title: jobTitle, link: absoluteUrl });
      });

      console.log(`Scraped ${jobs.length} job listings.`);
      return jobs.slice(0, 3); // Return the first three job listings with title and link
    });

    console.log('Job scraping completed.');

    await browser.close();
    console.log('Browser closed.');

    return jobData;
  } catch (error) {
    console.error('Error during job scraping process:', error);
    if (browser) {
      await browser.close();
    }
    return [];
  }
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
