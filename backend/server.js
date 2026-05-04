require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const authRoutes = require('./routes/authRoutes');
const bootstrapRoutes = require('./routes/bootstrapRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const reportRoutes = require('./routes/reportRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost-found';
const PORT = Number(process.env.API_PORT || 4000);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check routes
app.get('/', (_req, res) => res.json({ message: 'Lost & Found API', status: 'running' }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// API Routes
app.use('/auth', authRoutes);
app.use('/bootstrap', bootstrapRoutes);
app.use('/categories', categoryRoutes);
app.use('/items', itemRoutes);
app.use('/claims', claimRoutes);
app.use('/reports', reportRoutes);
app.use('/announcements', announcementRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await mongoose.connect(MONGO_URI, { family: 4 });
  console.log('MongoDB Connected Successfully!');

  // Seed default admin account
  const adminExists = await User.findOne({ identityId: 'IV6859070' });
  if (!adminExists) {
    const adminHash = await bcrypt.hash('Admin@070', 10);
    await User.create({
      identityId: 'IV6859070',
      name: 'System Admin',
      email: 'admin@lostfound.com',
      age: 30,
      gender: 'Other',
      phone: '0000000000',
      userCategory: 'other',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    console.log('Seeded Admin user (IV6859070)');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
