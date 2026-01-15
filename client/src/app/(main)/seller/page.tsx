'use client';

import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import {
    BarChart3,
    Package,
    ShoppingBag,
    Settings,
    Plus,
    ArrowUpRight,
    TrendingUp,
    Users,
    Wallet,
    Loader2,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SellerDashboard() {
    const { user, logoutSeller } = useAuthStore();

    const { data: overview, isLoading } = useQuery({
        queryKey: ['seller-overview'],
        queryFn: analyticsService.getSellerOverview,
    });

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${overview?.data?.totalRevenue?.toLocaleString() || '0'}`,
            icon: Wallet,
            color: 'text-green-500',
            trend: '+12.5%'
        },
        {
            label: 'Active Orders',
            value: overview?.data?.totalOrders?.toString() || '0',
            icon: ShoppingBag,
            color: 'text-indigo-500',
            trend: overview?.data?.pendingOrders ? `+${overview?.data?.pendingOrders}` : '0'
        },
        {
            label: 'Total Products',
            value: overview?.data?.totalProducts?.toString() || '0',
            icon: Package,
            color: 'text-amber-500',
            trend: overview?.data?.pendingProducts ? `${overview?.data?.pendingProducts} pending` : 'All live'
        },
        {
            label: 'Approved Products',
            value: overview?.data?.approvedProducts?.toString() || '0',
            icon: Package,
            color: 'text-blue-500',
            trend: 'Verified'
        },
    ];

    const hasNoProducts = overview?.data?.totalProducts === 0;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <p className="text-indigo-500 font-bold uppercase tracking-[0.2em] text-xs mb-2">Control Center</p>
                    <h1 className="text-4xl font-extrabold text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
                </motion.div>

                <div className="flex gap-4">
                    <Link href="/seller/products/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/20">
                            <Plus className="mr-2 h-4 w-4" />
                            New Product
                        </Button>
                    </Link>
                    <Link href="/seller/settings">
                        <Button variant="outline" className="border-slate-800 hover:bg-slate-900">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </Link>
                    <Button
                        onClick={logoutSeller}
                        variant="outline"
                        className="border-red-900/50 hover:bg-red-950/50 hover:border-red-800 text-red-400 hover:text-red-300"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-xl bg-slate-950/50 border border-slate-800 ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-black text-white mt-1 uppercase">{stat.value}</h3>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Actions Area */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/seller/products" className="group">
                        <div className="h-full p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 transition-all hover:bg-indigo-600/20 hover:border-indigo-500/40 relative overflow-hidden">
                            <Package className="h-12 w-12 text-indigo-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Manage Products</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Update stock levels, modify prices, and bulk edit your active product listings.
                            </p>
                            <ArrowUpRight className="absolute top-8 right-8 h-6 w-6 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>

                    <Link href="/seller/orders" className="group">
                        <div className="h-full p-8 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 transition-all hover:bg-emerald-600/20 hover:border-emerald-500/40 relative overflow-hidden">
                            <ShoppingBag className="h-12 w-12 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Order Fulfillment</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Process pending orders, print shipping labels, and track deliveries in real-time.
                            </p>
                            <ArrowUpRight className="absolute top-8 right-8 h-6 w-6 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>

                    <Link href="/seller/analytics" className="group">
                        <div className="h-full p-8 rounded-3xl bg-amber-600/10 border border-amber-500/20 transition-all hover:bg-amber-600/20 hover:border-amber-500/40 relative overflow-hidden">
                            <BarChart3 className="h-12 w-12 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Sales Analysis</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Deep dive into your sales patterns and customer demographics with Recharts-driven insights.
                            </p>
                            <ArrowUpRight className="absolute top-8 right-8 h-6 w-6 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </Link>

                    <div className="h-full p-8 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center">
                        <TrendingUp className="h-10 w-10 text-slate-700 mb-4" />
                        <p className="text-slate-600 font-bold mb-1">More Features Soon</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-700">Ad campaigns • Coupons • SEO Tools</p>
                    </div>

                    {/* Getting Started Guide for New Sellers */}
                    {hasNoProducts && (
                        <div className="md:col-span-2 p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/20">
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                Getting Started Guide
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                                    <h4 className="font-bold text-white">Add Products</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Upload your first product with high-quality images and clear descriptions.</p>
                                    <Button variant="link" className="text-indigo-500 p-0 h-auto text-xs" asChild>
                                        <Link href="/seller/products/new">Add Product →</Link>
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm">2</div>
                                    <h4 className="font-bold text-white">Setup Profile</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Customize your store name, logo, and brand story to build customer trust.</p>
                                    <Button variant="link" className="text-slate-500 p-0 h-auto text-xs" asChild>
                                        <Link href="/seller/settings">Edit Profile →</Link>
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm">3</div>
                                    <h4 className="font-bold text-white">Manage Orders</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Once you receive orders, you'll process them here for fulfillment.</p>
                                    <Button variant="link" className="text-slate-500 p-0 h-auto text-xs disabled" asChild>
                                        <span className="opacity-50">Wait for sales →</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity / Sidebar info */}
                <div className="space-y-6">
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                        <h3 className="font-bold text-white mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium">New order received #ORD-8291</p>
                                        <p className="text-xs text-slate-500">Just now</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="link" className="text-indigo-500 p-0 mt-6 h-auto">View All Activity</Button>
                    </div>

                    <div className="p-8 rounded-3xl bg-indigo-600 border border-indigo-500 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-black text-white text-xl mb-2">Seller Pro Tips</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                                Uploading at least 4 high-quality images can increase your conversion rate by up to 2.4x.
                            </p>
                            <Button className="bg-white text-indigo-600 hover:bg-white/90 font-bold">
                                Learn More
                            </Button>
                        </div>
                        <Package className="absolute -bottom-6 -right-6 h-32 w-32 text-indigo-500/50 -rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
}
