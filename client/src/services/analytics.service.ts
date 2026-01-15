import api from './api';

export interface OverviewStats {
    totalRevenue: number;
    todayRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    approvedProducts: number;
    pendingProducts: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    orders?: number;
    quantity?: number;
}

export interface TopProduct {
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    productImage?: string;
}

export interface TopSeller {
    sellerName: string;
    storeName: string;
    totalRevenue: number;
    totalOrders: number;
    uniqueProducts: number;
}

export const analyticsService = {
    // Seller Analytics
    getSellerOverview: async (): Promise<{
        revenue: { total: number; today: number };
        orders: { total: number; today: number; pending: number };
        products: { total: number; approved: number; pending: number };
    }> => {
        const response = await api.get('/analytics/seller/overview');
        return response.data.data || response.data;
    },

    getSellerRevenue: async (days: number = 7): Promise<{ success: boolean; data: any }> => {
        const response = await api.get(`/analytics/seller/revenue?days=${days}`);
        return response.data.data || response.data;
    },

    getSellerTopProducts: async (limit: number = 5): Promise<{ success: boolean; data: TopProduct[] }> => {
        const response = await api.get(`/analytics/seller/products/top?limit=${limit}`);
        return response.data.data || response.data;
    },

    // Admin Analytics
    getAdminOverview: async (): Promise<{ success: boolean; data: any }> => {
        const response = await api.get('/analytics/admin/overview');
        return response.data.data || response.data;
    },

    getAdminRevenue: async (period: string = 'daily', days: number = 30): Promise<{ success: boolean; data: any }> => {
        const response = await api.get(`/analytics/admin/revenue?period=${period}&days=${days}`);
        return response.data.data || response.data;
    },

    getAdminOrderStatus: async (): Promise<{ success: boolean; data: Record<string, number> }> => {
        const response = await api.get('/analytics/admin/orders/status');
        return response.data.data || response.data;
    },

    getAdminTopProducts: async (limit: number = 5): Promise<{ success: boolean; data: TopProduct[] }> => {
        const response = await api.get('/analytics/admin/products/top', { params: { limit } });
        return response.data.data || response.data;
    },

    getAdminTopSellers: async (limit: number = 5): Promise<{ success: boolean; data: TopSeller[] }> => {
        const response = await api.get('/analytics/admin/sellers/top', { params: { limit } });
        return response.data.data || response.data;
    },
};
