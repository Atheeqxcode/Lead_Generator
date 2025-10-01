const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  originalRowIndex: {
    type: Number,
    required: true
  }
});

const AssignedSchema = new mongoose.Schema({
  agent: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  items: [ItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assigned', AssignedSchema);
