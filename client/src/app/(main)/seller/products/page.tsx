'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Package,
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    FileSpreadsheet,
    Loader2
} from 'lucide-react';
import { exportService } from '@/services/export.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

const statusConfig = {
    approved: { label: 'Approved', icon: CheckCircle2, class: 'bg-green-500/10 text-green-500 border-green-500/20' },
    pending: { label: 'Pending', icon: Clock, class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    rejected: { label: 'Rejected', icon: XCircle, class: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function SellerProductsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportService.exportProducts();
            toast.success('Catalog exported successfully');
        } catch (error) {
            toast.error('Failed to export catalog');
        } finally {
            setIsExporting(false);
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ['my-products', statusFilter],
        queryFn: () => productService.getMyProducts({ status: statusFilter === 'all' ? undefined : statusFilter }),
    });

    const deleteMutation = useMutation({
        mutationFn: productService.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            toast.success('Product deleted');
        },
    });

    const products = data?.data?.products || [];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white mb-2">Inventory</h1>
                    <p className="text-slate-400">Manage your product catalog and inventory levels.</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        variant="outline"
                        className="border-slate-800 hover:bg-slate-900 h-12 px-6"
                    >
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                        Export Catalog
                    </Button>
                    <Link href="/seller/products/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 font-bold shadow-lg shadow-indigo-600/20">
                            <Plus className="mr-2 h-5 w-5" />
                            Add New Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search products..."
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
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-80 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/10">
                    <div className="rounded-full bg-slate-900 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">No products found</h2>
                    <p className="text-slate-500 mb-8">Ready to start selling? List your first product now.</p>
                    <Link href="/seller/products/new">
                        <Button variant="outline" className="border-slate-800 hover:bg-slate-900">
                            Create First Listing
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                        const config = statusConfig[product.status as keyof typeof statusConfig] || statusConfig.pending;
                        const Icon = config.icon;

                        return (
                            <div
                                key={product.id}
                                className="group relative rounded-3xl bg-slate-900/40 border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all hover:translate-y-[-4px]"
                            >
                                <div className="aspect-[4/5] relative overflow-hidden bg-slate-950">
                                    <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                    {/* Quick Status */}
                                    <div className="absolute top-4 left-4">
                                        <Badge className={`${config.class} border backdrop-blur-md flex items-center gap-1.5 py-1 px-3`}>
                                            <Icon className="w-3 h-3" />
                                            {config.label}
                                        </Badge>
                                    </div>

                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white hover:bg-white hover:text-black">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                                                <DropdownMenuItem asChild className="hover:bg-slate-800 cursor-pointer">
                                                    <Link href={`/seller/products/${product.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Product
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="hover:bg-slate-800 cursor-pointer text-indigo-400">
                                                    <Link href={`/products/${product.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" /> View in Shop
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-slate-800" />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this product?')) {
                                                            deleteMutation.mutate(product.id);
                                                        }
                                                    }}
                                                    className="text-red-400 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Listing
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-black mb-1">{product.category}</p>
                                    <h3 className="text-lg font-bold text-white truncate mb-4">{product.name}</h3>

                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter mb-0.5">Price</p>
                                            <p className="text-xl font-black text-white">₹{product.price.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter mb-0.5">Stock</p>
                                            <p className={`text-sm font-bold ${product.stock < 10 ? 'text-orange-500' : 'text-slate-200'}`}>
                                                {product.stock} units
                                            </p>
                                        </div>
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
