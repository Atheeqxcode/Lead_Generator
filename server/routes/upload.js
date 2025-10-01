const express = require('express');
const router = express.Router();

// @route   GET api/upload
// @desc    Test route
// @access  Public
router.get('/', (req, res) => res.send('Upload route'));

module.exports = router;
