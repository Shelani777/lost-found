const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function isValidNic(identityId) {
  const id = String(identityId || '').trim().toUpperCase();
  const oldNic = /^(\d{2})(\d{3})\d{4}[VX]$/.exec(id);
  const newNic = /^(\d{4})(\d{3})\d{5}$/.exec(id);
  const dayValue = oldNic ? Number(oldNic[2]) : newNic ? Number(newNic[2]) : 0;
  return (dayValue >= 1 && dayValue <= 366) || (dayValue >= 501 && dayValue <= 866);
}

function isValidStudentId(identityId) {
  return /^[A-Z]{2}\d{8}$/.test(String(identityId || '').trim());
}

function getIdentityCategory(identityId) {
  const cleanId = String(identityId || '').trim().toUpperCase();
  if (isValidStudentId(cleanId)) return 'student';
  if (isValidNic(cleanId)) return 'other';
  return null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

exports.register = async (req, res) => {
  const { identityId, name, email, age, gender, phone, password, avatar } = req.body || {};
  const cleanId = String(identityId || '').trim().toUpperCase();
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const plainPassword = String(password || '');
  const numAge = Number(age);

  if (!cleanId) return res.status(400).json({ error: 'Please enter your ID/NIC' });
  const userCategory = getIdentityCategory(cleanId);
  if (!userCategory) return res.status(400).json({ error: 'Enter a valid Sri Lankan NIC or SLIIT student ID.' });
  if (!cleanName) return res.status(400).json({ error: 'Please enter your name' });
  if (!isValidEmail(cleanEmail)) return res.status(400).json({ error: 'Please enter a valid email' });
  if (!numAge || numAge < 1) return res.status(400).json({ error: 'Please enter a valid age' });
  if (!gender) return res.status(400).json({ error: 'Please select gender' });
  if (!phone) return res.status(400).json({ error: 'Please enter your phone number' });
  if (plainPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ identityId: cleanId });
  if (exists) return res.status(409).json({ error: 'An account with that ID already exists' });

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
