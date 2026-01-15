'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);

    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            router.push('/login');
            return;
        }

        setIsAdding(true);
        try {
            await addItem(product.id, 1);
            toast.success(`${product.name} added to cart!`);
        } catch (err) {
            toast.error('Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-indigo-500/50"
        >
            <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        No Image
                    </div>
                )}

                {discount > 0 && (
                    <Badge className="absolute left-3 top-3 bg-indigo-600 text-white border-0">
                        {discount}% OFF
                    </Badge>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-3">
                    <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-200 rounded-full h-10 w-10 p-0">
                            <Eye className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Button
                        size="sm"
                        className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-full h-10 w-10 p-0"
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock === 0}
                    >
                        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                    </Button>
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">{product.category}</span>
                    <span className={`text-xs ${product.stock > 0 ? 'text-muted-foreground' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                </div>

                <Link href={`/products/${product.id}`} className="group-hover:text-indigo-400 transition-colors">
                    <h3 className="line-clamp-1 font-semibold text-foreground">{product.name}</h3>
                </Link>

                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                    {product.mrp > product.price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toLocaleString()}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
