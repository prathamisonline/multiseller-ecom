import api from './api';
import { Order, Address } from '@/types';

export const orderService = {
    createOrder: async (data: { shippingAddressId: string; notes?: string }): Promise<{ success: boolean; data: Order }> => {
        const response = await api.post('/orders', data);
        return response.data.data || response.data;
    },

    createGuestOrder: async (data: {
        items: { productId: string; quantity: number }[];
        shippingAddress: Partial<Address>;
        guestInfo: { email: string; phone: string; name: string };
    }): Promise<{ success: boolean; data: Order }> => {
        const response = await api.post('/orders/guest', data);
        return response.data.data || response.data;
    },

    getMyOrders: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ success: boolean; data: Order[]; count: number }> => {
        const response = await api.get('/orders/my-orders', { params });
        return response.data.data || response.data;
    },

    getOrderById: async (id: string): Promise<{ success: boolean; data: Order }> => {
        const response = await api.get(`/orders/${id}`);
        return response.data.data || response.data;
    },

    cancelOrder: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.put(`/orders/${id}/cancel`);
        return response.data.data || response.data;
    },
};
