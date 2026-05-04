const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    postedBy: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

module.exports = mongoose.model('Announcement', announcementSchema);
