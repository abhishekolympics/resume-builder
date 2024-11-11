// const puppeteer = require("puppeteer");

// async function scrapeJobs(searchTerm) {
//   console.log("Starting Puppeteer scraping for search term:", searchTerm);

//   let browser;
//   try {
//     console.log("Launching browser...");
//     browser = await puppeteer.launch({
//       headless: true, // Keep it headless
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--remote-debugging-port=9222",
//         "--single-process",
//         "--disable-gpu",
//         "--disable-software-rasterizer", // Ensure it works without GPU
//       ],
//     });
//     console.log("Browser launched successfully.");

//     const page = await browser.newPage();
//     console.log("New page created.");

//     // Set a realistic viewport size and user agent
//     await page.setViewport({ width: 1280, height: 800 });
//     console.log("Viewport set to 1280x800.");

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
//     );
//     console.log("User agent set.");

//     async function scrapeGlassdoor(page, searchTerm) {
//       console.log("Scraping jobs from Glassdoor...");

//       await page.goto(
//         `https://www.glassdoor.co.in/Job/united-states-${encodeURIComponent(
//           searchTerm
//         )}-jobs-SRCH_IL.0,13_KO14,27.htm`,
//         { waitUntil: "domcontentloaded" }
//       );

//       // Check if the page is loaded by printing the page title
//       const pageTitle = await page.title();
//       console.log("Page Title:", pageTitle); // This will confirm if the page has loaded

//       // You can also log the content of an element to ensure it has loaded
//       const pageContent = await page.content();
//       console.log("Page Content Snippet:", pageContent.slice(0, 200)); // Print a small snippet of the page content to confirm

//       const jobData = await page.evaluate(() => {
//         const jobs = [];
//         const jobElements = document.querySelectorAll(
//           ".heading_Heading__BqX5J.heading_Level1__soLZs"
//         );
//         jobElements.forEach((element) => {
//           const jobTitle = element.innerText.trim();
//           const jobUrl = element.closest("a") ? element.closest("a").href : ""; // Get link if exists
//           jobs.push({ title: jobTitle, link: jobUrl });
//         });
//         return jobs.slice(0, 3);
//       });
//       console.log("jobdata inside glassdoor=", jobData);
//       return jobData;
//     }

//     const newJobData = await scrapeGlassdoor(page, searchTerm);
//     console.log("glassdoor function returned this=", newJobData);

//     await browser.close();
//     console.log("Browser closed.");

//     return newJobData;
//   } catch (error) {
//     console.error("Error during job scraping process:", error);
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
//     return res.status(400).json({ error: "Search term is required" });
//   }

//   try {
//     const jobs = await scrapeJobs(searchTerm);
//     res.json(jobs);
//   } catch (error) {
//     console.error("Error scraping jobs:", error.message);
//     res
//       .status(500)
//       .json({ error: "Failed to scrape jobs", details: error.message });
//   }
// }

// module.exports = { getJobs };

//above functionality is working, but it is getting redirected to security page.

const puppeteer = require("puppeteer");
const axios = require("axios");

async function solveCaptcha(page, siteUrl, siteKey, apiKey) {
  console.log("Attempting to solve captcha...");

  // Step 1: Request captcha solving
  const captchaIdResponse = await axios.get(
    `http://2captcha.com/in.php?key=${process.response.CAPTCHA_API_KEY}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${siteUrl}&json=1`
  );
  const captchaId = captchaIdResponse.data.request;

  if (!captchaId) {
    throw new Error("Failed to get captcha ID from 2Captcha.");
  }

  console.log("Captcha ID received from 2Captcha:", captchaId);

  // Step 2: Poll for captcha solution
  let captchaSolution;
  for (let i = 0; i < 20; i++) {
    console.log("Checking for captcha solution...");
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before each check

    const resultResponse = await axios.get(
      `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`
    );
    if (resultResponse.data.status === 1) {
      captchaSolution = resultResponse.data.request;
      console.log("Captcha solved:", captchaSolution);
      break;
    } else {
      console.log("Captcha not solved yet, retrying...");
    }
  }

  if (!captchaSolution) {
    throw new Error("Captcha solution not received in time.");
  }

  // Step 3: Use the captcha solution in the form
  await page.evaluate(
    `document.getElementById("g-recaptcha-response").innerHTML="${captchaSolution}";`
  );
  await page.click("#submit-button"); // Adjust this to the correct selector for submitting the captcha if necessary
  console.log("Captcha solution submitted.");

  // Wait for navigation after captcha
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
}

async function scrapeJobs(searchTerm) {
  console.log("Starting Puppeteer scraping for search term:", searchTerm);

  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      headless: false, // Switch to headful mode for realistic user session
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        "--single-process",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });
    console.log("Browser launched successfully.");

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Attempt to scrape using realistic user session first
    const jobData = await scrapeWithRealisticSession(page, searchTerm);

    if (jobData.length === 0) {
      console.log(
        "Realistic session failed; attempting captcha-solving approach."
      );
      const jobDataCaptcha = await scrapeWithCaptchaSolving(page, searchTerm);
      await browser.close();
      return jobDataCaptcha;
    }

    await browser.close();
    return jobData;
  } catch (error) {
    console.error("Error during job scraping process:", error);
    if (browser) {
      await browser.close();
    }
    return [];
  }
}

// Function for scraping with a realistic user session
async function scrapeWithRealisticSession(page, searchTerm) {
  console.log("Scraping with realistic user session...");

  try {
    // Set cookies if available or simulate a realistic browsing pattern
    await page.goto(
      `https://www.glassdoor.co.in/Job/united-states-${encodeURIComponent(
        searchTerm
      )}-jobs-SRCH_IL.0,13_KO14,27.htm`,
      { waitUntil: "domcontentloaded" }
    );

    const pageTitle = await page.title();
    console.log("Page Title:", pageTitle);

    if (pageTitle.includes("Security")) {
      console.log("Blocked by security page in realistic session.");
      return [];
    }

    const jobData = await page.evaluate(() => {
      const jobs = [];
      const jobElements = document.querySelectorAll(
        ".heading_Heading__BqX5J.heading_Level1__soLZs"
      );
      jobElements.forEach((element) => {
        const jobTitle = element.innerText.trim();
        const jobUrl = element.closest("a") ? element.closest("a").href : "";
        jobs.push({ title: jobTitle, link: jobUrl });
      });
      return jobs.slice(0, 3);
    });

    console.log("jobdata in realistic session:", jobData);
    return jobData;
  } catch (error) {
    console.error("Error in realistic session:", error);
    return [];
  }
}

// Function for scraping with an automatic captcha-solving approach
async function scrapeWithCaptchaSolving(page, searchTerm) {
  console.log("Scraping with automatic captcha solving...");

  try {
    const siteUrl = `https://www.glassdoor.co.in/Job/united-states-${encodeURIComponent(
      searchTerm
    )}-jobs-SRCH_IL.0,13_KO14,27.htm`;
    await page.goto(siteUrl, { waitUntil: "domcontentloaded" });

    const pageTitle = await page.title();
    if (pageTitle.includes("Security")) {
      console.log(
        "Captcha detected. Implement a third-party captcha-solving service here."
      );
      const siteKey = "6Lej8UwUAAAAANV3V5Ow5gJo2-pHj9p5ko8igIe-"; // Replace with the actual reCAPTCHA site key found in the page source
      const apiKey = process.env.CAPTCHA_API_KEY;
      // Placeholder for captcha-solving integration code
      // Example: Use services like 2Captcha, AntiCaptcha, or manually solve the captcha

      // Retry fetching job data after solving captcha
      await solveCaptcha(page, siteUrl, siteKey, apiKey);
    }

    const jobData = await page.evaluate(() => {
      const jobs = [];
      const jobElements = document.querySelectorAll(
        ".heading_Heading__BqX5J.heading_Level1__soLZs"
      );
      jobElements.forEach((element) => {
        const jobTitle = element.innerText.trim();
        const jobUrl = element.closest("a") ? element.closest("a").href : "";
        jobs.push({ title: jobTitle, link: jobUrl });
      });
      return jobs.slice(0, 3);
    });

    console.log("jobdata in captcha-solving session:", jobData);
    return jobData;
  } catch (error) {
    console.error("Error in captcha-solving session:", error);
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
