import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface Child {
  id: string;
  name: string;
  age: number;
  avatarUrl: string;
  points: number;
  buddy?: string;
  preferredDifficulty?: string;
  themePreference?: string;
}

interface Family {
  id: string;
  name: string;
  children: Child[];
}

interface FamilyState {
  family: Family | null;
  children: Child[];
  loading: boolean;
  error: string | null;
  fetchFamily: () => Promise<void>;
  fetchChildren: () => Promise<void>;
  addChild: (child: Omit<Child, 'id' | 'points'>) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  children: [],
  loading: false,
  error: null,
  fetchFamily: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/api/families');
      set({ family: response.data.family, children: response.data.family?.children || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch family', loading: false });
    }
  },
  fetchChildren: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/api/children');
      set({ children: response.data.children || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch children', loading: false });
    }
  },
  addChild: async (childData) => {
    set({ loading: true, error: null });
    try {
      const family = get().family;
      if (!family) {
        throw new Error('No family found');
      }
      const response = await apiClient.post('/api/children', {
        ...childData,
        familyId: family.id,
      });
      set((state) => ({
        children: [...state.children, response.data.child],
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add child';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  updateChild: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.put(`/api/children/${id}`, updates);
      set((state) => ({
        children: state.children.map((c) => (c.id === id ? response.data.child : c)),
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update child';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  deleteChild: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/api/children/${id}`);
      set((state) => ({
        children: state.children.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete child';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));

