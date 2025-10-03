const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const os = require('os');
const path = require('path');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');
const Assigned = require('../models/Assigned');

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Allowed file types
const allowedFileTypes = ['.csv', '.xls', '.xlsx'];

// @route   POST api/upload
// @desc    Upload a file for lead distribution
// @access  Private
router.post('/', [auth, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  // --- Agent Selection ---
  let selectedAgentIds;
  try {
    console.log('Raw req.body.agents:', req.body.agents);
    selectedAgentIds = JSON.parse(req.body.agents || '[]');
    console.log('Parsed selectedAgentIds:', selectedAgentIds);
    if (!Array.isArray(selectedAgentIds) || selectedAgentIds.length === 0) {
      console.log('No agents selected');
      return res.status(400).json({ message: 'No agents selected for distribution.' });
    }
  } catch (e) {
    console.log('Error parsing agents:', e.message);
    return res.status(400).json({ message: 'Invalid format for selected agents.' });
  }

  const { path: filePath, originalname } = req.file;
  const fileExt = path.extname(originalname).toLowerCase();

  const rows = [];
  let invalidRows = [];

  const processFile = () => {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      stream
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => {
          fs.unlinkSync(filePath); // Clean up file
          resolve();
        })
        .on('error', (err) => {
          fs.unlinkSync(filePath); // Clean up file
          reject(err);
        });
    });
  };

  try {
    // Parse file based on extension
    if (fileExt === '.csv') {
      await processFile();
    } else { // .xls or .xlsx
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows.push(...xlsx.utils.sheet_to_json(sheet));
      fs.unlinkSync(filePath); // Clean up file
    }

    // --- Start Processing Rows ---
    
    console.log('Total rows parsed:', rows.length);
    
    if (rows.length === 0) {
      console.log('No rows found in file');
      return res.status(400).json({ message: 'The uploaded file is empty.' });
    }

    // Don't validate column names - just use all rows as they are
    const validRows = rows.filter(row => {
      // Only skip completely empty rows
      return Object.keys(row).length > 0 && Object.values(row).some(val => val && val.toString().trim() !== '');
    });

    console.log('Valid rows after filtering empty:', validRows.length);

    // --- Updated Distribution Logic ---

    console.log('Valid rows count:', validRows.length);
    console.log('Selected agent IDs:', selectedAgentIds);

    // Fetch only the selected agents from the database
    const selectedAgents = await Agent.find({ '_id': { $in: selectedAgentIds } });
    console.log('Found agents:', selectedAgents.length);
    console.log('Agent details:', selectedAgents.map(a => ({ id: a._id.toString(), name: a.name })));
    
    if (selectedAgents.length !== selectedAgentIds.length) {
      console.log('Agent count mismatch!');
      return res.status(400).json({ message: 'One or more selected agents could not be found.' });
    }

    if (validRows.length === 0) {
      console.log('No valid rows to distribute');
      return res.status(400).json({ message: 'No valid leads found in the uploaded file.' });
    }

    // Distribute leads only among the selected agents
    const total = validRows.length;
    const agentsCount = selectedAgents.length;
    const base = Math.floor(total / agentsCount);
    const remainder = total % agentsCount;
    const assignments = [];

    console.log('Distribution plan:', { total, agentsCount, base, remainder });

    let currentIndex = 0;
    for (let i = 0; i < agentsCount; i++) {
      const agent = selectedAgents[i];
      const itemsToAssignCount = base + (i < remainder ? 1 : 0);
      if (itemsToAssignCount === 0) continue;

      const itemsForAgent = validRows.slice(currentIndex, currentIndex + itemsToAssignCount);
      currentIndex += itemsToAssignCount;

      console.log(`Assigning ${itemsToAssignCount} leads to agent ${agent.name} (${agent._id})`);

      // Find existing assignment or create new
      let assignment = await Assigned.findOne({ agent: agent._id });
      if (assignment) {
        assignment.items.push(...itemsForAgent);
        console.log(`Updated existing assignment for ${agent.name}, total items: ${assignment.items.length}`);
      } else {
        assignment = new Assigned({
          agent: agent._id,
          items: itemsForAgent,
        });
        console.log(`Created new assignment for ${agent.name}`);
      }
      assignments.push(assignment.save());
    }

    await Promise.all(assignments);
    console.log('All assignments saved successfully');

    res.json({
        message: 'File processed and leads distributed successfully.',
        totalRows: rows.length,
        distributedCount: validRows.length,
        invalidRows: [],
    });

  } catch (err) {
    console.error('Error processing file:', err);
    console.error('Error stack:', err.stack);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    return res.status(500).json({ message: 'Error processing file: ' + err.message });
  }
});

// @route   GET api/upload
// @desc    Get all assigned leads
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assigned.find().populate('agent', 'name email');
    res.json(assignments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

