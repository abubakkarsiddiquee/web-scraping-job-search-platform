import express from 'express';
import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 2000;

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Rumi100!!',
  database: process.env.DB_NAME || 'job_scraper'
});

const safe = (val) => {
  if (Array.isArray(val)) return val.length > 0 ? JSON.stringify(val) : 'N/A';
  return val && typeof val === 'string' && val.trim() !== '' ? val.trim() : 'N/A';
};

async function saveJobsToDB(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    console.warn('No jobs to save.');
    return;
  }

  for (const job of jobs) {
    try {
      const [rows] = await db.query(
        'SELECT id FROM jobs WHERE link = ? AND job_title = ?',
        [safe(job.link), safe(job.jobTitle)]
      );

      if (rows.length > 0) {
        console.log(`Duplicate found. Skipping: ${safe(job.jobTitle)}`);
        continue;
      }

      await db.query(
        `INSERT INTO jobs
          (job_title, company, location, experience, education, deadline, published, link, created_at, skill, site_name, category, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
        [
          safe(job.jobTitle),
          safe(job.company),
          safe(job.location),
          safe(job.experience),
          safe(job.educationList),
          safe(job.deadline),
          safe(job.published),
          safe(job.link),
          safe(job.skill),
          'bdjobs',
          safe(job.category) || 'N/A',
          1
        ]
      );

      console.log(`Saved: ${safe(job.jobTitle)}`);

    } catch (err) {
      console.error(`Error saving "${job.jobTitle || 'Unknown'}": ${err.message}`);
    }
  }
}

const delay = (t) => new Promise((r) => setTimeout(r, t));

async function scrapeJobDetails(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await delay(3000);

    const result = await page.evaluate(() => {
      const textOf = (el) => (el ? el.textContent.trim() : '');

      // Try a few common job title selectors as a fallback
      const jobTitle = textOf(
        document.querySelector('h1') ||
        document.querySelector('h2') ||
        document.querySelector('[class*="job-title"]') ||
        document.querySelector('h2')
      );

      const educationList = [];
      document.querySelectorAll('li').forEach((li) => {
        const t = li.textContent.trim().toLowerCase();
        if (t.includes('bachelor') || t.includes('master') || t.includes('ssc') || t.includes('hsc')) {
          educationList.push(li.textContent.trim());
        }
      });

      const skill = [];
      // collect possible skill/tag elements
      document.querySelectorAll('button, .skill, .tags, .badge').forEach((el) => {
        const t = el.textContent.trim();
        if (t) skill.push(t);
      });

      // Helper to find a label node by its text and return either the next sibling's text
      // or the part after ':' if the label and value are in the same node.
      const findLabelNext = (label) => {
        const nodes = Array.from(document.querySelectorAll('p,div,span,li'));
        for (const n of nodes) {
          if (n.textContent && n.textContent.toLowerCase().includes(label.toLowerCase())) {
            const next = n.nextElementSibling;
            if (next) return next.textContent.trim();
            const parts = n.textContent.split(':');
            if (parts.length > 1) return parts.slice(1).join(':').trim();
            return '';
          }
        }
        return '';
      };

      const company = textOf(document.querySelector('#companyInfo') || document.querySelector('.company') || document.querySelector('.company-name'));
      const location = findLabelNext('Job Location') || findLabelNext('Location');
      const deadline = findLabelNext('Application Deadline') || findLabelNext('Deadline');
      const published = findLabelNext('Published') || findLabelNext('Posted');
      const experience = findLabelNext('Experience') || '';

      return { jobTitle, educationList, skill, company, location, deadline, published, experience };
    });

    if (!result.jobTitle) return null;
    result.link = url;
    return result;

  } catch (err) {
    console.error('Scraping error:', err);
    return null;
  } finally {
    await browser.close();
  }
}

async function scrapeAllJobs() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const baseUrl = 'https://jobs.bdjobs.com/jobsearch.asp?fcatId=5&icatId=';
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('div.job-title-text a', { visible: true });

    const category = await page.$eval('#crtfcat', (el) => el.textContent.trim().replace('X', '').trim());
    const jobLinks = await page.$$eval('div.job-title-text a', (anchors) => anchors.map((a) => a.href));

    const allJobs = [];
    for (const link of jobLinks) {
      console.log(`Scraping: ${link}`);
      const job = await scrapeJobDetails(link);
      if (job) {
        job.category = category;
        job.site_name = 'bdjobs';
        allJobs.push(job);
        console.log(`Added: ${job.jobTitle}`);
      }
    }

    await saveJobsToDB(allJobs);
    return allJobs;

  } catch (err) {
    console.error('Scrape error:', err);
    return [];
  } finally {
    await browser.close();
  }
}

app.get('/scrape', async (req, res) => {
  const jobs = await scrapeAllJobs();
  res.json(jobs);
});

app.listen(port, () => console.log(`✅ Scraper running at http://localhost:${port}`));