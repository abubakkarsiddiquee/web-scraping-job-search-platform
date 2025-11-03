import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('MySQL connected...');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


app.post('/signup', async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (full_name, email, password, profile_picture)
      VALUES (?, ?, ?, NULL)
    `;

    db.query(insertQuery, [full_name, email, hashedPassword], (err) => {
      if (err) {
        console.error('DB error during signup:', err);
        return res.status(500).json({ error: 'Database error during signup' });
      }

      const mailOptions = {
        from: 'awubakkarsiddique444@gmail.com',
        to: email,
        subject: 'Welcome to JobMerge!',
        html: `
          <p>Hello ${full_name},</p>
          <p>Thank you for signing up to JobMerge.</p>
          <p>We're excited to have you on board.</p>
          <p>Best wishes,<br/>JobMerge Team</p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
          return res.status(500).json({ message: 'Signup successful, but email failed' });
        }

        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Signup successful! Email sent.' });
      });
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user });
  });
});

import './fetchJobs.js';
import './profileBackend.js';

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
