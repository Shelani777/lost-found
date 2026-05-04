const mongoose = require('mongoose');
const baseOptions = require('./baseOptions');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: 'tag' },
  },
  baseOptions,
);

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', description: 'Phones, laptops, headphones, chargers', icon: 'smartphone' },
  { name: 'Documents', description: 'ID cards, certificates, papers', icon: 'file-text' },
  { name: 'Keys', description: 'Key sets, keycards, fobs', icon: 'key' },
  { name: 'Wallet & Cards', description: 'Wallets, purses, bank cards', icon: 'credit-card' },
  { name: 'Bags', description: 'Backpacks, handbags, briefcases', icon: 'briefcase' },
  { name: 'Books & Notes', description: 'Textbooks, notebooks, files', icon: 'book' },
  { name: 'Clothing', description: 'Jackets, hats, scarves', icon: 'shopping-bag' },
  { name: 'Jewelry', description: 'Rings, watches, necklaces', icon: 'watch' },
  { name: 'Other', description: 'Anything else', icon: 'package' },
];

module.exports = { Category: mongoose.model('Category', categorySchema), DEFAULT_CATEGORIES };
