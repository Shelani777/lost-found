const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const claimSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    message: { type: String, required: true },
    contactNumber: { type: String, required: true },
    proofImage: { type: String, default: null },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

module.exports = mongoose.model('Claim', claimSchema);
