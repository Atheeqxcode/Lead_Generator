// This script seeds the database with initial agent users.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');

// Load environment variables from the .env file in the server directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const getSampleAgents = async () => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  return [
    { name: 'John Doe', email: 'john.doe@example.com', mobile: '1234567890', passwordHash },
    { name: 'Jane Smith', email: 'jane.smith@example.com', mobile: '1234567891', passwordHash },
    { name: 'Peter Jones', email: 'peter.jones@example.com', mobile: '1234567892', passwordHash },
    { name: 'Mary Williams', email: 'mary.williams@example.com', mobile: '1234567893', passwordHash },
    { name: 'David Brown', email: 'david.brown@example.com', mobile: '1234567894', passwordHash },
  ];
};

const seedAgents = async () => {
  // 1. Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  try {
    // 2. Check if agents already exist
    const agentCount = await Agent.countDocuments();
    if (agentCount > 0) {
      console.log('Agents already exist. Seeding not required.');
      process.exit(0);
    }

    // 3. Get sample agents with hashed passwords
    const sampleAgents = await getSampleAgents();

    // 4. Insert the sample agents
    await Agent.insertMany(sampleAgents);
    console.log(`${sampleAgents.length} agents have been created successfully!`);
    process.exit(0);

  } catch (error) {
    console.error('Error seeding agents:', error.message);
    process.exit(1);
  } finally {
    // 5. Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

seedAgents();
