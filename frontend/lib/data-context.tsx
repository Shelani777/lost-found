import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiBootstrap, apiCreate, apiDelete, apiPatch, hasApiBaseUrl, ApiUser, apiLikeItem, apiCommentItem } from "./api";
import { useAuth } from "./auth-context";
import {
  Announcement,
  Category,
  ClaimRequest,
  DEFAULT_CATEGORIES,
  Item,
  ItemStatus,
  ItemType,
  Report,
  STORAGE_KEYS,
  ClaimStatus,
  ReportStatus,
  genId,
  readJSON,
  writeJSON,
} from "./storage";

interface DataState {
  ready: boolean;
  categories: Category[];
  items: Item[];
  claims: ClaimRequest[];
  reports: Report[];
  announcements: Announcement[];
  users: ApiUser[];
}

interface DataContextValue extends DataState {
  // Items
  createItem: (
    input: Omit<Item, "id" | "createdAt" | "status"> & { status?: ItemStatus },
  ) => Promise<Item>;
  updateItem: (id: string, patch: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setItemStatus: (id: string, status: ItemStatus) => Promise<void>;
  likeItem: (id: string) => Promise<void>;
  commentItem: (id: string, text: string) => Promise<void>;

  // Categories
  createCategory: (input: Omit<Category, "id">) => Promise<Category>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Claims
  createClaim: (input: Omit<ClaimRequest, "id" | "createdAt" | "status">) => Promise<ClaimRequest>;
  updateClaim: (id: string, patch: Partial<ClaimRequest>) => Promise<void>;
  deleteClaim: (id: string) => Promise<void>;
  setClaimStatus: (id: string, status: ClaimStatus) => Promise<void>;

  // Reports
  createReport: (input: Omit<Report, "id" | "createdAt" | "status">) => Promise<Report>;
  updateReport: (id: string, patch: Partial<Report>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  setReportStatus: (id: string, status: ReportStatus) => Promise<void>;

  // Announcements
  createAnnouncement: (input: Omit<Announcement, "id" | "createdAt">) => Promise<Announcement>;
  updateAnnouncement: (id: string, patch: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Helpers
  getItem: (id: string) => Item | undefined;
  getCategory: (id: string) => Category | undefined;
  getItemsByUser: (userId: string) => Item[];
  filterItems: (filters: {
    type?: ItemType | "all";
    categoryId?: string | "all";
    query?: string;
  }) => Item[];
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const useApi = hasApiBaseUrl();
  const { user, isAdmin } = useAuth();
  const [state, setState] = useState<DataState>({
    ready: false,
    categories: [],
    items: [],
    claims: [],
    reports: [],
    announcements: [],
    users: [],
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (useApi) {
        try {
          const data = await apiBootstrap();
          if (active) {
            setState({
              ready: true,
              categories: data.categories as Category[],
              items: data.items as Item[],
              claims: data.claims as ClaimRequest[],
              reports: data.reports as Report[],
              announcements: data.announcements as Announcement[],
              users: data.users as ApiUser[],
            });
          }
          return;
        } catch {
          // fallback to local storage mode
        }
      }
      let categories = await readJSON<Category[]>(STORAGE_KEYS.categories, []);
      if (categories.length === 0) {
        categories = DEFAULT_CATEGORIES;
        await writeJSON(STORAGE_KEYS.categories, categories);
      }
      const [items, claims, reports, announcements] = await Promise.all([
        readJSON<Item[]>(STORAGE_KEYS.items, []),
        readJSON<ClaimRequest[]>(STORAGE_KEYS.claims, []),
        readJSON<Report[]>(STORAGE_KEYS.reports, []),
        readJSON<Announcement[]>(STORAGE_KEYS.announcements, []),
      ]);
      if (active) {
        setState({ ready: true, categories, items, claims, reports, announcements, users: [] });
      }
    })();
    return () => {
      active = false;
    };
  }, [useApi]);

  const canViewItem = useCallback(
    (item: Item) => {
      if (isAdmin || user?.userCategory === "student") return true;
      const owner = state.users.find((u) => u.id === item.userId);
      if (owner?.role === "admin") return true;
      return item.publicity !== "students_only";
    },
    [isAdmin, state.users, user?.userCategory],
  );

  const visibleItems = useMemo(
    () => state.items.filter(canViewItem),
    [state.items, canViewItem],
  );

  // Generic persistence helper
  const persist = useCallback(
    async <K extends keyof Omit<DataState, "ready">>(
      key: K,
      storageKey: string,
      next: DataState[K],
    ) => {
      setState((s) => ({ ...s, [key]: next }));
      await writeJSON(storageKey, next);
    },
    [],
  );

  // Items
  const createItem = useCallback<DataContextValue["createItem"]>(
    async (input) => {
      if (useApi) {
        const created = await apiCreate<Item>("items", {
          status: input.status ?? "open",
          createdAt: new Date().toISOString(),
          ...input,
        });
        setState((s) => ({ ...s, items: [created, ...s.items] }));
        return created;
      }
      const item: Item = {
        id: genId(),
        createdAt: new Date().toISOString(),
        status: input.status ?? "open",
        ...input,
      };
      const next = [item, ...state.items];
      await persist("items", STORAGE_KEYS.items, next);
      return item;
    },
    [state.items, persist, useApi],
  );

  const updateItem = useCallback<DataContextValue["updateItem"]>(
    async (id, patch) => {
      if (useApi) {
        const updated = await apiPatch<Item>("items", id, patch);
        setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? updated : i)) }));
        return;
      }
      const next = state.items.map((i) => (i.id === id ? { ...i, ...patch } : i));
      await persist("items", STORAGE_KEYS.items, next);
    },
    [state.items, persist, useApi],
  );

  const deleteItem = useCallback<DataContextValue["deleteItem"]>(
    async (id) => {
      if (useApi) {
        await apiDelete("items", id);
        setState((s) => ({
          ...s,
          items: s.items.filter((i) => i.id !== id),
          claims: s.claims.filter((c) => c.itemId !== id),
          reports: s.reports.filter((r) => r.itemId !== id),
        }));
        return;
      }
      const next = state.items.filter((i) => i.id !== id);
      await persist("items", STORAGE_KEYS.items, next);
      // Cascade
      const claims = state.claims.filter((c) => c.itemId !== id);
      await persist("claims", STORAGE_KEYS.claims, claims);
      const reports = state.reports.filter((r) => r.itemId !== id);
      await persist("reports", STORAGE_KEYS.reports, reports);
    },
    [state.items, state.claims, state.reports, persist, useApi],
  );

  const setItemStatus = useCallback<DataContextValue["setItemStatus"]>(
    async (id, status) => {
      await updateItem(id, { status });
    },
    [updateItem],
  );

  const likeItem = useCallback<DataContextValue["likeItem"]>(
    async (id) => {
      if (useApi) {
        const updated = await apiLikeItem(id);
        setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? updated : i)) }));
      }
    },
    [useApi]
  );

  const commentItem = useCallback<DataContextValue["commentItem"]>(
    async (id, text) => {
      if (useApi) {
        const updated = await apiCommentItem(id, text);
        setState((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? updated : i)) }));
      }
    },
    [useApi]
  );

  // Categories
  const createCategory = useCallback<DataContextValue["createCategory"]>(
    async (input) => {
      if (useApi) {
        const created = await apiCreate<Category>("categories", input);
        setState((s) => ({ ...s, categories: [...s.categories, created] }));
        return created;
      }
      const category: Category = { id: genId(), ...input };
      const next = [...state.categories, category];
      await persist("categories", STORAGE_KEYS.categories, next);
      return category;
    },
    [state.categories, persist, useApi],
  );

  const updateCategory = useCallback<DataContextValue["updateCategory"]>(
    async (id, patch) => {
      if (useApi) {
        const updated = await apiPatch<Category>("categories", id, patch);
        setState((s) => ({ ...s, categories: s.categories.map((c) => (c.id === id ? updated : c)) }));
        return;
      }
      const next = state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
      await persist("categories", STORAGE_KEYS.categories, next);
    },
    [state.categories, persist, useApi],
  );

  const deleteCategory = useCallback<DataContextValue["deleteCategory"]>(
    async (id) => {
      if (useApi) {
        await apiDelete("categories", id);
        setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
        return;
      }
      const next = state.categories.filter((c) => c.id !== id);
      await persist("categories", STORAGE_KEYS.categories, next);
    },
    [state.categories, persist, useApi],
  );

  // Claims
  const createClaim = useCallback<DataContextValue["createClaim"]>(
    async (input) => {
      if (useApi) {
        const created = await apiCreate<ClaimRequest>("claims", {
          status: "pending",
          createdAt: new Date().toISOString(),
          ...input,
        });
        setState((s) => ({ ...s, claims: [created, ...s.claims] }));
        return created;
      }
      const claim: ClaimRequest = {
        id: genId(),
        createdAt: new Date().toISOString(),
        status: "pending",
        ...input,
      };
      const next = [claim, ...state.claims];
      await persist("claims", STORAGE_KEYS.claims, next);
      return claim;
    },
    [state.claims, persist, useApi],
  );

  const updateClaim = useCallback<DataContextValue["updateClaim"]>(
    async (id, patch) => {
      if (useApi) {
        const updated = await apiPatch<ClaimRequest>("claims", id, patch);
        setState((s) => ({ ...s, claims: s.claims.map((c) => (c.id === id ? updated : c)) }));
        return;
      }
      const next = state.claims.map((c) => (c.id === id ? { ...c, ...patch } : c));
      await persist("claims", STORAGE_KEYS.claims, next);
    },
    [state.claims, persist, useApi],
  );

  const deleteClaim = useCallback<DataContextValue["deleteClaim"]>(
    async (id) => {
      if (useApi) {
        await apiDelete("claims", id);
        setState((s) => ({ ...s, claims: s.claims.filter((c) => c.id !== id) }));
        return;
      }
      const next = state.claims.filter((c) => c.id !== id);
      await persist("claims", STORAGE_KEYS.claims, next);
    },
    [state.claims, persist, useApi],
  );

  const setClaimStatus = useCallback<DataContextValue["setClaimStatus"]>(
    async (id, status) => {
      await updateClaim(id, { status });
    },
    [updateClaim],
  );

  // Reports
  const createReport = useCallback<DataContextValue["createReport"]>(
    async (input) => {
      if (useApi) {
        const created = await apiCreate<Report>("reports", {
          status: "pending",
          createdAt: new Date().toISOString(),
          ...input,
        });
        setState((s) => ({ ...s, reports: [created, ...s.reports] }));
        return created;
      }
      const report: Report = {
        id: genId(),
        createdAt: new Date().toISOString(),
        status: "pending",
        ...input,
      };
      const next = [report, ...state.reports];
      await persist("reports", STORAGE_KEYS.reports, next);
      return report;
    },
    [state.reports, persist, useApi],
  );

  const updateReport = useCallback<DataContextValue["updateReport"]>(
    async (id, patch) => {
      if (useApi) {
        const updated = await apiPatch<Report>("reports", id, patch);
        setState((s) => ({ ...s, reports: s.reports.map((r) => (r.id === id ? updated : r)) }));
        return;
      }
      const next = state.reports.map((r) => (r.id === id ? { ...r, ...patch } : r));
      await persist("reports", STORAGE_KEYS.reports, next);
    },
    [state.reports, persist, useApi],
  );

  const deleteReport = useCallback<DataContextValue["deleteReport"]>(
    async (id) => {
      if (useApi) {
        await apiDelete("reports", id);
        setState((s) => ({ ...s, reports: s.reports.filter((r) => r.id !== id) }));
        return;
      }
      const next = state.reports.filter((r) => r.id !== id);
      await persist("reports", STORAGE_KEYS.reports, next);
    },
    [state.reports, persist, useApi],
  );

  const setReportStatus = useCallback<DataContextValue["setReportStatus"]>(
    async (id, status) => {
      await updateReport(id, { status });
    },
    [updateReport],
  );

  // Announcements
  const createAnnouncement = useCallback<DataContextValue["createAnnouncement"]>(
    async (input) => {
      if (useApi) {
        const created = await apiCreate<Announcement>("announcements", {
          createdAt: new Date().toISOString(),
          ...input,
        });
        setState((s) => ({ ...s, announcements: [created, ...s.announcements] }));
        return created;
      }
      const ann: Announcement = {
        id: genId(),
        createdAt: new Date().toISOString(),
        ...input,
      };
      const next = [ann, ...state.announcements];
      await persist("announcements", STORAGE_KEYS.announcements, next);
      return ann;
    },
    [state.announcements, persist, useApi],
  );

  const updateAnnouncement = useCallback<DataContextValue["updateAnnouncement"]>(
    async (id, patch) => {
      if (useApi) {
        const updated = await apiPatch<Announcement>("announcements", id, patch);
        setState((s) => ({
          ...s,
          announcements: s.announcements.map((a) => (a.id === id ? updated : a)),
        }));
        return;
      }
      const next = state.announcements.map((a) => (a.id === id ? { ...a, ...patch } : a));
      await persist("announcements", STORAGE_KEYS.announcements, next);
    },
    [state.announcements, persist, useApi],
  );

  const deleteAnnouncement = useCallback<DataContextValue["deleteAnnouncement"]>(
    async (id) => {
      if (useApi) {
        await apiDelete("announcements", id);
        setState((s) => ({ ...s, announcements: s.announcements.filter((a) => a.id !== id) }));
        return;
      }
      const next = state.announcements.filter((a) => a.id !== id);
      await persist("announcements", STORAGE_KEYS.announcements, next);
    },
    [state.announcements, persist, useApi],
  );

  // Helpers
  const getItem = useCallback((id: string) => visibleItems.find((i) => i.id === id), [visibleItems]);
  const getCategory = useCallback(
    (id: string) => state.categories.find((c) => c.id === id),
    [state.categories],
  );
  const getItemsByUser = useCallback(
    (userId: string) => state.items.filter((i) => i.userId === userId),
    [state.items],
  );

  const filterItems = useCallback<DataContextValue["filterItems"]>(
    ({ type = "all", categoryId = "all", query = "" }) => {
      const q = query.trim().toLowerCase();
      return visibleItems.filter((i) => {
        if (type !== "all" && i.type !== type) return false;
        if (categoryId !== "all" && i.categoryId !== categoryId) return false;
        if (q) {
          const hay = `${i.title} ${i.description} ${i.location}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    },
    [visibleItems],
  );

  const value = useMemo<DataContextValue>(
    () => ({
      ...state,
      items: visibleItems,
      createItem,
      updateItem,
      deleteItem,
      setItemStatus,
      likeItem,
      commentItem,
      createCategory,
      updateCategory,
      deleteCategory,
      createClaim,
      updateClaim,
      deleteClaim,
      setClaimStatus,
      createReport,
      updateReport,
      deleteReport,
      setReportStatus,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      getItem,
      getCategory,
      getItemsByUser,
      filterItems,
    }),
    [
      state,
      visibleItems,
      createItem,
      updateItem,
      deleteItem,
      setItemStatus,
      likeItem,
      commentItem,
      createCategory,
      updateCategory,
      deleteCategory,
      createClaim,
      updateClaim,
      deleteClaim,
      setClaimStatus,
      createReport,
      updateReport,
      deleteReport,
      setReportStatus,
      createAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      getItem,
      getCategory,
      getItemsByUser,
      filterItems,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
