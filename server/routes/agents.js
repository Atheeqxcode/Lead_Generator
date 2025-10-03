const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');

// @route   POST api/agents
// @desc    Create an agent
// @access  Private
router.post('/', auth, async (req, res) => {
  console.log('Received POST /api/agents request');
  console.log('Request body:', req.body);
  
  const { name, email, mobile, password } = req.body;

  // Validate required fields
  if (!name || !email || !mobile || !password) {
    console.log('Validation failed - missing fields:', { name: !!name, email: !!email, mobile: !!mobile, password: !!password });
    return res.status(400).json({ message: 'Please provide name, email, mobile, and password' });
  }

  try {
    // Check if agent already exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      console.log('Agent already exists with email:', email);
      return res.status(400).json({ message: 'Agent already exists' });
    }

    console.log('Creating new agent...');
    agent = new Agent({
      name,
      email,
      mobile,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    agent.passwordHash = await bcrypt.hash(password, salt);

    console.log('Saving agent to database...');
    await agent.save();
    console.log('Agent saved successfully');

    // Return agent without passwordHash
    const agentResponse = agent.toObject();
    delete agentResponse.passwordHash;

    res.status(201).json(agentResponse);

  } catch (err) {
    console.error('Error creating agent:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
});

// @route   GET api/agents
// @desc    Get all agents
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-passwordHash');
    res.json(agents);
  } catch (err) {
    console.error('Error fetching agents:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

