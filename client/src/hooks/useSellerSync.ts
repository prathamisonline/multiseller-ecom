'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { sellerService } from '@/services/seller.service';

/**
 * Hook to fetch and sync seller profile status
 * Call this in the root layout to keep seller status in sync
 */
export function useSellerSync() {
    const { isAuthenticated } = useAuthStore();
    const { setSellerProfile, clearSellerProfile } = useSellerStore();

    useEffect(() => {
        const fetchSellerProfile = async () => {
            if (!isAuthenticated) {
                clearSellerProfile();
                return;
            }

            try {
                const response = await sellerService.getProfile();
                if (response.success && response.data) {
                    setSellerProfile(response.data);
                } else {
                    clearSellerProfile();
                }
            } catch (error: any) {
                // If 404, user doesn't have a seller profile
                if (error.response?.status === 404) {
                    clearSellerProfile();
                } else {
                    console.error('Error fetching seller profile:', error);
                }
            }
        };

        fetchSellerProfile();
    }, [isAuthenticated, setSellerProfile, clearSellerProfile]);
}
