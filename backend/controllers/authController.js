const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

exports.register = async (req, res) => {
  const { identityId, name, email, age, gender, phone, password, avatar } = req.body || {};
  const cleanId = String(identityId || '').trim().toUpperCase();
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const plainPassword = String(password || '');
  const numAge = Number(age);

  if (!cleanId) return res.status(400).json({ error: 'Please enter your ID/NIC' });
  if (!cleanName) return res.status(400).json({ error: 'Please enter your name' });
  if (!cleanEmail) return res.status(400).json({ error: 'Please enter a valid email' });
  if (!numAge || numAge < 1) return res.status(400).json({ error: 'Please enter a valid age' });
  if (!gender) return res.status(400).json({ error: 'Please select gender' });
  if (!phone) return res.status(400).json({ error: 'Please enter your phone number' });
  if (plainPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ identityId: cleanId });
  if (exists) return res.status(409).json({ error: 'An account with that ID already exists' });

  const userCategory = (cleanId.startsWith('IT') && cleanId.length >= 8) ? 'student' : 'other';
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const user = await User.create({
    identityId: cleanId,
    name: cleanName,
    email: cleanEmail,
    age: numAge,
    gender: String(gender),
    phone: String(phone),
    userCategory,
    passwordHash,
    avatar: avatar || null,
    role: 'user',
    createdAt: new Date().toISOString(),
  });

  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  const token = jwt.sign({ id: safeUser.id, role: safeUser.role }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, user: safeUser });
};

exports.login = async (req, res) => {
  const { identityId, password } = req.body || {};
  const cleanId = String(identityId || '').trim().toUpperCase();
  const plainPassword = String(password || '');
  if (!cleanId || !plainPassword) return res.status(400).json({ error: 'ID/NIC and password are required' });

  const user = await User.findOne({ identityId: cleanId });
  if (!user) return res.status(404).json({ error: 'No account found with that ID' });

  const ok = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Incorrect password' });

  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  const token = jwt.sign({ id: safeUser.id, role: safeUser.role }, JWT_SECRET, { expiresIn: '30d' });
  return res.json({ token, user: safeUser });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  return res.json({ user: safeUser });
};

exports.updateMe = async (req, res) => {
  const patch = {};
  if (typeof req.body?.name === 'string') patch.name = req.body.name.trim();
  if (typeof req.body?.avatar === 'string') patch.avatar = req.body.avatar;
  if (typeof req.body?.email === 'string') patch.email = req.body.email.trim().toLowerCase();
  if (typeof req.body?.phone === 'string') patch.phone = req.body.phone.trim();
  if (typeof req.body?.password === 'string' && req.body.password.length >= 6) {
    patch.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  const user = await User.findByIdAndUpdate(req.user.id, patch, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  return res.json({ user: safeUser });
};
