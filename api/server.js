require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lost-found";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = Number(process.env.API_PORT || 4000);

const baseOptions = {
  timestamps: false,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
};

const userSchema = new mongoose.Schema(
  {
    identityId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    userCategory: { type: String, enum: ["student", "other"], required: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "tag" },
  },
  baseOptions,
);

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, default: null },
    contactNumber: { type: String, required: true },
    status: { type: String, enum: ["open", "claimed", "closed"], default: "open" },
    publicity: { type: String, enum: ["everyone", "students_only"], default: "everyone" },
    likes: [{ type: String }],
    comments: [{
      userId: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: String, required: true }
    }],
    userId: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

const claimSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    message: { type: String, required: true },
    contactNumber: { type: String, required: true },
    proofImage: { type: String, default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

const reportSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    screenshot: { type: String, default: null },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    postedBy: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  baseOptions,
);

const User = mongoose.model("User", userSchema);
const Category = mongoose.model("Category", categorySchema);
const Item = mongoose.model("Item", itemSchema);
const Claim = mongoose.model("Claim", claimSchema);
const Report = mongoose.model("Report", reportSchema);
const Announcement = mongoose.model("Announcement", announcementSchema);

const DEFAULT_CATEGORIES = [
  { name: "Electronics", description: "Phones, laptops, headphones, chargers", icon: "smartphone" },
  { name: "Documents", description: "ID cards, certificates, papers", icon: "file-text" },
  { name: "Keys", description: "Key sets, keycards, fobs", icon: "key" },
  { name: "Wallet & Cards", description: "Wallets, purses, bank cards", icon: "credit-card" },
  { name: "Bags", description: "Backpacks, handbags, briefcases", icon: "briefcase" },
  { name: "Books & Notes", description: "Textbooks, notebooks, files", icon: "book" },
  { name: "Clothing", description: "Jackets, hats, scarves", icon: "shopping-bag" },
  { name: "Jewelry", description: "Rings, watches, necklaces", icon: "watch" },
  { name: "Other", description: "Anything else", icon: "package" },
];

function authMiddleware(req, res, next) {
  const value = req.headers.authorization || "";
  const token = value.startsWith("Bearer ") ? value.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/", (_req, res) => {
  res.json({ message: "Lost & Found API", status: "running" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/register", async (req, res) => {
  const { identityId, name, email, age, gender, phone, password, avatar } = req.body || {};
  const cleanId = String(identityId || "").trim().toUpperCase();
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const plainPassword = String(password || "");
  const numAge = Number(age);

  if (!cleanId) return res.status(400).json({ error: "Please enter your ID/NIC" });
  if (!cleanName) return res.status(400).json({ error: "Please enter your name" });
  if (!cleanEmail) return res.status(400).json({ error: "Please enter a valid email" });
  if (!numAge || numAge < 1) return res.status(400).json({ error: "Please enter a valid age" });
  if (!gender) return res.status(400).json({ error: "Please select gender" });
  if (!phone) return res.status(400).json({ error: "Please enter your phone number" });
  if (plainPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const exists = await User.findOne({ identityId: cleanId });
  if (exists) return res.status(409).json({ error: "An account with that ID already exists" });

  const userCategory = (cleanId.startsWith("IT") && cleanId.length >= 8) ? "student" : "other";

  const count = await User.countDocuments({});
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
    role: count === 0 ? "admin" : "user",
    createdAt: new Date().toISOString(),
  });

  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  const token = jwt.sign({ id: safeUser.id, role: safeUser.role }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token, user: safeUser });
});

app.post("/auth/login", async (req, res) => {
  const { identityId, password } = req.body || {};
  const cleanId = String(identityId || "").trim().toUpperCase();
  const plainPassword = String(password || "");
  if (!cleanId || !plainPassword) return res.status(400).json({ error: "ID/NIC and password are required" });

  const user = await User.findOne({ identityId: cleanId });
  if (!user) return res.status(404).json({ error: "No account found with that ID" });

  const ok = await bcrypt.compare(plainPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect password" });

  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  const token = jwt.sign({ id: safeUser.id, role: safeUser.role }, JWT_SECRET, { expiresIn: "30d" });
  return res.json({ token, user: safeUser });
});

app.get("/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  return res.json({ user: safeUser });
});

app.patch("/auth/me", authMiddleware, async (req, res) => {
  const patch = {};
  if (typeof req.body?.name === "string") patch.name = req.body.name.trim();
  if (typeof req.body?.avatar === "string") patch.avatar = req.body.avatar;
  const user = await User.findByIdAndUpdate(req.user.id, patch, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  const safeUser = user.toJSON();
  delete safeUser.passwordHash;
  return res.json({ user: safeUser });
});

app.get("/bootstrap", authMiddleware, async (req, res) => {
  let categories = await Category.find({}).lean();
  if (categories.length === 0) {
    await Category.insertMany(DEFAULT_CATEGORIES);
    categories = await Category.find({}).lean();
  }

  const user = await User.findById(req.user.id);
  const isStudent = user?.userCategory === "student";
  const isAdmin = user?.role === "admin";

  let itemsQuery = {};
  if (!isStudent && !isAdmin) {
    itemsQuery = { publicity: { $ne: "students_only" } };
  }

  const [items, claims, reports, announcements, allUsers] = await Promise.all([
    Item.find(itemsQuery).sort({ _id: -1 }).lean(),
    Claim.find({}).sort({ _id: -1 }).lean(),
    Report.find({}).sort({ _id: -1 }).lean(),
    Announcement.find({}).sort({ _id: -1 }).lean(),
    User.find({}).lean(),
  ]);

  const serialize = (arr) =>
    arr.map((doc) => ({
      ...doc,
      id: doc._id.toString(),
      _id: undefined,
    }));

  const safeUsers = allUsers.map(u => {
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
});

function createCrudRoutes(path, Model) {
  app.post(`/${path}`, authMiddleware, async (req, res) => {
    const payload = { ...req.body };
    if (!payload.createdAt) payload.createdAt = new Date().toISOString();
    const doc = await Model.create(payload);
    return res.json(doc.toJSON());
  });

  app.patch(`/${path}/:id`, authMiddleware, async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc.toJSON());
  });

  app.delete(`/${path}/:id`, authMiddleware, async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    if (path === "items") {
      await Claim.deleteMany({ itemId: req.params.id });
      await Report.deleteMany({ itemId: req.params.id });
    }
    return res.json({ ok: true });
  });
}

createCrudRoutes("categories", Category);
createCrudRoutes("items", Item);
createCrudRoutes("claims", Claim);
createCrudRoutes("reports", Report);
createCrudRoutes("announcements", Announcement);



app.post("/items/:id/comment", authMiddleware, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text required" });

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  item.comments.push({
    userId: req.user.id,
    text,
    createdAt: new Date().toISOString()
  });
  await item.save();
  return res.json(item.toJSON());
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await mongoose.connect(MONGO_URI);

  const adminExists = await User.findOne({ identityId: "IV6859070" });
  if (!adminExists) {
    const adminHash = await bcrypt.hash("Admin@070", 10);
    await User.create({
      identityId: "IV6859070",
      name: "System Admin",
      email: "admin@lostfound.com",
      age: 30,
      gender: "Other",
      phone: "0000000000",
      userCategory: "other",
      passwordHash: adminHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    });
    console.log("Seeded Admin user (IV6859070)");
  }

  app.listen(4000, "0.0.0.0", () => {
    console.log("API running on port 4000");
  });
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
