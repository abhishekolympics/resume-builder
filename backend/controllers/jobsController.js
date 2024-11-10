const puppeteer = require('puppeteer');

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
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--no-zygote', // Prevent subprocess creation
        '--single-process', // Run in single process mode
        '--disable-extensions', // Disable extensions
        '--disable-background-networking', // Reduce network activity
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--mute-audio',
      ],
      ignoreHTTPSErrors: true,
      timeout: 30000, // Browser launch timeout
    });
    console.log('Browser launched successfully.');

    const page = await browser.newPage();
    console.log('New page created.');

    // Set a smaller viewport to reduce memory usage
    await page.setViewport({ width: 1024, height: 768 });
    console.log('Viewport set.');
    
    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Set reasonable timeout for navigation
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);

    // Enable request interception to block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font') {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log('Navigating to Indeed...');
    const response = await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    if (!response.ok()) {
      throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
    }

    console.log('Waiting for job title selector...');
    
    // First check if the element exists to avoid long timeout
    const hasJobTitles = await page.evaluate(() => {
      return !!document.querySelector('h2.jobTitle a');
    });

    if (!hasJobTitles) {
      console.log('No job titles found immediately, checking alternative selectors...');
      // Try alternative selectors that Indeed might be using
      const selectors = [
        'h2.jobTitle a',
        '.job_seen_beacon h2 a',
        '[data-testid="jobTitle"]',
        '.resultContent h2 a'
      ];

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          console.log(`Found jobs using selector: ${selector}`);
          
          const jobData = await page.evaluate((sel) => {
            const jobs = [];
            const jobElements = document.querySelectorAll(sel);
            
            jobElements.forEach((element) => {
              const relativeUrl = element.getAttribute('href');
              const absoluteUrl = relativeUrl.startsWith('http') 
                ? relativeUrl 
                : `https://in.indeed.com${relativeUrl}`;
              const jobTitle = element.innerText.trim();
              
              if (jobTitle && absoluteUrl) {
                jobs.push({ title: jobTitle, link: absoluteUrl });
              }
            });
            
            return jobs.slice(0, 3);
          }, selector);

          if (jobData.length > 0) {
            await browser.close();
            return jobData;
          }
        } catch (err) {
          console.log(`Selector ${selector} not found, trying next...`);
          continue;
        }
      }
      
      throw new Error('No job listings found with any known selector');
    }

    // If we found the original selector, use it
    const jobData = await page.evaluate(() => {
      const jobs = [];
      const jobElements = document.querySelectorAll('h2.jobTitle a');
      
      jobElements.forEach((element) => {
        const relativeUrl = element.getAttribute('href');
        const absoluteUrl = relativeUrl.startsWith('http') 
          ? relativeUrl 
          : `https://in.indeed.com${relativeUrl}`;
        const jobTitle = element.innerText.trim();
        
        if (jobTitle && absoluteUrl) {
          jobs.push({ title: jobTitle, link: absoluteUrl });
        }
      });
      
      return jobs.slice(0, 3);
    });

    await browser.close();
    console.log('Browser closed successfully.');

    return jobData;

  } catch (error) {
    console.error('Error during job scraping process:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error while closing browser:', closeError);
      }
    }
    throw error; // Re-throw the error to be handled by the controller
  }
}

async function getJobs(req, res) {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).json({ error: 'Search term is required' });
  }

  try {
    const jobs = await scrapeJobs(searchTerm);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }
    res.json(jobs);
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ 
      error: 'Failed to scrape jobs', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { getJobs };