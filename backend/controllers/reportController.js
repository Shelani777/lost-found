const Report = require('../models/Report');
const Item = require('../models/Item');
const mongoose = require('mongoose');

function serialize(doc) {
  const obj = doc.toJSON ? doc.toJSON() : doc;
  return { ...obj, id: obj.id || obj._id?.toString(), _id: undefined };
}

function cleanPayload(body = {}) {
  const payload = {};
  if (typeof body.itemId === 'string') payload.itemId = body.itemId.trim();
  if (typeof body.userId === 'string') payload.userId = body.userId.trim();
  if (typeof body.reason === 'string') payload.reason = body.reason.trim();
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.screenshot === 'string') payload.screenshot = body.screenshot.trim() || null;
  if (body.screenshot === null) payload.screenshot = null;
  if (typeof body.status === 'string') payload.status = body.status;
  if (typeof body.createdAt === 'string') payload.createdAt = body.createdAt;
  return payload;
}

function canAccessReport(req, report) {
  return req.user?.role === 'admin' || report.userId === req.user?.id;
}

exports.getAll = async (req, res) => {
  const query = req.user?.role === 'admin' ? {} : { userId: req.user.id };
  const reports = await Report.find(query).sort({ _id: -1 }).lean();
  return res.json(reports.map(serialize));
};

exports.getOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  if (!canAccessReport(req, report)) return res.status(403).json({ error: 'Access denied' });
  return res.json(serialize(report));
};

exports.create = async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  payload.userId = req.user.id;
  payload.status = 'pending';
  if (!payload.itemId) return res.status(400).json({ error: 'Post is required' });
  if (!payload.reason) return res.status(400).json({ error: 'Reason is required' });
  if (!payload.description) return res.status(400).json({ error: 'Description is required' });
  if (!mongoose.isValidObjectId(payload.itemId)) return res.status(404).json({ error: 'Post not found' });
  const item = await Item.findById(payload.itemId);
  if (!item) return res.status(404).json({ error: 'Post not found' });
  const doc = await Report.create(payload);
  return res.status(201).json(serialize(doc));
};

exports.update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const existing = await Report.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canAccessReport(req, existing)) return res.status(403).json({ error: 'Access denied' });

  const payload = cleanPayload(req.body);
  const allowedStatuses = ['pending', 'reviewed', 'resolved'];
  const patch = {};

  if (req.user?.role === 'admin' && 'status' in payload) {
    if (!allowedStatuses.includes(payload.status)) return res.status(400).json({ error: 'Invalid status' });
    patch.status = payload.status;
  }

  if (existing.userId === req.user.id) {
    if ('reason' in payload) {
      if (!payload.reason) return res.status(400).json({ error: 'Reason is required' });
      patch.reason = payload.reason;
    }
    if ('description' in payload) {
      if (!payload.description) return res.status(400).json({ error: 'Description is required' });
      patch.description = payload.description;
    }
    if ('screenshot' in payload) patch.screenshot = payload.screenshot;
  }

  const doc = await Report.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
  return res.json(serialize(doc));
};

exports.remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const existing = await Report.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (!canAccessReport(req, existing)) return res.status(403).json({ error: 'Access denied' });

  const doc = await Report.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
};
