import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { cartService } from '@/services/cart.service';

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
    isLoading: boolean;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    setCart: (items: CartItem[], totalQuantity: number, totalAmount: number) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            totalQuantity: 0,
            totalAmount: 0,
            isLoading: false,

            setCart: (items, totalQuantity, totalAmount) => {
                set({ items, totalQuantity, totalAmount });
            },

            fetchCart: async () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) return;

                set({ isLoading: true });
                try {
                    const response = await cartService.getCart();
                    const { items, totalQuantity, totalAmount } = response.data;
                    set({ items, totalQuantity, totalAmount });
                } catch (error) {
                    console.error('Failed to fetch cart:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            addItem: async (productId, quantity = 1) => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                if (token) {
                    set({ isLoading: true });
                    try {
                        const response = await cartService.addToCart(productId, quantity);
                        const { items, totalQuantity, totalAmount } = response.data;
                        set({ items, totalQuantity, totalAmount });
                    } catch (error) {
                        console.error('Failed to add to cart:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                } else {
                    // Future guest logic can go here
                    console.warn('Guest cart not implemented yet - Redirecting to login might be better');
                }
            },

            updateQuantity: async (productId, quantity) => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                if (token) {
                    set({ isLoading: true });
                    try {
                        const response = await cartService.updateQuantity(productId, quantity);
                        const { items, totalQuantity, totalAmount } = response.data;
                        set({ items, totalQuantity, totalAmount });
                    } catch (error) {
                        console.error('Failed to update quantity:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                }
            },

            removeItem: async (productId) => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                if (token) {
                    set({ isLoading: true });
                    try {
                        const response = await cartService.removeItem(productId);
                        const { items, totalQuantity, totalAmount } = response.data;
                        set({ items, totalQuantity, totalAmount });
                    } catch (error) {
                        console.error('Failed to remove item:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                }
            },

            clearCart: async () => {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

                if (token) {
                    set({ isLoading: true });
                    try {
                        await cartService.clearCart();
                        set({ items: [], totalQuantity: 0, totalAmount: 0 });
                    } catch (error) {
                        console.error('Failed to clear cart:', error);
                    } finally {
                        set({ isLoading: false });
                    }
                }
            }
        }),
        {
            name: 'cart-storage',
            // Only persist basic info, fetch actual data from API on mount if logged in
            partialize: (state) => ({
                items: state.items,
                totalQuantity: state.totalQuantity,
                totalAmount: state.totalAmount
            }),
        }
    )
);
