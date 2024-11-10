const puppeteer = require('puppeteer');

// Rotate between different user agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

// Helper function for delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function scrapeJobs(searchTerm) {
  console.log('Starting Puppeteer scraping for search term:', searchTerm);

  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-notifications',
        '--disable-extensions'
      ]
    });

    console.log('Browser launched successfully.');
    const page = await browser.newPage();
    
    // Set a realistic viewport
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    // Set up browser environment to appear more human-like
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    });

    // Set a random user agent
    const userAgent = await getRandomUserAgent();
    await page.setUserAgent(userAgent);

    console.log('Navigating to Indeed...');
    
    // First visit Indeed homepage
    await page.goto('https://in.indeed.com', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for a bit
    await delay(2000);

    // Now navigate to the search page
    const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}&l=`;
    const response = await page.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()}`);
    }

    // Wait for job cards to load using a more reliable approach
    const jobSelectors = [
      '.job_seen_beacon',
      '.resultContent',
      '[data-testid="jobCard"]',
      '.jobsearch-ResultsList > div'
    ];

    let foundSelector = null;
    for (const selector of jobSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          foundSelector = selector;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!foundSelector) {
      throw new Error('No job elements found on the page');
    }

    // Extract job data
    const jobData = await page.evaluate((selector) => {
      const jobs = [];
      const jobCards = document.querySelectorAll(selector);
      
      jobCards.forEach(card => {
        try {
          const titleElement = card.querySelector('h2.jobTitle a, [data-testid="jobTitle"], .jcs-JobTitle');
          const title = titleElement ? titleElement.innerText.trim() : null;
          const link = titleElement ? titleElement.href : null;
          
          if (title && link) {
            jobs.push({
              title,
              link: link.startsWith('http') ? link : `https://in.indeed.com${link}`
            });
          }
        } catch (e) {
          console.log('Error parsing job card:', e);
        }
      });
      
      return jobs.slice(0, 3);
    }, foundSelector);

    await browser.close();
    console.log('Successfully scraped jobs:', jobData.length);
    
    return jobData;

  } catch (error) {
    console.error('Error during job scraping process:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

async function getJobs(req, res) {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const jobs = await scrapeJobs(searchTerm);
    if (!jobs.length) {
      return res.status(404).json({ 
        error: 'No jobs found',
        message: 'The search returned no results or the page could not be accessed.'
      });
    }
    res.json(jobs);
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ 
      error: 'Failed to scrape jobs', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { getJobs };