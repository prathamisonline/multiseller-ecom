import api from './api';
import { CartItem } from '@/types';

export interface CartData {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

export const cartService = {
    getCart: async (): Promise<{ data: CartData }> => {
        const response = await api.get('/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number = 1): Promise<{ data: CartData }> => {
        const response = await api.post('/cart/items', { productId, quantity });
        return response.data;
    },

    updateQuantity: async (productId: string, quantity: number): Promise<{ data: CartData }> => {
        const response = await api.put(`/cart/items/${productId}`, { quantity });
        return response.data;
    },

    removeItem: async (productId: string): Promise<{ data: CartData }> => {
        const response = await api.delete(`/cart/items/${productId}`);
        return response.data;
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart');
    },

    validateCart: async (): Promise<any> => {
        const response = await api.post('/cart/validate');
        return response.data;
    }
};
