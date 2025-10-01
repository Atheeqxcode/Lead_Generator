const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  mobile: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
