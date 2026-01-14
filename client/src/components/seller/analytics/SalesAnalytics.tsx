'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Clock,
    CalendarDays,
    Target,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useState } from 'react';

export default function SalesAnalytics() {
    const [days, setDays] = useState('7');

    const { data: overview, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['seller-overview'],
        queryFn: analyticsService.getSellerOverview,
    });

    const { data: revenue, isLoading: isRevenueLoading } = useQuery({
        queryKey: ['seller-revenue', days],
        queryFn: () => analyticsService.getSellerRevenue(parseInt(days)),
    });

    const { data: topProducts, isLoading: isTopProdLoading } = useQuery({
        queryKey: ['seller-top-products'],
        queryFn: () => analyticsService.getSellerTopProducts(5),
    });

    if (isOverviewLoading || isRevenueLoading || isTopProdLoading) {
        return (
            <div className="flex h-[600px] items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium tracking-tight">Crunching your sales data...</p>
                </div>
            </div>
        );
    }

    const revenueData = revenue?.data || [];
    const topProductsData = topProducts?.data || [];
    const stats = overview?.data;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-widest">{label}</p>
                    <div className="space-y-1">
                        <p className="text-lg font-black text-white">₹{payload[0].value.toLocaleString()}</p>
                        {payload[1] && <p className="text-xs text-indigo-400 font-bold">{payload[1].value} Orders</p>}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header with Period Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Sales Analysis</h1>
                    <p className="text-slate-400 mt-1">Detailed breakdown of your store&apos;s financial performance.</p>
                </div>
                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                    <Button
                        variant={days === '7' ? 'secondary' : 'ghost'}
                        onClick={() => setDays('7')}
                        className="h-10 rounded-xl px-6 font-bold"
                    >
                        7D
                    </Button>
                    <Button
                        variant={days === '30' ? 'secondary' : 'ghost'}
                        onClick={() => setDays('30')}
                        className="h-10 rounded-xl px-6 font-bold"
                    >
                        1M
                    </Button>
                    <Button
                        variant={days === '90' ? 'secondary' : 'ghost'}
                        onClick={() => setDays('90')}
                        className="h-10 rounded-xl px-6 font-bold"
                    >
                        3M
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16 text-indigo-500" />
                    </div>
                    <CardHeader>
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-500">Total Store Revenue</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">₹{stats?.totalRevenue.toLocaleString()}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            <span>+18.4% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag className="w-16 h-16 text-emerald-500" />
                    </div>
                    <CardHeader>
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-500">Orders Processed</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">{stats?.totalOrders}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                            <CalendarDays className="w-4 h-4" />
                            <span>{stats?.pendingOrders} orders awaiting fulfillment</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="w-16 h-16 text-amber-500" />
                    </div>
                    <CardHeader>
                        <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-500">Live Inventory</CardDescription>
                        <CardTitle className="text-3xl font-black text-white">{stats?.totalProducts}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{stats?.pendingProducts} items pending approval</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Revenue Chart */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden p-8">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Revenue Trajectory
                        </h3>
                        <p className="text-sm text-slate-500">Daily revenue and transaction volume distribution.</p>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Products Bar Chart */}
                <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden p-8 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                            Top Performing Items
                        </h3>
                        <p className="text-sm text-slate-500">Most popular products by sales quantity.</p>
                    </div>

                    <div className="flex-1 min-h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={topProductsData}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="productName"
                                    type="category"
                                    stroke="#64748b"
                                    fontSize={10}
                                    width={100}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
                                                    <p className="text-xs font-bold text-white">{payload[0].value} sold</p>
                                                    <p className="text-[10px] text-indigo-400 font-bold mt-1">₹{payload[0].payload.totalRevenue.toLocaleString()}</p>
                                                </div>
                                            )
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="totalQuantity" radius={[0, 8, 8, 0]}>
                                    {topProductsData.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#1e293b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">High Velocity</span>
                        <span className="text-emerald-500 font-black">+12% this week</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
