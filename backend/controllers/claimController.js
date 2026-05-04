const Claim = require('../models/Claim');

exports.create = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  const doc = await Claim.create(payload);
  return res.json(doc.toJSON());
};

exports.update = async (req, res) => {
  const doc = await Claim.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc.toJSON());
};

exports.remove = async (req, res) => {
  await Claim.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
};
