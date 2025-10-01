const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');

// @route   POST api/agents
// @desc    Create an agent
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, email, mobile, password } = req.body;

  // Validate required fields
  if (!name || !email || !mobile || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, mobile, and password' });
  }

  try {
    // Check if agent already exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ msg: 'Agent already exists' });
    }

    agent = new Agent({
      name,
      email,
      mobile,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    agent.passwordHash = await bcrypt.hash(password, salt);

    await agent.save();

    // Return agent without passwordHash
    const agentResponse = agent.toObject();
    delete agentResponse.passwordHash;

    res.status(201).json(agentResponse);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

