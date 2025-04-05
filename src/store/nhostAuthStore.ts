import { create } from 'zustand';
import { nhost } from '../lib/nhost';
import { User } from '@nhost/nhost-js';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  signOut: async () => {
    await nhost.auth.signOut();
    set({ user: null, session: null });
  },
}));