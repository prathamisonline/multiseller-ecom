'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    Wallet,
    Loader2,
    Calendar,
    Filter,
    ArrowUpRight,
    Store,
    Package
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function PlatformAnalytics() {
    const [days, setDays] = useState(30);

    const { data: revenue, isLoading: revLoading } = useQuery({
        queryKey: ['admin-revenue', days],
        queryFn: () => analyticsService.getAdminRevenue('daily', days),
    });

    const { data: statusStats, isLoading: statusLoading } = useQuery({
        queryKey: ['admin-order-status'],
        queryFn: analyticsService.getAdminOrderStatus,
    });

    const { data: topSellers, isLoading: sellerLoading } = useQuery({
        queryKey: ['admin-top-sellers'],
        queryFn: () => analyticsService.getAdminTopSellers(5),
    });

    const { data: topProducts, isLoading: productLoading } = useQuery({
        queryKey: ['admin-top-products'],
        queryFn: () => analyticsService.getAdminTopProducts(5),
    });

    if (revLoading || statusLoading || sellerLoading || productLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Ecosystem Data...</p>
            </div>
        );
    }

    const chartData = revenue?.data?.data || [];

    const pieData = Object.entries(statusStats?.data || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    const sellerData = topSellers?.data || [];
    const productData = topProducts?.data || [];

    return (
        <div className="space-y-10">
            {/* Date Filter & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter">Market Intelligence</h2>
                    <p className="text-slate-500 text-sm">Real-time visualization of platform-wide liquidity and growth.</p>
                </div>

                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-sm">
                    {[7, 30, 90].map(d => (
                        <Button
                            key={d}
                            variant={days === d ? 'secondary' : 'ghost'}
                            onClick={() => setDays(d)}
                            className="h-10 rounded-xl px-6 font-bold"
                        >
                            {d}{d === 30 ? ' Days' : d === 7 ? 'D' : 'D'}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main Revenue Chart */}
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                                <TrendingUp className="text-indigo-500" />
                                Revenue Trajectory
                            </CardTitle>
                            <CardDescription>Aggregate platform earnings across all verified vendors.</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Period Revenue</p>
                            <p className="text-2xl font-black text-indigo-500">₹{chartData.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toLocaleString()}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Status Distribution */}
                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                            <ShoppingBag className="text-emerald-500" />
                            Fulfillment Health
                        </CardTitle>
                        <CardDescription>Distribution of platform orders by current shipment status.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Sellers Bar Chart */}
                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                            <Store className="text-amber-500" />
                            Vendor Dominance
                        </CardTitle>
                        <CardDescription>Highest grossing merchants on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sellerData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="storeName"
                                        type="category"
                                        stroke="#64748b"
                                        fontSize={10}
                                        fontWeight="bold"
                                        width={100}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="totalRevenue" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products Table/List */}
            <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-800/50">
                    <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                        <Package className="text-indigo-500" />
                        High Velocity Inventory
                    </CardTitle>
                    <CardDescription>Most popular items based on platform-wide sales volume.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-950/50">
                                    <th className="text-left p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Product Detail</th>
                                    <th className="text-center p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Units Sold</th>
                                    <th className="text-right p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Gross Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {productData.map((prod: any, idx: number) => (
                                    <tr key={idx} className="group hover:bg-slate-900/40 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                                                    <img src={prod.productImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{prod.productName}</p>
                                                    <p className="text-xs text-slate-500 uppercase font-black tracking-tighter">Velocity Rank #{idx + 1}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20 font-black px-3 py-1">
                                                {prod.totalQuantity} Sold
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right">
                                            <p className="text-lg font-black text-white">₹{prod.totalRevenue.toLocaleString()}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
