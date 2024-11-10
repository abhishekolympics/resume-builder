const puppeteer = require('puppeteer');

async function scrapeJobs(searchTerm) {
  console.log('Starting Puppeteer scraping for search term:', searchTerm);

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Switch to headful mode to avoid potential issues in cloud environments
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--remote-debugging-port=9222',
        '--single-process',
        '--disable-gpu',
        '--disable-software-rasterizer', // Ensure it works without GPU
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

    // Navigate to Indeed with the job term
    console.log('Navigating to Indeed...');
    const response = await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000, // Increase the timeout to 60 seconds
    });
    console.log(`Navigation to https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)} completed with status: ${response.status()}`);

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

module.exports = { scrapeJobs };
