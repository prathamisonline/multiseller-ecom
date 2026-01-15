'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import {
    BarChart3,
    Users,
    Package,
    ShoppingBag,
    Clock,
    TrendingUp,
    ShieldCheck,
    AlertTriangle,
    ArrowUpRight,
    TrendingDown,
    Wallet,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminOverview() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-overview'],
        queryFn: analyticsService.getAdminOverview,
    });

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const overview = stats || {};

    const statCards = [
        { label: 'Total Revenue', value: `₹${(overview.revenue?.total || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-500', trend: '+12.5%' },
        { label: 'System Orders', value: overview.orders?.total || 0, icon: ShoppingBag, color: 'text-indigo-500', trend: overview.orders?.today ? `+${overview.orders.today}` : '0' },
        { label: 'Platform Users', value: overview.users?.total || 0, icon: Users, color: 'text-blue-500', trend: 'Healthy' },
        { label: 'Active Sellers', value: overview.sellers?.total || 0, icon: ShieldCheck, color: 'text-amber-500', trend: overview.sellers?.pending ? `${overview.sellers.pending} pending` : 'Verified' },
    ];

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-indigo-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Platform Integrity</p>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Command Center</h1>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-400">System Monitoring: <span className="text-white uppercase">Operational</span></p>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest relative z-10">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white mt-1 relative z-10 tracking-tight">{stat.value}</h3>
                        <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <stat.icon className="h-24 w-24" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Urgent Governance Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden group hover:border-amber-500/40 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 uppercase text-[10px] font-black">Requires Action</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black text-white mt-4">Merchant Queue</CardTitle>
                                <CardDescription>Verify identities and business credentials.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-white">{overview.sellers?.pending || 0}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Pending Applications</p>
                                    </div>
                                    <Link href="/admin/sellers">
                                        <Button className="bg-white text-black hover:bg-slate-200 font-bold px-6 h-12">
                                            Review Queue
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/40 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 uppercase text-[10px] font-black">Safety Audit</Badge>
                                </div>
                                <CardTitle className="text-2xl font-black text-white mt-4">Product Audit</CardTitle>
                                <CardDescription>Verify listings for platform compliance.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-4xl font-black text-white">{overview.products?.pending || 0}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Awaiting Verification</p>
                                    </div>
                                    <Link href="/admin/products">
                                        <Button variant="secondary" className="font-bold px-6 h-12">
                                            Audit Now
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Graph Placeholder */}
                    <div className="p-10 rounded-3xl bg-slate-900/20 border border-slate-800 border-dashed flex flex-col items-center justify-center text-center min-h-[400px]">
                        <TrendingUp className="h-16 w-16 text-slate-800 mb-6" />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">Aggregated Ecosystem Intelligence</h3>
                        <p className="max-w-md text-slate-700 text-sm italic">
                            Cross-vendor revenue projections and fraud detection heatmaps are currently being serialized.
                            Full Recharts integration arriving in version 2.4.
                        </p>
                    </div>
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8">System Health</h3>
                        <div className="space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-white">Database Load</span>
                                    <span className="text-xs text-emerald-500 font-black">Optimal</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[12%] h-full bg-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-white">Verification Lag</span>
                                    <span className="text-xs text-amber-500 font-black">Under 2h</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[45%] h-full bg-amber-500" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold text-white">Seller Approval Rate</span>
                                    <span className="text-xs text-indigo-500 font-black">68%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[68%] h-full bg-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden group">
                        <div className="p-8 rounded-[22px] bg-slate-950 h-full">
                            <h3 className="text-xl font-black text-white mb-2 italic">Admin Pro Insight</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Verified sellers generate <span className="text-white font-bold underline decoration-indigo-500">4.2x more GMV</span> than unverified ones. Prioritize the Merchant Queue to maximize growth.
                            </p>
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-black h-12">
                                Review Merchant Guidelines
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
