import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  ApiUser,
  apiLogin,
  apiMe,
  apiRegister,
  apiUpdateMe,
  hasApiBaseUrl,
  setToken,
} from "./api";
import {
  STORAGE_KEYS,
  User,
  genId,
  hashPassword,
  readJSON,
  writeJSON,
} from "./storage";

interface AuthState {
  user: User | null;
  ready: boolean;
}

interface AuthContextValue extends AuthState {
  login: (identityId: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (payload: {
    identityId: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phone: string;
    password: string;
    avatar?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "avatar" | "email" | "phone">> & { password?: string }) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
    identityId: user.identityId,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    phone: user.phone,
    userCategory: user.userCategory,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    passwordHash: "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, ready: false });
  const useApi = hasApiBaseUrl();

  useEffect(() => {
    let active = true;
    (async () => {
      if (useApi) {
        try {
          const user = await apiMe();
          if (active) setState({ user: mapApiUser(user), ready: true });
          return;
        } catch {
          await setToken(null);
          if (active) setState({ user: null, ready: true });
          return;
        }
      }
      const sessionId = await readJSON<string | null>(STORAGE_KEYS.session, null);
      const users = await readJSON<User[]>(STORAGE_KEYS.users, []);
      const user = sessionId ? users.find((u) => u.id === sessionId) ?? null : null;
      if (active) setState({ user, ready: true });
    })();
    return () => {
      active = false;
    };
  }, [useApi]);

  const login = useCallback<AuthContextValue["login"]>(async (identityId, password) => {
    if (useApi) {
      try {
        const user = await apiLogin(identityId, password);
        setState({ user: mapApiUser(user), ready: true });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Login failed" };
      }
    }
    const trimmed = identityId.trim().toUpperCase();
    if (!trimmed || !password) return { ok: false, error: "ID/NIC and password are required" };
    const users = await readJSON<User[]>(STORAGE_KEYS.users, []);
    const user = users.find((u) => u.identityId === trimmed);
    if (!user) return { ok: false, error: "No account found with that ID" };
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: "Incorrect password" };
    }
    await writeJSON(STORAGE_KEYS.session, user.id);
    setState({ user, ready: true });
    return { ok: true };
  }, [useApi]);

  const register = useCallback<AuthContextValue["register"]>(async (payload) => {
    if (useApi) {
      try {
        const user = await apiRegister(payload);
        setState({ user: mapApiUser(user), ready: true });
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Registration failed" };
      }
    }
    const cleanId = payload.identityId.trim().toUpperCase();
    const cleanName = payload.name.trim();
    const cleanEmail = payload.email.trim().toLowerCase();
    if (!cleanId) return { ok: false, error: "Please enter your ID/NIC" };
    if (!cleanName) return { ok: false, error: "Please enter your name" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: "Please enter a valid email" };
    }
    if (payload.password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const users = await readJSON<User[]>(STORAGE_KEYS.users, []);
    if (users.some((u) => u.identityId === cleanId)) {
      return { ok: false, error: "An account with that ID already exists" };
    }
    const userCategory = (cleanId.startsWith("IT") && cleanId.length >= 8) ? "student" : "other";
    const user: User = {
      id: genId(),
      identityId: cleanId,
      name: cleanName,
      email: cleanEmail,
      age: payload.age,
      gender: payload.gender,
      phone: payload.phone,
      userCategory,
      passwordHash: hashPassword(payload.password),
      avatar: payload.avatar,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    const next = [...users, user];
    await writeJSON(STORAGE_KEYS.users, next);
    await writeJSON(STORAGE_KEYS.session, user.id);
    setState({ user, ready: true });
    return { ok: true };
  }, [useApi]);

  const logout = useCallback(async () => {
    if (useApi) {
      await setToken(null);
      setState({ user: null, ready: true });
      return;
    }
    await writeJSON(STORAGE_KEYS.session, null);
    setState({ user: null, ready: true });
  }, [useApi]);

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (patch) => {
      if (!state.user) return;
      if (useApi) {
        try {
          const updated = await apiUpdateMe(patch);
          setState({ user: mapApiUser(updated), ready: true });
        } catch {
          // Keep local state when API patch fails.
        }
        return;
      }
      const users = await readJSON<User[]>(STORAGE_KEYS.users, []);
      const next = users.map((u) => {
        if (u.id !== state.user!.id) return u;
        const updated = { ...u, ...patch };
        if (patch.password) {
          updated.passwordHash = hashPassword(patch.password);
          delete (updated as any).password;
        }
        return updated;
      });
      await writeJSON(STORAGE_KEYS.users, next);
      const updatedUser = next.find((u) => u.id === state.user!.id) ?? null;
      setState({ user: updatedUser, ready: true });
    },
    [state.user, useApi],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateProfile,
      isAdmin: state.user?.role === "admin",
    }),
    [state, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
