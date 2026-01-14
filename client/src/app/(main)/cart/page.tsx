'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, totalAmount, totalQuantity, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    if (items.length === 0 && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center space-y-6">
                <div className="rounded-full bg-slate-900 p-10">
                    <ShoppingCart className="h-20 w-20 text-slate-700" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-white">Your cart is empty</h1>
                    <p className="text-slate-400 max-w-md">
                        Before you checkout, you must add some products to your shopping cart.
                        You will find a lot of interesting products on our \"Shop\" page.
                    </p>
                </div>
                <Link href="/products">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg font-bold">
                        Start Shopping
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart ({totalQuantity})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                        <div className="hidden sm:grid grid-cols-6 p-4 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/60 border-b border-slate-800">
                            <div className="col-span-3">Product</div>
                            <div className="text-center">Price</div>
                            <div className="text-center">Quantity</div>
                            <div className="text-right">Total</div>
                        </div>

                        <div className="divide-y divide-slate-800">
                            {items.map((item) => (
                                <div key={item.productId} className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-6 gap-6 items-center">
                                    <div className="col-span-1 sm:col-span-3 flex gap-4">
                                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-800">
                                            {item.product.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-600">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <Link
                                                href={`/products/${item.productId}`}
                                                className="text-lg font-bold text-white hover:text-indigo-400 transition-colors"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="text-sm text-slate-400">{item.product.category}</p>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-500 transition-colors w-fit"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-center hidden sm:block text-slate-300 font-medium">
                                        ₹{item.product.price.toLocaleString()}
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-900 h-10">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="px-3 h-full hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
                                                disabled={isLoading || item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="px-3 h-full hover:bg-slate-800 text-slate-400 hover:text-white"
                                                disabled={isLoading || item.quantity >= item.product.stock}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right sm:block hidden font-bold text-white text-lg">
                                        ₹{(item.product.price * item.quantity).toLocaleString()}
                                    </div>

                                    {/* Mobile price info */}
                                    <div className="flex sm:hidden justify-between items-center text-sm pt-2">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-bold text-white text-lg">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                        <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                            <ShieldCheck className="h-8 w-8 text-indigo-500 shrink-0" />
                            <div>
                                <p className="font-bold text-white text-sm">Secure Payment</p>
                                <p className="text-xs text-slate-500">100% secure payment methods</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                            <Truck className="h-8 w-8 text-indigo-500 shrink-0" />
                            <div>
                                <p className="font-bold text-white text-sm">Fast Shipping</p>
                                <p className="text-xs text-slate-500">Free shipping on all orders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                            <RefreshCcw className="h-8 w-8 text-indigo-500 shrink-0" />
                            <div>
                                <p className="font-bold text-white text-sm">Easy Returns</p>
                                <p className="text-xs text-slate-500">7-day easy return policy</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span className="text-white font-medium">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Shipping</span>
                                <span className="text-green-500 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Estimated Tax (GST)</span>
                                <span className="text-white font-medium">Included</span>
                            </div>

                            <Separator className="bg-slate-800" />

                            <div className="flex justify-between items-baseline pt-2">
                                <span className="text-lg font-bold text-white">Order Total</span>
                                <span className="text-3xl font-black text-indigo-500">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="pt-6">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold shadow-lg shadow-indigo-600/20"
                                    onClick={() => router.push('/checkout')}
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>

                            <Link href="/products" className="block text-center mt-4 text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
