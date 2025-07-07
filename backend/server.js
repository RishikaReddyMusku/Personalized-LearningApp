const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const pathRoutes = require('./routes/path');



app.use('/api/auth', authRoutes);
app.use('/api/path', pathRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
