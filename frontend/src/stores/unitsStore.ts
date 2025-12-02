import { create } from 'zustand';
import type { Unit } from '../types/index';
import { getUnits } from '../services/api';

interface UnitsState {
  units: Unit[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchUnits: () => Promise<void>;
  addUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  invalidate: () => void;
}

export const useUnitsStore = create<UnitsState>((set, get) => ({
  units: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchUnits: async () => {
    // Avoid refetching if we fetched recently (within 5 seconds)
    const now = Date.now();
    const lastFetched = get().lastFetched;
    if (lastFetched && now - lastFetched < 5000 && get().units.length > 0) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await getUnits();
      set({
        units: response.data?.units ?? [],
        loading: false,
        lastFetched: now,
      });
    } catch {
      set({
        error: 'Failed to load units',
        loading: false,
      });
    }
  },

  addUnit: (unit: Unit) => {
    set(state => ({
      units: [...state.units, unit],
    }));
  },

  removeUnit: (unitId: string) => {
    set(state => ({
      units: state.units.filter(u => u.id !== unitId),
    }));
  },

  updateUnit: (unitId: string, updates: Partial<Unit>) => {
    set(state => ({
      units: state.units.map(u => (u.id === unitId ? { ...u, ...updates } : u)),
    }));
  },

  // Force a refetch on next access
  invalidate: () => {
    set({ lastFetched: null });
  },
}));
