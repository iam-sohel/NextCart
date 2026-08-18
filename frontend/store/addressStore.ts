/**
 * NEXTCART — Address store (Zustand)
 *
 * Source of truth for the logged-in user's shipping addresses. The
 * backend already handles default-reassignment on create/update/delete,
 * so this store simply mirrors whatever the server returns — no
 * client-side default bookkeeping needed.
 *
 * Reused by:
 *   - Checkout page (pre-select default)
 *   - Account / Addresses page (list + CRUD)
 */

"use client";

import { create } from "zustand";

import {
  createAddress as apiCreate,
  deleteAddress as apiDelete,
  listAddresses as apiList,
  setDefaultAddress as apiSetDefault,
  updateAddress as apiUpdate,
  type AddressRequestPayload,
  type AddressResponseDTO,
} from "@/services/addressService";

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

interface AddressStore {
  items: AddressResponseDTO[];

  loading: boolean;
  error: string | null;

  /** Initial fetch — call once when a screen needs the address list. */
  fetchAll: () => Promise<Result<AddressResponseDTO[]>>;

  create: (payload: AddressRequestPayload) => Promise<Result<AddressResponseDTO>>;
  update: (
    id: number,
    payload: AddressRequestPayload,
  ) => Promise<Result<AddressResponseDTO>>;
  remove: (id: number) => Promise<Result<true>>;
  setDefault: (id: number) => Promise<Result<AddressResponseDTO>>;

  /** Canonical "find the default" helper used by the checkout pre-select. */
  getDefault: () => AddressResponseDTO | undefined;

  /** Reset on logout so a future user doesn't see the previous user's list. */
  reset: () => void;

  clearError: () => void;
}

function replaceById(
  items: AddressResponseDTO[],
  next: AddressResponseDTO,
): AddressResponseDTO[] {
  const idx = items.findIndex((a) => a.id === next.id);
  if (idx === -1) return [...items, next];
  const copy = items.slice();
  copy[idx] = next;
  return copy;
}

function enforceSingleDefault(
  items: AddressResponseDTO[],
  defaultId: number,
): AddressResponseDTO[] {
  return items.map((a) => ({
    ...a,
    isDefault: a.id === defaultId,
  }));
}

const useAddressStore = create<AddressStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null });
    const res = await apiList();
    if (!res.ok) {
      set({ loading: false, error: res.message });
      return { ok: false, message: res.message };
    }
    set({ items: res.data, loading: false, error: null });
    return { ok: true, data: res.data };
  },

  async create(payload) {
    set({ error: null });
    const res = await apiCreate(payload);
    if (!res.ok) {
      set({ error: res.message });
      return { ok: false, message: res.message };
    }
    const created = res.data;
    set((state) => {
      const next = replaceById(state.items, created);
      // If the backend returned isDefault=true, normalize locally too so
      // the UI doesn't show two defaults between the response and the
      // next refetch. Backend is the source of truth — this is just
      // optimistic reconciliation.
      return {
        items:
          created.isDefault === true
            ? enforceSingleDefault(next, created.id)
            : next,
      };
    });
    return { ok: true, data: created };
  },

  async update(id, payload) {
    set({ error: null });
    const res = await apiUpdate(id, payload);
    if (!res.ok) {
      set({ error: res.message });
      return { ok: false, message: res.message };
    }
    const updated = res.data;
    set((state) => {
      const next = replaceById(state.items, updated);
      return {
        items:
          updated.isDefault === true
            ? enforceSingleDefault(next, updated.id)
            : next,
      };
    });
    return { ok: true, data: updated };
  },

  async remove(id) {
    set({ error: null });
    const previous = get().items;
    set({ items: previous.filter((a) => a.id !== id) });

    const res = await apiDelete(id);
    if (!res.ok) {
      // Rollback and re-fetch — the server may have reassigned the
      // default during the delete, and our optimistic view would be stale.
      set({ items: previous, error: res.message });
      void get().fetchAll();
      return { ok: false, message: res.message };
    }
    // After a successful delete, the backend may have reassigned the
    // default. Re-fetch to be authoritative.
    void get().fetchAll();
    return { ok: true, data: true };
  },

  async setDefault(id) {
    set({ error: null });
    const res = await apiSetDefault(id);
    if (!res.ok) {
      set({ error: res.message });
      return { ok: false, message: res.message };
    }
    const updated = res.data;
    set((state) => ({
      items: enforceSingleDefault(replaceById(state.items, updated), id),
    }));
    return { ok: true, data: updated };
  },

  getDefault() {
    return get().items.find((a) => a.isDefault === true);
  },

  reset() {
    set({ items: [], loading: false, error: null });
  },

  clearError() {
    set({ error: null });
  },
}));

export default useAddressStore;
