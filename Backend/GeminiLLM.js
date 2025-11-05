import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDwNiN2j8WY2XDKS3Zlp-Y9LcwRHJSYfrQ');
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash-latest' });

const baseUrl = 'https://jobs.bdjobs.com/jobsearch.asp?fcatId=1&icatId=';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job_scraper'
});

const safe = (val) => {
  if (Array.isArray(val)) return val.length > 0 ? JSON.stringify(val) : 'N/A';
  if (val === undefined || val === null) return 'N/A';
  if (typeof val === 'string') return val.trim() !== '' ? val.trim() : 'N/A';
  return val.toString();
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// 🔹 Get category text without querySelector
async function getCategoryText(page) {
  const rawHTML = await page.$eval('#crtfcat', el => el.innerHTML).catch(() => '');
  const match = rawHTML.match(/^(.*?)<a/i);
  return match ? match[1].trim() : 'N/A';
}

async function getJobLinksSinglePage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log('Scraping job links & category...');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get category first
  const category = await getCategoryText(page);
  console.log(' Extracted category:', category);

  const links = await page.$$eval('div.job-title-text a', anchors => anchors.map(a => a.href));
  await browser.close();

  return { category, links: [...new Set(links)] };
}

async function scrapeJobsAndSaveFile(jobLinks) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await fs.writeFile('all_jobs.txt', '');

  for (let i = 0; i < jobLinks.length; i++) {
    const url = jobLinks[i];
    console.log(`Scraping job ${i + 1}/${jobLinks.length}: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await autoScroll(page);

      const jobText = await page.evaluate(() => document.documentElement.innerText);
      const content = `-----\nLink: ${url}\n\n${jobText}\n\n`;

      await fs.appendFile('all_jobs.txt', content);
    } catch (err) {
      console.error(`Failed to scrape ${url}:`, err.message);
    }
  }

  await browser.close();
}

function cleanJsonString(text) {
  return text.trim()
    .replace(/^```json\s*/, '')
    .replace(/^```\s*/, '')
    .replace(/```$/, '')
    .trim();
}

function normalizeArrays(jobs) {
  jobs.forEach(job => {
    if (typeof job.Responsibilities === 'string') {
      job.Responsibilities = job.Responsibilities.split(/\r?\n|;|•|-/).map(s => s.trim()).filter(Boolean);
    }
    if (typeof job.education === 'string') {
      job.education = job.education.split(/\r?\n|;|•|-/).map(s => s.trim()).filter(Boolean);
    }
    if (typeof job.skills === 'string') {
      job.skills = job.skills.split(/\r?\n|;|•|-/).map(s => s.trim()).filter(Boolean);
    }
  });
  return jobs;
}

async function saveJobsToDB(jobs, category) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.warn('No jobs to save.');
    return;
  }

  for (const job of jobs) {
    try {
      const [rows] = await db.query(
        `SELECT id FROM jobs WHERE link = ? AND job_title = ?`,
        [safe(job.job_link), safe(job.job_title)]
      );
      if (rows.length > 0) continue;

      const params = [
        safe(job.job_title),
        safe(job.company),
        safe(job.location),
        safe(job.experience),
        safe(job.education),
        safe(job.deadline),
        safe(job.published_date),
        safe(job.job_link),
        safe(job.skills),
        safe(job.site_name) || 'Bdjobs',
        safe(job.Responsibilities || []),
        safe(category) // 🔹 save category
      ];

      await db.query(
        `INSERT INTO jobs
         (job_title, company, location, experience, education, deadline, published, link, skill, site_name, Responsibilities, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );

      console.log(`Saved job: ${safe(job.job_title)}`);
    } catch (err) {
      console.error(`Error saving job "${job.job_title || 'Unknown'}":`, err.message);
    }
  }
}

async function scrapeJobLinksAndProcess() {
  try {
    const { category, links } = await getJobLinksSinglePage();
    const jobLinks = links.slice(0, 10);

    await scrapeJobsAndSaveFile(jobLinks);
    const allJobTexts = await fs.readFile('all_jobs.txt', 'utf-8');

    const prompt = `
You will receive several unstructured job descriptions. Extract structured job data for each job listing in the following JSON format:
[
  {
    "job_title": "",
    "company": "",
    "location": "",
    "experience": "",
    "education": [],
    "skills": [],
    "deadline": "",
    "published_date": "",
    "job_link": "",
    "site_name": "",
    "Responsibilities": []
  }
]
Here are the job listings:
${allJobTexts}
`;

    console.log('Sending prompt to Gemini LLM...');
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = cleanJsonString(text);

    await fs.writeFile('structured_jobs.json', cleanedText);
    
    const jobsData = JSON.parse(cleanedText);
    console.log(' Organized Data from LLM:\n', JSON.stringify(jobsData, null, 2));

    normalizeArrays(jobsData);
    await saveJobsToDB(jobsData, category);

    console.log('All done!');
  } catch (err) {
    console.error('Error in scrapeJobLinksAndProcess:', err);
  }
}

scrapeJobLinksAndProcess();
