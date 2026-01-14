'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { User, LogOut, Store, Package } from 'lucide-react';
import CartDrawer from './CartDrawer';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Store className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Shoplivedeals</span>
                </Link>

                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
                    <Link href="/products" className="hover:text-indigo-400 transition-colors">
                        Shop
                    </Link>
                    <Link href="/categories" className="hover:text-indigo-400 transition-colors">
                        Categories
                    </Link>
                    {isAuthenticated && user?.role === 'user' && (
                        <Link href="/seller/onboarding" className="hover:text-amber-400 transition-colors text-amber-500 font-bold">
                            Become a Seller
                        </Link>
                    )}
                    {user?.role === 'seller' && (
                        <Link href="/seller" className="hover:text-indigo-400 transition-colors text-indigo-400">
                            Seller Panel
                        </Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link href="/admin" className="hover:text-indigo-400 transition-colors text-indigo-400">
                            Admin Panel
                        </Link>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <CartDrawer />

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            <Link href="/account/orders">
                                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hidden lg:flex">
                                    <Package className="mr-2 h-4 w-4" />
                                    Orders
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                className="text-slate-300 hover:text-red-400"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link href="/login">
                                <Button variant="ghost" className="text-slate-300 hover:text-white">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
