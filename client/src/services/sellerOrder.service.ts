import api from './api';
import { Order } from '@/types';

export interface SellerOrderResponse {
    success: boolean;
    data: {
        count: number;
        orders: Order[];
    };
}

export const sellerOrderService = {
    getOrders: async (params?: { status?: string; page?: number; limit?: number }): Promise<SellerOrderResponse> => {
        const response = await api.get('/seller-orders', { params });
        return response.data;
    },

    getOrderById: async (id: string): Promise<{ success: boolean; data: Order }> => {
        const response = await api.get(`/seller-orders/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, status: string, note?: string): Promise<{ success: boolean; data: Order }> => {
        const response = await api.put(`/seller-orders/${id}/status`, { status, note });
        return response.data;
    },
};
