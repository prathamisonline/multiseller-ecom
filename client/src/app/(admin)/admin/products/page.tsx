'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Package,
    Image as ImageIcon,
    Tag,
    Layers,
    Eye,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

const statusConfig = {
    pending: { label: 'Pending Review', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    approved: { label: 'Active Listing', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    rejected: { label: 'Listing Rejected', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

import PageTransition from '@/components/shared/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProductsPage() {
    // ... existing hooks ...
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-products', statusFilter],
        queryFn: () => adminService.getAllProducts({ status: statusFilter === 'all' ? undefined : statusFilter }),
    });

    const approveMutation = useMutation({
        mutationFn: adminService.approveProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast.success('Product approved and live');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => adminService.rejectProduct(id, 'Information incomplete or invalid'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            toast.error('Product listing rejected');
        },
    });

    const products = data?.data?.products || [];
    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white">Product Audit</h1>
                    <p className="text-slate-400 mt-1">Monitor and approve new product listings across the platform.</p>
                </div>

                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
                    <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('pending')} className="h-10 rounded-xl px-4 font-bold">Pending Approval</Button>
                    <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('approved')} className="h-10 rounded-xl px-4 font-bold">Active</Button>
                    <Button variant={statusFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('all')} className="h-10 rounded-xl px-4 font-bold">All Listings</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search by product name..."
                    className="pl-11 h-14 bg-slate-900/50 border-slate-800 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-96 rounded-3xl" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                    <Package className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No products found for auditing</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredProducts.map((product: any) => {
                        const config = statusConfig[product.status as keyof typeof statusConfig];
                        const Icon = config.icon;

                        return (
                            <div key={product.id} className="group p-6 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row gap-6">
                                {/* Image Section */}
                                <div className="w-full sm:w-48 h-64 sm:h-full relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                                    <img src={product.images[0]} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[9px] font-black">{product.images.length} Photos</Badge>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-2">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">{product.category}</p>
                                            <Badge className={config.color + " border py-0.5 text-[9px] uppercase font-black"}>
                                                {config.label}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold text-white truncate mb-4">{product.name}</h3>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                                <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Price Point</p>
                                                <p className="text-lg font-black text-white">₹{product.price.toLocaleString()}</p>
                                            </div>
                                            <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                                <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Available Stock</p>
                                                <p className="text-lg font-black text-white">{product.stock} Units</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {product.attributes?.slice(0, 3).map((attr: any, idx: number) => (
                                                <div key={idx} className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium">
                                                    {attr.name}: <span className="text-white">{attr.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="flex gap-3 mt-8">
                                        {product.status === 'pending' ? (
                                            <>
                                                <Button
                                                    onClick={() => approveMutation.mutate(product.id)}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 font-black shadow-lg shadow-emerald-600/20"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => rejectMutation.mutate(product.id)}
                                                    variant="destructive"
                                                    className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border-red-500/20 h-12 font-bold"
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-900 h-12 flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> View Full Listing
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </PageTransition>
    );
}
