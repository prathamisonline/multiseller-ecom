import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
    register: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        // Backend returns { statusCode, data: { token, user }, message }
        return response.data.data || response.data;
    },

    login: async (data: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        // Backend returns { statusCode, data: { token, user }, message }
        return response.data.data || response.data;
    },

    getMe: async (): Promise<{ user: User }> => {
        const response = await api.get('/auth/me');
        return response.data.data || response.data;
    },
};
