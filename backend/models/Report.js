const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const reportSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    screenshot: { type: String, default: null },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

module.exports = mongoose.model('Report', reportSchema);
