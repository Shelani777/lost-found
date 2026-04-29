import AsyncStorage from "@react-native-async-storage/async-storage";

export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "closed";
export type ClaimStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "pending" | "reviewed" | "resolved";
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  categoryId: string;
  location: string;
  image?: string;
  contactNumber: string;
  status: ItemStatus;
  userId: string;
  createdAt: string;
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  userId: string;
  message: string;
  contactNumber: string;
  proofImage?: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  itemId: string;
  userId: string;
  reason: string;
  description: string;
  screenshot?: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  postedBy: string;
  createdAt: string;
}

export const STORAGE_KEYS = {
  users: "lf:users",
  session: "lf:session",
  categories: "lf:categories",
  items: "lf:items",
  claims: "lf:claims",
  reports: "lf:reports",
  announcements: "lf:announcements",
} as const;

export const REPORT_REASONS = [
  "Fake / misleading post",
  "Inappropriate content",
  "Spam",
  "Duplicate post",
  "Harassment",
  "Other",
];

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// Lightweight non-cryptographic hash for demo persistence only.
export function hashPassword(password: string): string {
  let h1 = 0xdeadbeef ^ 0x9747b28c;
  let h2 = 0x41c6ce57 ^ 0x9747b28c;
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

export async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-electronics", name: "Electronics", description: "Phones, laptops, headphones, chargers", icon: "smartphone" },
  { id: "cat-documents", name: "Documents", description: "ID cards, certificates, papers", icon: "file-text" },
  { id: "cat-keys", name: "Keys", description: "Key sets, keycards, fobs", icon: "key" },
  { id: "cat-wallet", name: "Wallet & Cards", description: "Wallets, purses, bank cards", icon: "credit-card" },
  { id: "cat-bag", name: "Bags", description: "Backpacks, handbags, briefcases", icon: "briefcase" },
  { id: "cat-books", name: "Books & Notes", description: "Textbooks, notebooks, files", icon: "book" },
  { id: "cat-clothing", name: "Clothing", description: "Jackets, hats, scarves", icon: "shopping-bag" },
  { id: "cat-jewelry", name: "Jewelry", description: "Rings, watches, necklaces", icon: "watch" },
  { id: "cat-other", name: "Other", description: "Anything else", icon: "package" },
];

export function categoryIconFor(name: string): string {
  const c = DEFAULT_CATEGORIES.find((d) => d.name === name);
  return c?.icon ?? "tag";
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
}
