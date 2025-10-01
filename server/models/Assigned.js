const mongoose = require('mongoose');
const { Schema } = mongoose;

const AssignedSchema = new mongoose.Schema({
  leadId: {
    type: String, // Assuming leadId is a string, can be changed to ObjectId if there's a Lead model
    required: true
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Assigned', AssignedSchema);
