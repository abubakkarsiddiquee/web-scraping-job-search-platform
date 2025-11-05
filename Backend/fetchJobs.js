import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL config
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "job_scraper", // Make sure this DB exists
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Cleanup expired jobs logic (reusable function)
async function cleanupExpiredJobs() {
  const connection = await pool.getConnection();
  try {
    // Find expired jobs
    const [expiredJobs] = await connection.query(
      `SELECT id, job_title, deadline FROM jobs WHERE STR_TO_DATE(deadline, '%d %b %Y') < CURDATE()`
    );

    if (expiredJobs.length === 0) {
      console.log(`[${new Date().toISOString()}] No expired jobs found for deletion.`);
      return 0;
    }

    console.log(`[${new Date().toISOString()}] Deleting ${expiredJobs.length} expired jobs.`);
    expiredJobs.forEach(job => {
      console.log(`- ID: ${job.id}, Title: ${job.job_title}, Deadline: ${job.deadline}`);
    });

    // Delete expired jobs
    const [deleteResult] = await connection.query(
      `DELETE FROM jobs WHERE STR_TO_DATE(deadline, '%d %b %Y') < CURDATE()`
    );

    console.log(`[${new Date().toISOString()}] Deleted ${deleteResult.affectedRows} expired jobs.`);

    return deleteResult.affectedRows;
  } catch (error) {
    console.error("Error deleting expired jobs:", error.message);
    return 0;
  } finally {
    connection.release();
  }
}

// Fetch all jobs API
app.get("/api/fetchjobs", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          id,
          job_title,
          company,
          location,
          experience,
          education,
          deadline,
          published,
          link,
          created_at,
          skill,
          site_name,
          category
        FROM jobs
      `;
      const [jobs] = await connection.query(query);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error.message);
      res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    res.status(500).json({ message: "Database connection error", error: error.message });
  }
});

// Cleanup expired jobs API (optional manual trigger)
app.delete("/api/cleanup-expired", async (req, res) => {
  const deletedCount = await cleanupExpiredJobs();
  if (deletedCount === 0) {
    res.json({ message: "No expired jobs to delete.", deletedCount });
  } else {
    res.json({ message: `Deleted ${deletedCount} expired jobs.`, deletedCount });
  }
});

// Start server and run cleanup once on startup
const PORT = 3012;
app.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);

  console.log("Running expired jobs cleanup on server start...");
  const deletedCount = await cleanupExpiredJobs();
  if (deletedCount === 0) {
    console.log("No expired jobs found to delete on startup.");
  } else {
    console.log(`Deleted ${deletedCount} expired jobs on startup.`);
  }
  
});
