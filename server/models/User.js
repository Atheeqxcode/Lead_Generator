const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
