import api from './api';
import { Address } from '@/types';

export const addressService = {
    getAddresses: async (): Promise<{ data: Address[] }> => {
        const response = await api.get('/addresses');
        return response.data;
    },

    getAddress: async (id: string): Promise<{ data: Address }> => {
        const response = await api.get(`/addresses/${id}`);
        return response.data;
    },

    addAddress: async (data: Omit<Address, '_id' | 'isDefault'>): Promise<{ data: Address }> => {
        const response = await api.post('/addresses', data);
        return response.data;
    },

    updateAddress: async (id: string, data: Partial<Address>): Promise<{ data: Address }> => {
        const response = await api.put(`/addresses/${id}`, data);
        return response.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await api.delete(`/addresses/${id}`);
    },

    setDefault: async (id: string): Promise<{ data: Address }> => {
        const response = await api.put(`/addresses/${id}/default`);
        return response.data;
    },
};
