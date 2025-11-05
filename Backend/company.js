// fetchCompanyJobs.js
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "job_scraper",
};

async function fetchCompanyJobs() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Query company and number of jobs
    const [rows] = await connection.execute(`
      SELECT company, COUNT(job_title) AS job_count
      FROM jobs
      GROUP BY company
      ORDER BY job_count DESC
    `);

    // Output as JSON
    console.log(JSON.stringify(rows, null, 2));

  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    if (connection) await connection.end();
  }
}

fetchCompanyJobs();
