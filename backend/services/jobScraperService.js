const puppeteer = require("puppeteer");
const axios = require("axios");

async function solveCaptcha(page, siteUrl, siteKey, apiKey) {
  console.log("Attempting to solve captcha...");

  // Step 1: Request captcha solving
  const captchaIdResponse = await axios.get(
    `http://2captcha.com/in.php?key=${apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${siteUrl}&json=1`
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
      headless: true, // Switch to headful mode for realistic user session
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        // "--disable-dev-shm-usage",
        "--remote-debugging-port=9222",
        // "--single-process",
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

    await page.waitForSelector("a.JobCard_jobTitle___7I6y", { timeout: 5000 });

    const jobData = await page.evaluate(() => {
      // Get all job titles and their respective links using the class and href
      const jobElements = Array.from(
        document.querySelectorAll("a.JobCard_jobTitle___7I6y")
      );

      return jobElements.map((job) => ({
        title: job.innerText, // Job title
        link: job.href, // Job link
      }));
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
      
      await solveCaptcha(page, siteUrl, siteKey, apiKey);
    }

    await page.waitForSelector("a.JobCard_jobTitle___7I6y", { timeout: 5000 });

    const jobData = await page.evaluate(() => {
      // Get all job titles and their respective links using the class and href
      const jobElements = Array.from(
        document.querySelectorAll("a.JobCard_jobTitle___7I6y")
      );

      return jobElements.map((job) => ({
        title: job.innerText, // Job title
        link: job.href, // Job link
      }));
    });

    console.log("jobdata in captcha-solving session:", jobData);
    return jobData;
  } catch (error) {
    console.error("Error in captcha-solving session:", error);
    return [];
  }
}

module.exports = scrapeJobs;