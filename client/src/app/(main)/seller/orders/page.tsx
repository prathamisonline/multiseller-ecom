'use client';

import { useQuery } from '@tanstack/react-query';
import { sellerOrderService } from '@/services/sellerOrder.service';
import {
    ShoppingBag,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    AlertCircle,
    MoreVertical,
    User,
    MapPin,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { exportService } from '@/services/export.service';
import { toast } from 'sonner';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    paid: { label: 'Paid', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    processing: { label: 'Processing', icon: Package, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    shipped: { label: 'Shipped', icon: Truck, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function SellerOrdersPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false); // Added state

    const { data, isLoading } = useQuery({
        queryKey: ['seller-orders', statusFilter],
        queryFn: () => sellerOrderService.getOrders({ status: statusFilter === 'all' ? undefined : statusFilter }),
    });

    // Added handleExport function
    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportService.exportOrders();
            toast.success('Orders exported successfully');
        } catch (error) {
            toast.error('Failed to export orders');
        } finally {
            setIsExporting(false);
        }
    };

    const orders = data?.data?.orders || [];

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">Order Management</h1>
                    <p className="text-slate-400">Track and fulfill orders for your products.</p>
                </div>
                <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    variant="outline"
                    className="border-slate-800 hover:bg-slate-900 h-12 px-6"
                >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Download Report
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by Order ID or Customer Name..."
                        className="pl-11 h-12 bg-slate-900/50 border-slate-800 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-12 bg-slate-900/50 border-slate-800 rounded-xl">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="paid">Paid (New)</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/10">
                    <div className="rounded-full bg-slate-900 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="h-8 w-8 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">No orders found</h2>
                    <p className="text-slate-500">Wait for new orders to appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                        const Icon = config.icon;

                        return (
                            <div
                                key={order.id}
                                className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Order ID & Customer */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="h-12 w-12 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-center text-indigo-500">
                                            <ShoppingBag className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">#{order.id.slice(-8).toUpperCase()}</span>
                                                <Badge className={`${config.color} border py-0 text-[10px] uppercase font-bold tracking-tight`}>
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-500" />
                                                {order.shippingAddress.fullName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {format(new Date(order.createdAt), 'MMM dd, yyyy · hh:mm a')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Info Snapshot */}
                                    <div className="hidden xl:block flex-1 border-x border-slate-800/50 px-8">
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Shipping Point</p>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-slate-600 mt-1 shrink-0" />
                                            <p className="text-sm text-slate-400 line-clamp-2">
                                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount & Actions */}
                                    <div className="flex items-center justify-between lg:justify-end gap-8">
                                        <div className="text-left lg:text-right">
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Earning Portion</p>
                                            <p className="text-2xl font-black text-white">₹{order.totalAmount.toLocaleString()}</p>
                                        </div>

                                        <Link href={`/seller/orders/${order.id}`}>
                                            <Button className="bg-slate-800 hover:bg-slate-700 text-white h-12 px-6 font-bold group/btn">
                                                Fulfill Order
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
