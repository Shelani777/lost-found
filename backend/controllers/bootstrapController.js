const { Category, DEFAULT_CATEGORIES } = require('../models/Category');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Report = require('../models/Report');
const Announcement = require('../models/Announcement');
const User = require('../models/User');

exports.bootstrap = async (req, res) => {
  let categories = await Category.find({}).lean();
  if (categories.length === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    categories = await Category.find({}).lean();
  }

  const user = await User.findById(req.user.id);
  const isStudent = user?.userCategory === 'student';
  const isAdmin = user?.role === 'admin';

  let itemsQuery = {};
  if (!isStudent && !isAdmin) {
    const adminIds = await User.find({ role: 'admin' }).distinct('_id');
    const adminUserIds = adminIds.map((id) => id.toString());
    itemsQuery = {
      $or: [
        { publicity: { $ne: 'students_only' } },
        { userId: { $in: adminUserIds } },
      ],
    };
  }

  const [items, claims, reports, announcements, allUsers] = await Promise.all([
    Item.find(itemsQuery).sort({ _id: -1 }).lean(),
    Claim.find({}).sort({ _id: -1 }).lean(),
    Report.find({}).sort({ _id: -1 }).lean(),
    Announcement.find({}).sort({ _id: -1 }).lean(),
    User.find({}).lean(),
  ]);

  const serialize = (arr) =>
    arr.map((doc) => ({ ...doc, id: doc._id.toString(), _id: undefined }));

  const safeUsers = allUsers.map((u) => {
    const safe = { ...u, id: u._id.toString(), _id: undefined };
    delete safe.passwordHash;
    return safe;
  });

  return res.json({
    categories: serialize(categories),
    items: serialize(items),
    claims: serialize(claims),
    reports: serialize(reports),
    announcements: serialize(announcements),
    users: safeUsers,
  });
};
