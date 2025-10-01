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
const upload = multer({ dest: os.tmpdir() });

// Allowed file types
const allowedFileTypes = ['.csv', '.xls', '.xlsx'];

// @route   POST api/upload
// @desc    Upload, parse, and distribute leads
// @access  Private
router.post('/', [auth, upload.single('file')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExt = path.extname(req.file.originalname).toLowerCase();

  // Check for allowed file types
  if (!allowedFileTypes.includes(fileExt)) {
    fs.unlinkSync(filePath); // Clean up uploaded file
    return res.status(400).json({ msg: `File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}` });
  }

  const rows = [];
  let invalidRowCount = 0;

  try {
    // Parse file based on extension
    if (fileExt === '.csv') {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', () => processRows(rows));
    } else { // .xls or .xlsx
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      rows.push(...jsonData);
      processRows(rows);
    }
  } catch (err) {
    console.error(err.message);
    fs.unlinkSync(filePath);
    return res.status(500).send('Error parsing file');
  }

  async function processRows(parsedRows) {
    fs.unlinkSync(filePath); // Clean up uploaded file

    // Normalize and validate rows
    const normalizedRows = parsedRows.map(row => {
        const normalized = {};
        for (const key in row) {
            normalized[key.toLowerCase()] = row[key];
        }
        return {
            firstName: normalized.firstname || normalized['first name'],
            phone: normalized.phone,
            notes: normalized.notes,
        };
    });

    const validRows = normalizedRows.filter(row => {
        const isValid = row.firstName && row.phone;
        if (!isValid) invalidRowCount++;
        return isValid;
    });

    if (invalidRowCount > 0) {
        return res.status(400).json({ msg: `Found ${invalidRowCount} invalid rows. 'FirstName' and 'Phone' are required.` });
    }

    try {
        // Fetch first 5 agents
        const agents = await Agent.find().limit(5);
        if (agents.length < 5) {
            return res.status(400).json({ msg: 'Fewer than 5 agents found in the database.' });
        }

        // Distribution logic
        const total = validRows.length;
        const base = Math.floor(total / 5);
        const remainder = total % 5;
        const assignments = [];

        let currentIndex = 0;
        for (let i = 0; i < 5; i++) {
            const agent = agents[i];
            const assignedCount = base + (i < remainder ? 1 : 0);
            const items = validRows.slice(currentIndex, currentIndex + assignedCount).map((row, index) => ({
                ...row,
                originalRowIndex: currentIndex + index
            }));
            
            currentIndex += assignedCount;

            // Overwrite previous assignment
            await Assigned.findOneAndDelete({ agent: agent._id });
            const newAssignment = new Assigned({ agent: agent._id, items });
            await newAssignment.save();
            
            const populatedAssignment = await Assigned.findById(newAssignment._id).populate('agent', '-passwordHash');
            assignments.push(populatedAssignment);
        }

        res.json({
            message: 'Leads distributed and assigned successfully.',
            total,
            assignments: assignments.map(a => ({
                agentId: a.agent._id,
                assignedCount: a.items.length
            })),
            data: assignments
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  }
});

// @route   GET api/upload
// @desc    Get all assigned lists
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const assignments = await Assigned.find().populate('agent', '-passwordHash');
        res.json(assignments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

