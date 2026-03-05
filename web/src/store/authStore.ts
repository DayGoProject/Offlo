import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { AuthState } from '../types';
import { subscribeToAuthState } from '../services/auth';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
}));

// Auth 상태 전역 구독 (앱 최초 마운트 시 1회 호출)
export const initAuthListener = () => {
    return subscribeToAuthState((user: User | null) => {
        useAuthStore.setState({ user, loading: false });
    });
};
