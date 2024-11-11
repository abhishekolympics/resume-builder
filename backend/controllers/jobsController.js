const puppeteer = require("puppeteer");

async function scrapeJobs(searchTerm) {
  console.log("Starting Puppeteer scraping for search term:", searchTerm);

  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: true, // Keep it headless
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        "--single-process",
        "--disable-gpu",
        "--disable-software-rasterizer", // Ensure it works without GPU
      ],
    });
    console.log("Browser launched successfully.");

    const page = await browser.newPage();
    console.log("New page created.");

    // Set a realistic viewport size and user agent
    await page.setViewport({ width: 1280, height: 800 });
    console.log("Viewport set to 1280x800.");

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    console.log("User agent set.");

    async function scrapeGlassdoor(page, searchTerm) {
      console.log("Scraping jobs from Glassdoor...");

      await page.goto(
        `https://www.glassdoor.co.in/Job/united-states-${encodeURIComponent(
          searchTerm
        )}-jobs-SRCH_IL.0,13_KO14,27.htm`,
        { waitUntil: "domcontentloaded" }
      );

      // Check if the page is loaded by printing the page title
      const pageTitle = await page.title();
      console.log("Page Title:", pageTitle); // This will confirm if the page has loaded

      // You can also log the content of an element to ensure it has loaded
      const pageContent = await page.content();
      console.log("Page Content Snippet:", pageContent.slice(0, 200)); // Print a small snippet of the page content to confirm

      const jobData = await page.evaluate(() => {
        const jobs = [];
        const jobElements = document.querySelectorAll(
          ".heading_Heading__BqX5J.heading_Level1__soLZs"
        );
        jobElements.forEach((element) => {
          const jobTitle = element.innerText.trim();
          const jobUrl = element.closest("a") ? element.closest("a").href : ""; // Get link if exists
          jobs.push({ title: jobTitle, link: jobUrl });
        });
        return jobs.slice(0, 3);
      });
      console.log("jobdata inside glassdoor=", jobData);
      return jobData;
    }

    const newJobData = await scrapeGlassdoor(page, searchTerm);
    console.log("glassdoor function returned this=", newJobData);

    await browser.close();
    console.log("Browser closed.");

    return newJobData;
  } catch (error) {
    console.error("Error during job scraping process:", error);
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
    return res.status(400).json({ error: "Search term is required" });
  }

  try {
    const jobs = await scrapeJobs(searchTerm);
    res.json(jobs);
  } catch (error) {
    console.error("Error scraping jobs:", error.message);
    res
      .status(500)
      .json({ error: "Failed to scrape jobs", details: error.message });
  }
}

module.exports = { getJobs };
