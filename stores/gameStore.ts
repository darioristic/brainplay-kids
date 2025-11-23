import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

interface GameModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  minAge: number;
  rewardPoints: number;
  locked?: boolean;
  progress?: number;
}

interface GameSession {
  id: string;
  childId: string;
  gameModuleId: string;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  points: number;
  completed: boolean;
}

interface GameState {
  modules: GameModule[];
  activeSession: GameSession | null;
  loading: boolean;
  error: string | null;
  fetchModules: (childId?: string) => Promise<void>;
  createSession: (childId: string, gameModuleId: string, question: string, correctAnswer: string) => Promise<GameSession>;
  submitAnswer: (sessionId: string, answer: string) => Promise<boolean>;
  completeSession: (sessionId: string) => Promise<number>;
  clearSession: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  modules: [],
  activeSession: null,
  loading: false,
  error: null,
  fetchModules: async (childId) => {
    set({ loading: true, error: null });
    try {
      const url = childId ? `/api/games/modules?childId=${childId}` : '/api/games/modules';
      const response = await apiClient.get(url);
      set({ modules: response.data.modules || [], loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch modules', loading: false });
    }
  },
  createSession: async (childId, gameModuleId, question, correctAnswer) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/api/games/sessions', {
        childId,
        gameModuleId,
        question,
        correctAnswer,
      });
      const session = response.data.session;
      set({ activeSession: session, loading: false });
      return session;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create session';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  submitAnswer: async (sessionId, answer) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post(`/api/games/sessions/${sessionId}/answer`, {
        answer,
      });
      const isCorrect = response.data.isCorrect;
      set((state) => ({
        activeSession: state.activeSession
          ? { ...state.activeSession, userAnswer: answer, isCorrect }
          : null,
        loading: false,
      }));
      return isCorrect;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit answer';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  completeSession: async (sessionId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post(`/api/games/sessions/${sessionId}/complete`);
      const points = response.data.points;
      set({ loading: false });
      return points;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to complete session';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  clearSession: () => {
    set({ activeSession: null });
  },
}));

