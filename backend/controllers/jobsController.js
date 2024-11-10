const axios = require('axios');
const cheerio = require('cheerio');

// Rotate between different user agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function scrapeJobs(searchTerm) {
  console.log('Starting job search for:', searchTerm);

  try {
    // Configure axios
    const config = {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Pragma': 'no-cache',
        'DNT': '1',
        'Referer': 'https://in.indeed.com/',
        'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      }
    };

    // First get cookies from homepage
    console.log('Fetching Indeed homepage...');
    const homepageResponse = await axios.get('https://in.indeed.com', config);
    
    if (homepageResponse.headers['set-cookie']) {
      config.headers.Cookie = homepageResponse.headers['set-cookie'].join('; ');
    }

    // Short delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now fetch the search results
    console.log('Fetching search results...');
    const searchUrl = `https://in.indeed.com/jobs?q=${encodeURIComponent(searchTerm)}&l=`;
    const response = await axios.get(searchUrl, config);

    if (response.status === 403) {
      throw new Error('Access denied by Indeed. Try again later.');
    }

    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const $ = cheerio.load(response.data);
    const jobs = [];

    // Try different selectors that Indeed might use
    const selectors = [
      '.job_seen_beacon',
      '.resultContent',
      '[data-testid="jobCard"]',
      '.jobsearch-ResultsList > div'
    ];

    for (const selector of selectors) {
      $(selector).each((index, element) => {
        try {
          const titleElement = $(element).find('h2.jobTitle a, [data-testid="jobTitle"], .jcs-JobTitle').first();
          const title = titleElement.text().trim();
          const relativeUrl = titleElement.attr('href');
          
          if (title && relativeUrl) {
            const link = relativeUrl.startsWith('http') 
              ? relativeUrl 
              : `https://in.indeed.com${relativeUrl}`;
            
            jobs.push({ title, link });
          }
        } catch (e) {
          console.log('Error parsing job element:', e);
        }
      });

      if (jobs.length > 0) break;
    }

    console.log(`Found ${jobs.length} jobs`);
    return jobs.slice(0, 3);

  } catch (error) {
    console.error('Error during job scraping:', error.message);
    throw new Error(error.message || 'Failed to scrape jobs');
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
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch jobs', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { getJobs };