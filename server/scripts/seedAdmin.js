// This script seeds the database with an initial admin user.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables from the .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  // 1. Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  try {
    // 2. Get admin credentials from environment variables or use defaults
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';

    // 3. Check if the admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // 5. Create and save the new admin user
    const adminUser = new User({
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: [PROTECTED]`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding admin user:', error.message);
    process.exit(1);
  } finally {
    // 6. Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

seedAdmin();
