import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "./storage";

export interface ApiUser {
  id: string;
  identityId: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phone: string;
  userCategory: "student" | "other";
  avatar?: string;
  role: "user" | "admin";
  createdAt: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
const TOKEN_KEY = `${STORAGE_KEYS.session}:token`;

export function hasApiBaseUrl(): boolean {
  return API_URL.length > 0;
}

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasApiBaseUrl()) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }
  return data as T;
}

export async function apiRegister(payload: { identityId: string; name: string; email: string; age: number; gender: string; phone: string; password: string; avatar?: string }) {
  const data = await request<{ token: string; user: ApiUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  await setToken(data.token);
  return data.user;
}

export async function apiLogin(identityId: string, password: string) {
  const data = await request<{ token: string; user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identityId, password }),
  });
  await setToken(data.token);
  return data.user;
}

export async function apiMe() {
  const data = await request<{ user: ApiUser }>("/auth/me");
  return data.user;
}

export async function apiUpdateMe(patch: { name?: string; avatar?: string; email?: string; phone?: string; password?: string }) {
  const data = await request<{ user: ApiUser }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return data.user;
}

export async function apiBootstrap() {
  return request<{
    categories: any[];
    items: any[];
    claims: any[];
    reports: any[];
    announcements: any[];
    users: ApiUser[];
  }>("/bootstrap");
}

export async function apiLikeItem(id: string) {
  return request<any>(`/items/${id}/like`, { method: "POST" });
}

export async function apiCommentItem(id: string, text: string) {
  return request<any>(`/items/${id}/comment`, { 
    method: "POST",
    body: JSON.stringify({ text })
  });
}

export async function apiCreate<T>(path: string, payload: unknown) {
  return request<T>(`/${path}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function apiPatch<T>(path: string, id: string, payload: unknown) {
  return request<T>(`/${path}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function apiDelete(path: string, id: string) {
  return request<{ ok: true }>(`/${path}/${id}`, {
    method: "DELETE",
  });
}
