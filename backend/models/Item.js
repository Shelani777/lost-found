const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['lost', 'found'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, default: null },
    contactNumber: { type: String, required: true },
    status: { type: String, enum: ['open', 'claimed', 'closed'], default: 'open' },
    publicity: { type: String, enum: ['everyone', 'students_only'], default: 'everyone' },
    likes: [{ type: String }],
    comments: [
      {
        userId: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: String, required: true },
      },
    ],
    userId: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

module.exports = mongoose.model('Item', itemSchema);
