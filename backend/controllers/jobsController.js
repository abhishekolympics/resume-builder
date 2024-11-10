const puppeteer = require('puppeteer');

// Function to scrape job listings from Indeed
async function scrapeJobs(searchTerm) {
  const browser = await puppeteer.launch({
    headless: false, // Set to false to run in non-headless mode for debugging
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
    waitUntil: 'domcontentloaded', // Change to 'domcontentloaded' for more reliable content loading
  });

  // Debugging: Log the page content to inspect HTML structure
  const pageContent = await page.content();
  console.log(pageContent);  // Log the HTML for inspection

  // Wait for job elements to load, with retries
  let retryAttempts = 3;
  while (retryAttempts > 0) {
    try {
      await page.waitForSelector('h2.jobTitle a', { timeout: 60000 });
      break; // Exit loop if successful
    } catch (error) {
      retryAttempts--;
      console.log(`Retrying... (${3 - retryAttempts} attempt(s) left)`);
      if (retryAttempts === 0) {
        console.error('Job title selector not found after retries');
        await browser.close();
        throw error; // Throw error if retries are exhausted
      }
    }
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
    console.error('Error scraping jobs:', error.message);
    res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
  }
}

module.exports = { getJobs };
