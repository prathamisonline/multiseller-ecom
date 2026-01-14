import api from './api';
import { Seller, Product } from '@/types';

export const adminService = {
    // Seller Management
    getAllSellers: async (params?: { status?: string }) => {
        const response = await api.get('/admin/sellers', { params });
        return response.data;
    },

    getSellerById: async (id: string) => {
        const response = await api.get(`/admin/sellers/${id}`);
        return response.data;
    },

    approveSeller: async (id: string) => {
        const response = await api.put(`/admin/sellers/${id}/approve`);
        return response.data;
    },

    rejectSeller: async (id: string, reason?: string) => {
        const response = await api.put(`/admin/sellers/${id}/reject`, { reason });
        return response.data;
    },

    suspendSeller: async (id: string, reason?: string) => {
        const response = await api.put(`/admin/sellers/${id}/suspend`, { reason });
        return response.data;
    },

    // Product Management
    getAllProducts: async (params?: { status?: string }) => {
        const response = await api.get('/admin/products', { params });
        return response.data;
    },

    approveProduct: async (id: string) => {
        const response = await api.put(`/admin/products/${id}/approve`);
        return response.data;
    },

    rejectProduct: async (id: string, reason?: string) => {
        const response = await api.put(`/admin/products/${id}/reject`, { reason });
        return response.data;
    },

    // User Management
    getAllUsers: async (params?: { role?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUserStatus: async (id: string, isActive: boolean) => {
        const response = await api.put(`/admin/users/${id}/status`, { isActive });
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    // Finance
    getFinanceStats: async () => {
        const response = await api.get('/admin/finance/stats');
        return response.data;
    },

    getPayouts: async () => {
        const response = await api.get('/admin/finance/payouts');
        return response.data;
    },
};
