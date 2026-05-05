const Announcement = require('../models/Announcement');

function serialize(doc) {
  const obj = doc.toJSON ? doc.toJSON() : doc;
  return { ...obj, id: obj.id || obj._id?.toString(), _id: undefined };
}

function cleanPayload(body = {}) {
  const payload = {};
  if (typeof body.title === 'string') payload.title = body.title.trim();
  if (typeof body.description === 'string') payload.description = body.description.trim();
  if (typeof body.image === 'string') payload.image = body.image.trim() || null;
  if (body.image === null) payload.image = null;
  if (typeof body.postedBy === 'string') payload.postedBy = body.postedBy.trim();
  if (typeof body.createdAt === 'string') payload.createdAt = body.createdAt;
  return payload;
}

exports.create = async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  if (!payload.postedBy && req.user?.id) payload.postedBy = req.user.id;
  if (!payload.title) return res.status(400).json({ error: 'Title is required' });
  if (!payload.description) return res.status(400).json({ error: 'Description is required' });
  if (!payload.postedBy) return res.status(400).json({ error: 'Posted by is required' });
  const doc = await Announcement.create(payload);
  return res.status(201).json(serialize(doc));
};

exports.update = async (req, res) => {
  const payload = cleanPayload(req.body);
  if ('title' in payload && !payload.title) return res.status(400).json({ error: 'Title is required' });
  if ('description' in payload && !payload.description) {
    return res.status(400).json({ error: 'Description is required' });
  }
  const doc = await Announcement.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json(serialize(doc));
};

exports.remove = async (req, res) => {
  const doc = await Announcement.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
};
