const { Category } = require('../models/Category');
const Item = require('../models/Item');

function serialize(doc) {
  const obj = doc.toJSON ? doc.toJSON() : doc;
  return { ...obj, id: obj.id || obj._id?.toString(), _id: undefined };
}

function cleanPayload(body = {}) {
  const payload = {};
  if (typeof body.name === 'string') payload.name = body.name.trim();
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.icon === 'string') payload.icon = body.icon.trim() || 'tag';
  return payload;
}

exports.getAll = async (req, res) => {
  const categories = await Category.find({}).lean();
  return res.json(categories.map(serialize));
};

exports.create = async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.name) return res.status(400).json({ error: 'Name is required' });
  const doc = await Category.create(payload);
  return res.status(201).json(serialize(doc));
};

exports.update = async (req, res) => {
  const payload = cleanPayload(req.body);
  if ('name' in payload && !payload.name) return res.status(400).json({ error: 'Name is required' });
  const doc = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(serialize(doc));
};

exports.remove = async (req, res) => {
  const used = await Item.exists({ categoryId: req.params.id });
  if (used) return res.status(409).json({ error: 'Cannot delete a category that is used by posts.' });
  const doc = await Category.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
};
