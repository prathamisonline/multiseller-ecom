import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
    register: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    login: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    getMe: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};
