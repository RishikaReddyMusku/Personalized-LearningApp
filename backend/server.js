const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const pool = require('./db');

const authRoutes = require('./routes/auth');
const pathRoutes = require('./routes/path');

async function testDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to freesqldatabase MySQL!');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
  }
}
testDBConnection();

app.use('/api/auth', authRoutes);
app.use('/api/path', pathRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
