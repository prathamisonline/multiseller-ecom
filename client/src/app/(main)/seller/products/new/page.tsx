'use client';

import ProductForm from '@/components/seller/products/ProductForm';
import { productService } from '@/services/product.service';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: any) => {
        setIsSubmitting(true);
        try {
            await productService.createProduct(values);
            toast.success('Product listed successfully!');
            router.push('/seller/products');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to list product');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <h1 className="text-4xl font-extrabold text-white mb-2">List New Product</h1>
                <p className="text-slate-400">Fill in the details below to add a new product to your store.</p>
            </div>

            <ProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
    );
}
