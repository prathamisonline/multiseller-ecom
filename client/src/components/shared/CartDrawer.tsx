'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function CartDrawer() {
    const { items, totalAmount, totalQuantity, fetchCart, updateQuantity, removeItem, isLoading } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated, fetchCart]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-300 hover:text-white">
                    <ShoppingCart className="h-5 w-5" />
                    {totalQuantity > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                            {totalQuantity}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col border-slate-800 bg-slate-950/95 p-0 text-white sm:max-w-md">
                <SheetHeader className="p-6">
                    <SheetTitle className="flex items-center gap-2 text-white">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart ({totalQuantity})
                    </SheetTitle>
                </SheetHeader>

                <Separator className="bg-slate-800" />

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-6">
                        <div className="rounded-full bg-slate-900 p-6">
                            <ShoppingCart className="h-12 w-12 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Your cart is empty</h3>
                        <p className="text-center text-sm text-slate-400">
                            Looks like you haven&apos;t added anything to your cart yet.
                        </p>
                        <SheetTrigger asChild>
                            <Link href="/products">
                                <Button className="bg-indigo-600 hover:bg-indigo-700">Start Shopping</Button>
                            </Link>
                        </SheetTrigger>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="space-y-6 py-6">
                                {items.map((item) => (
                                    <div key={item.productId} className="flex gap-4">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
                                            {item.product.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600 uppercase">No Img</div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <Link
                                                    href={`/products/${item.productId}`}
                                                    className="line-clamp-1 text-sm font-semibold text-white hover:text-indigo-400"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-xs text-slate-400 uppercase tracking-tighter">{item.product.category}</p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center rounded-md border border-slate-800 bg-slate-900 h-8">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        className="flex h-full w-8 items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        className="flex h-full w-8 items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                                        disabled={isLoading || item.quantity >= item.product.stock}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-white">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.productId)}
                                            className="h-fit rounded-md p-1.6 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <Separator className="bg-slate-800" />

                        <div className="space-y-4 p-6 bg-slate-900/40">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="font-medium text-white">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Shipping</span>
                                    <span className="text-green-500 font-medium">Free</span>
                                </div>
                                <Separator className="bg-slate-800 my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-indigo-500">₹{totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <SheetTrigger asChild>
                                <Link href="/checkout">
                                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold">
                                        Checkout
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                            </SheetTrigger>
                            <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest">
                                Secure SSL Encrypted Checkout
                            </p>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
