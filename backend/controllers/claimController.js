const Claim = require('../models/Claim');
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
  if (typeof body.message === 'string') payload.message = body.message.trim();
  if (typeof body.contactNumber === 'string') payload.contactNumber = body.contactNumber.trim();
  if (typeof body.proofImage === 'string') payload.proofImage = body.proofImage.trim() || null;
  if (body.proofImage === null) payload.proofImage = null;
  if (typeof body.status === 'string') payload.status = body.status;
  if (typeof body.createdAt === 'string') payload.createdAt = body.createdAt;
  return payload;
}

async function getItem(itemId) {
  if (!mongoose.isValidObjectId(itemId)) return null;
  return Item.findById(itemId);
}

function canViewClaim(req, claim, item) {
  return req.user?.role === 'admin' || claim.userId === req.user?.id || item?.userId === req.user?.id;
}

exports.getAll = async (req, res) => {
  if (req.user?.role === 'admin') {
    const claims = await Claim.find({}).sort({ _id: -1 }).lean();
    return res.json(claims.map(serialize));
  }

  const ownedItemIds = await Item.find({ userId: req.user.id }).distinct('_id');
  const itemIds = ownedItemIds.map((id) => id.toString());
  const claims = await Claim.find({
    $or: [{ userId: req.user.id }, { itemId: { $in: itemIds } }],
  }).sort({ _id: -1 }).lean();
  return res.json(claims.map(serialize));
};

exports.getOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Not found' });
  const item = await getItem(claim.itemId);
  if (!canViewClaim(req, claim, item)) return res.status(403).json({ error: 'Access denied' });
  return res.json(serialize(claim));
};

exports.create = async (req, res) => {
  const payload = cleanPayload(req.body);
  if (!payload.createdAt) payload.createdAt = new Date().toISOString();
  payload.userId = req.user.id;
  payload.status = 'pending';
  if (!payload.itemId) return res.status(400).json({ error: 'Item is required' });
  if (!payload.message) return res.status(400).json({ error: 'Message is required' });
  if (!payload.contactNumber) return res.status(400).json({ error: 'Contact number is required' });
  const item = await getItem(payload.itemId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const doc = await Claim.create(payload);
  return res.status(201).json(serialize(doc));
};

exports.update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const existing = await Claim.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const item = await getItem(existing.itemId);
  if (!canViewClaim(req, existing, item)) return res.status(403).json({ error: 'Access denied' });

  const payload = cleanPayload(req.body);
  const allowedStatuses = ['pending', 'approved', 'rejected'];
  const patch = {};

  if (existing.userId === req.user.id) {
    if ('message' in payload) {
      if (!payload.message) return res.status(400).json({ error: 'Message is required' });
      patch.message = payload.message;
    }
    if ('contactNumber' in payload) {
      if (!payload.contactNumber) return res.status(400).json({ error: 'Contact number is required' });
      patch.contactNumber = payload.contactNumber;
    }
    if ('proofImage' in payload) patch.proofImage = payload.proofImage;
  }

  if ((req.user?.role === 'admin' || item?.userId === req.user.id) && 'status' in payload) {
    if (!allowedStatuses.includes(payload.status)) return res.status(400).json({ error: 'Invalid status' });
    patch.status = payload.status;
  }

  const doc = await Claim.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
  if (patch.status === 'approved' && item) {
    await Item.findByIdAndUpdate(item.id, { status: 'claimed' });
  }
  return res.json(serialize(doc));
};

exports.remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const existing = await Claim.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (req.user?.role !== 'admin' && existing.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  await Claim.findByIdAndDelete(req.params.id);
  return res.json({ ok: true });
};
