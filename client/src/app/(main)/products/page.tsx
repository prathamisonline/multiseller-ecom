'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import ProductCard from '@/components/storefront/ProductCard';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProductsPage() {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', search, selectedCategory],
        queryFn: () => productService.getAll({ search, category: selectedCategory }),
    });

    const products = data?.products || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className="w-full md:w-64 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
                        <div className="space-y-2">
                            {['All', 'Electronics', 'Fashion', 'Home Decor', 'Gadgets'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${(cat === 'All' && !selectedCategory) || selectedCategory === cat
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Price Range</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input placeholder="Min" className="bg-slate-900 border-slate-800" />
                                <Input placeholder="Max" className="bg-slate-900 border-slate-800" />
                            </div>
                            <Button className="w-full bg-slate-800 hover:bg-slate-700">Apply</Button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 bg-slate-900 border-slate-800 text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Button variant="outline" className="border-slate-800 text-slate-300 md:hidden">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-red-400">
                            Error loading products. Please try again.
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            No products found matching your criteria.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
