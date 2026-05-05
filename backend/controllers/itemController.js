const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Report = require('../models/Report');
const User = require('../models/User');

async function getViewer(req) {
  return User.findById(req.user.id).lean();
}

function canSeeStudentsOnly(user) {
  return user?.role === 'admin' || user?.userCategory === 'student';
}

function applyVisibilityRule(payload, user) {
  if (payload.publicity === 'students_only' && !canSeeStudentsOnly(user)) {
    payload.publicity = 'everyone';
  }
  return payload;
}

function canManageItem(user, item) {
  return user?.role === 'admin' || item.userId === user?._id?.toString();
}

async function findVisibleItem(req, res) {
  const [item, user] = await Promise.all([Item.findById(req.params.id), getViewer(req)]);
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return null;
  }
  const owner = await User.findById(item.userId).lean();
  const isAdminPost = owner?.role === 'admin';
  if (item.publicity === 'students_only' && !isAdminPost && !canSeeStudentsOnly(user)) {
    res.status(403).json({ error: 'This post is visible to students only' });
    return null;
  }
  return item;
}

exports.create = async (req, res) => {
  const user = await getViewer(req);
  const payload = applyVisibilityRule({ ...req.body, userId: req.user.id }, user);
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  const doc = await Item.create(payload);
  return res.json(doc.toJSON());
};

exports.update = async (req, res) => {
  const user = await getViewer(req);
  const existing = await Item.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canManageItem(user, existing)) return res.status(403).json({ error: 'Access denied' });
  const patch = applyVisibilityRule({ ...(req.body || {}) }, user);
  const doc = await Item.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (patch.status === 'claimed') {
    await Claim.updateMany({ itemId: req.params.id, status: 'pending' }, { status: 'approved' });
  }
  if (patch.status === 'closed') {
    await Claim.updateMany({ itemId: req.params.id, status: 'pending' }, { status: 'rejected' });
  }
  return res.json(doc.toJSON());
};

exports.remove = async (req, res) => {
  const user = await getViewer(req);
  const existing = await Item.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canManageItem(user, existing)) return res.status(403).json({ error: 'Access denied' });
  await Item.findByIdAndDelete(req.params.id);
  await Claim.deleteMany({ itemId: req.params.id });
  await Report.deleteMany({ itemId: req.params.id });
  return res.json({ ok: true });
};

exports.like = async (req, res) => {
  const item = await findVisibleItem(req, res);
  if (!item) return;
  const userId = req.user.id;
  const likeIndex = item.likes.indexOf(userId);
  if (likeIndex > -1) {
    item.likes.splice(likeIndex, 1);
  } else {
    item.likes.push(userId);
  }
  await item.save();
  return res.json(item.toJSON());
};

exports.comment = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Comment text required' });
  const item = await findVisibleItem(req, res);
  if (!item) return;
  item.comments.push({
    userId: req.user.id,
    text,
    createdAt: new Date().toISOString(),
  });
  await item.save();
  return res.json(item.toJSON());
};
