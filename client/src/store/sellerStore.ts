import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SellerProfile {
    _id: string;
    user: string;
    storeName: string;
    slug: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    businessDetails: {
        pan: string;
        gstNumber?: string;
        address: string;
    };
    bankDetails?: {
        accountNumber: string;
        ifscCode: string;
        bankName: string;
    };
    commissionRate: number;
    adminRemarks?: string;
    createdAt: string;
    updatedAt: string;
}

interface SellerState {
    sellerProfile: SellerProfile | null;
    hasSeller: boolean;
    isSellerApproved: boolean;
    sellerStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended';
    setSellerProfile: (profile: SellerProfile | null) => void;
    clearSellerProfile: () => void;
}

export const useSellerStore = create<SellerState>()(
    persist(
        (set) => ({
            sellerProfile: null,
            hasSeller: false,
            isSellerApproved: false,
            sellerStatus: 'none',
            setSellerProfile: (profile) => {
                if (!profile) {
                    set({
                        sellerProfile: null,
                        hasSeller: false,
                        isSellerApproved: false,
                        sellerStatus: 'none',
                    });
                } else {
                    set({
                        sellerProfile: profile,
                        hasSeller: true,
                        isSellerApproved: profile.status === 'approved',
                        sellerStatus: profile.status,
                    });
                }
            },
            clearSellerProfile: () => {
                set({
                    sellerProfile: null,
                    hasSeller: false,
                    isSellerApproved: false,
                    sellerStatus: 'none',
                });
            },
        }),
        {
            name: 'seller-storage',
        }
    )
);
