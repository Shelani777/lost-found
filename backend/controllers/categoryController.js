const { Category } = require('../models/Category');

exports.getAll = async (req, res) => {
  const categories = await Category.find({}).lean();
  return res.json(categories.map(doc => ({ ...doc, id: doc._id.toString(), _id: undefined })));
};

exports.create = async (req, res) => {
  const payload = { ...req.body };
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  const doc = await Category.create(payload);
  return res.json(doc.toJSON());
};

exports.update = async (req, res) => {
  const doc = await Category.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(doc.toJSON());
};

exports.remove = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
};
