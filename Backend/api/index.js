const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('../models/User');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const storeRoutes = require('../routes/stores');
const ratingRoutes = require('../routes/ratings');

dotenv.config({ path: __dirname + '/../.env' });

const app = express();

app.use(cors({
  origin: [
    'https://ornate-palmier-e90159.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB (only once per cold start)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // 30 seconds
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.send('Store Rating API is running');
});

module.exports = app;
