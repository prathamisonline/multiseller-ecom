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

    // Seller Methods
    getMyProducts: async (params?: { status?: string }): Promise<{ success: boolean; data: { count: number; products: Product[] } }> => {
        const response = await api.get('/products/my-products', { params });
        return response.data;
    },

    getSellerProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    createProduct: async (data: any): Promise<{ success: boolean; data: Product }> => {
        const response = await api.post('/products', data);
        return response.data;
    },

    updateProduct: async (id: string, data: any): Promise<{ success: boolean; data: Product }> => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};
