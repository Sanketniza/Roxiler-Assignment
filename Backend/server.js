const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: __dirname + '/.env' });

// Initialize Express app
const app = express();  
// Catch-all OPTIONS handler for CORS
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://ornate-palmier-e90159.netlify.app',
    'http://localhost:5173',
    'http://localhost:5000'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});
app.use(express.json());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed admin user if not exists
const seedAdminUser = async () => {
  const adminEmail = 'sanket123@gmail.com';
  const adminPassword = 'Sanket123.';
  const adminName = 'System Administrator Admin'; // 26 characters, meets minlength
  const adminAddress = 'Admin Address';
  try {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      // Hash password before saving
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        address: adminAddress,
        role: 'admin'
      });
      console.log('Admin user seeded.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
};

connectDB().then(seedAdminUser);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Store Rating API is running');
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});