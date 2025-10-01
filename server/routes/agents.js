const express = require('express');
const router = express.Router();

// @route   GET api/agents
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Agents route'));

module.exports = router;
