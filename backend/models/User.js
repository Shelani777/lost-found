const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const userSchema = new mongoose.Schema(
  {
    identityId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    userCategory: { type: String, enum: ['student', 'other'], required: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

module.exports = mongoose.model('User', userSchema);
