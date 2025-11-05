import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();
const port = 4000;

// ✅ Middleware
app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: 'http://localhost:5173', // ✅ Replace with your frontend port if different
  credentials: true
}));

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'job_scraper',
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  }
  console.log('✅ MySQL connected');
});


// ✅ GET /profile — Fetch user info + qualifications
app.get('/profile', (req, res) => {
  const { email } = req.query;



  if (!email) return res.status(400).json({ error: 'Email required' });

  const userQuery = `
    SELECT full_name, email, profile_picture, experience_years, skills 
    FROM users 
    WHERE email = ?
  `;

  const qualQuery = `
    SELECT id, university, degree, field_of_study 
    FROM qualifications 
    WHERE user_email = ?
  `;

  db.query(userQuery, [email], (err, userResults) => {
    if (err || userResults.length === 0) {
      console.error('❌ Error fetching user:', err);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResults[0];
    user.skills = user.skills ? user.skills.split(',').map(s => s.trim()) : [];

    db.query(qualQuery, [email], (err, qualResults) => {
      if (err) {
        console.error('❌ Error fetching qualifications:', err);
        return res.status(500).json({ error: 'Error fetching qualifications' });
      }

      user.qualifications = qualResults;
      res.json(user);
    });
  });
});


// ✅ POST /profile/update — Update profile info
app.post('/profile/update', (req, res) => {
  const {
    email,
    experience_years,
    skills,
    profile_picture,
    qualifications,
  } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  const experienceParsed = parseInt(experience_years, 10) || 0;
  const skillsFormatted = Array.isArray(skills) ? skills.join(',') : '';

  const updateUserQuery = `
    UPDATE users 
    SET experience_years = ?, skills = ?, profile_picture = ? 
    WHERE email = ?
  `;

  db.query(updateUserQuery, [experienceParsed, skillsFormatted, profile_picture || '', email], (err) => {
    if (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    const deleteQuery = 'DELETE FROM qualifications WHERE user_email = ?';
    db.query(deleteQuery, [email], (err) => {
      if (err) {
        console.error('❌ Error deleting qualifications:', err);
        return res.status(500).json({ error: 'Failed to reset qualifications' });
      }

      const insertQuery = `
        INSERT INTO qualifications (user_email, university, degree, field_of_study) 
        VALUES ?
      `;

      const values = (qualifications || []).map(q => [
        email,
        q.university || '',
        q.degree || '',
        q.field_of_study || '',
      ]);

      if (values.length === 0) {
        return res.json({ message: 'Profile updated successfully (no qualifications added)' });
      }

      db.query(insertQuery, [values], (err) => {
        if (err) {
          console.error('❌ Error inserting qualifications:', err);
          return res.status(500).json({ error: 'Failed to insert qualifications' });
        }

        console.log("✅ Profile updated successfully");
        res.json({ message: 'Profile updated successfully' });
      });
    });
  });
});


// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
