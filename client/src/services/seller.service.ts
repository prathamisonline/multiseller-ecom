import api from './api';
import { Seller } from '@/types';

export interface SellerApplicationData {
    storeName: string;
    description: string;
    businessDetails: {
        gstNumber?: string;
        pan: string;
        address: string;
    };
    bankDetails: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    };
}

export const sellerService = {
    apply: async (data: SellerApplicationData): Promise<{ success: boolean; data: Seller }> => {
        const response = await api.post('/sellers/apply', data);
        return response.data.data || response.data;
    },

    getProfile: async (): Promise<{ success: boolean; data: Seller }> => {
        const response = await api.get('/sellers/me');
        return response.data.data || response.data;
    },

    getMySellerProfile: async (): Promise<{ success: boolean; data: Seller }> => {
        const response = await api.get('/sellers/me');
        return response.data.data || response.data;
    },
};
