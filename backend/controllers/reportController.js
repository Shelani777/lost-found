const Report = require('../models/Report');

exports.create = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  const doc = await Report.create(payload);
  return res.json(doc.toJSON());
};

exports.update = async (req, res) => {
  const doc = await Report.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc.toJSON());
};

exports.remove = async (req, res) => {
  await Report.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
};
