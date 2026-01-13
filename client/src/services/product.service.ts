import api from './api';
import { Product, Category } from '@/types';

export const productService = {
    getAll: async (params?: { search?: string; category?: string; minPrice?: number; maxPrice?: number; sort?: string }): Promise<{ products: Product[] }> => {
        const response = await api.get('/store/products', { params });
        return response.data;
    },

    getById: async (idOrSlug: string): Promise<{ product: Product }> => {
        const response = await api.get(`/store/products/${idOrSlug}`);
        return response.data;
    },

    getCategories: async (): Promise<{ categories: Category[] }> => {
        // Assuming there's a categories endpoint or we extract from products
        const response = await api.get('/store/categories');
        return response.data;
    },

    getQrCode: async (productId: string): Promise<{ qrCode: string }> => {
        const response = await api.get(`/qrcode/product/${productId}`);
        return response.data;
    },
};
