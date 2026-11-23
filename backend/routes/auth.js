
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required'
      });
    }

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.execute(
      'INSERT INTO users (name, email, password, has_selected_goal) VALUES (?, ?, ?, ?)',
      [name, email, hashed, false]
    );

    res.status(201).json({
      message: 'User registered'
    });

  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({
      error: 'Registration failed'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    const user = users[0];

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        hasGoal: user.has_selected_goal
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

module.exports = router;
