'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import {
    Package,
    ChevronRight,
    ShoppingBag,
    Clock,
    CheckCircle2,
    XCircle,
    Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

const statusConfig = {
    pending: { label: 'Pending', icon: <Clock className="w-3 h-3" />, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    paid: { label: 'Paid', icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    processing: { label: 'Processing', icon: <Package className="w-3 h-3" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { label: 'Shipped', icon: <Truck className="w-3 h-3" />, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    delivered: { label: 'Delivered', icon: <CheckCircle2 className="w-3 h-3" />, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    cancelled: { label: 'Cancelled', icon: <XCircle className="w-3 h-3" />, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function OrderHistoryPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => orderService.getMyOrders(),
    });

    const orders = data?.data || [];

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="h-8 w-48 bg-slate-900 rounded mb-8 animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">My Orders</h1>
                    <p className="text-slate-400">Track and manage your recent purchases.</p>
                </div>
                <Link href="/products">
                    <Button variant="outline" className="border-slate-800 hover:bg-slate-900">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Button>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20">
                    <div className="rounded-full bg-slate-900 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">No orders yet</h2>
                    <p className="text-slate-500 mb-6">Looks like you haven&apos;t made any purchases yet.</p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

                        return (
                            <div
                                key={order.id}
                                className="group p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                                            {order.items[0]?.product?.images?.[0] ? (
                                                <img src={order.items[0].product.images[0]} alt="" className="object-cover" />
                                            ) : (
                                                <Package className="h-8 w-8 text-slate-700" />
                                            )}
                                            {order.items.length > 1 && (
                                                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-xs font-bold text-white">
                                                    +{order.items.length - 1}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                                                Order #{order.id.slice(-6).toUpperCase()}
                                            </p>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                {order.items.length === 1
                                                    ? order.items[0].product.name
                                                    : `${order.items[0].product.name} & ${order.items.length - 1} more`}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter mb-1">Amount</p>
                                            <p className="text-lg font-black text-white">₹{order.totalAmount.toLocaleString()}</p>
                                        </div>

                                        <div>
                                            <Badge className={`${config.color} flex items-center gap-1.5 py-1.5 px-3 border`}>
                                                {config.icon}
                                                {config.label}
                                            </Badge>
                                        </div>

                                        <Link href={`/account/orders/${order.id}`}>
                                            <Button variant="ghost" className="h-12 px-5 hover:bg-slate-800 text-slate-300 hover:text-white group/btn">
                                                Details
                                                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
