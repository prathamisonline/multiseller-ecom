import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User } from '@/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    Cookies.set('token', token, { expires: 7 });
                    Cookies.set('user_role', user.role, { expires: 7 });
                }
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    Cookies.remove('token');
                    Cookies.remove('user_role');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
            updateUser: (user) => {
                if (typeof window !== 'undefined') {
                    Cookies.set('user_role', user.role, { expires: 7 });
                }
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
