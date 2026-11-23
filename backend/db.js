require('dotenv').config();
const mysql = require('mysql2/promise'); // ✅ async/await version

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,   // optional — include if Railway gives it separately
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: 'TLSv1.2'
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
