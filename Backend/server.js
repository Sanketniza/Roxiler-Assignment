const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();  

// Middleware
app.use(cors());
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
    const adminName = 'System Administrator';
    const adminAddress = 'Admin Address';

    try {
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

            await User.create({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                address: adminAddress,
                role: 'admin'
            });

            console.log('Admin user seeded.');
        } 

        else {
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