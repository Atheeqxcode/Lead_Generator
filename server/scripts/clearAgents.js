// This script deletes all agents from the database.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Agent = require('../models/Agent');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const deleteAgents = async () => {
  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }

  try {
    const deleteResult = await Agent.deleteMany({});
    console.log(`Successfully deleted ${deleteResult.deletedCount} agents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error deleting agents:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

deleteAgents();
