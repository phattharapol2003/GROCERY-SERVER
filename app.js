const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json());

// Set up the MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'Panida'
});

// Create the login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Query the database for the user
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Check if the user exists
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare the provided password with the stored hash
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Generate and return an access token if the passwords match
      if (isMatch) {
        const accessToken = jwt.sign({ username: user.username }, 'secret_key', { expiresIn: '1h' });
        res.json({ access_token: accessToken });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});