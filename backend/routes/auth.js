const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).send({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (name, email, password, has_selected_goal) VALUES (?, ?, ?, ?)',
      [name, email, hashed, false]
    );

    res.send({ message: 'User registered' });
  } catch (err) {
    console.error('❌ Registration Error:', err.message);
    res.status(500).send({ error: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) return res.status(404).send({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, hasGoal: user.has_selected_goal },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.send({ token });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).send({ error: 'Login failed' });
  }
});

module.exports = router;
