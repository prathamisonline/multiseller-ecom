'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/seller/products/ProductForm';
import { productService } from '@/services/product.service';
import { Product } from '@/types';
import { toast } from 'sonner';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getSellerProductById(id as string);
                setProduct(response.data);
            } catch (error) {
                toast.error('Failed to fetch product details');
                router.push('/seller/products');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, router]);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            await productService.updateProduct(id as string, values);
            toast.success('Product updated successfully!');
            router.push('/seller/products');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500">Loading product information...</p>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="mb-12">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/seller/products')}
                    className="mb-4 text-slate-400 hover:text-white -ml-4"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Listings
                </Button>
                <h1 className="text-4xl font-extrabold text-white mb-2">Edit Product</h1>
                <div className="flex items-center gap-3">
                    <p className="text-slate-400">Updating details for <span className="text-indigo-400 font-bold">{product.name}</span></p>
                    <div className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${product.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                            product.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                        {product.status}
                    </div>
                </div>
            </div>

            <ProductForm
                initialData={product}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
