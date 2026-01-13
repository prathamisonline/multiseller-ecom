'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { productService } from '@/services/product.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Zap, ShieldCheck, Truck, RefreshCcw, QrCode } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);

    const { data: productData, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getById(id as string),
    });

    const { data: qrData } = useQuery({
        queryKey: ['product-qr', id],
        queryFn: () => productService.getQrCode(id as string),
        enabled: !!productData,
    });

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (error || !productData) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-white">Product not found</h2>
                <p className="mt-4 text-slate-400">The product you are looking for does not exist or has been removed.</p>
            </div>
        );
    }

    const { product } = productData;

    const features = [
        { icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />, text: 'Genuine Product' },
        { icon: <Truck className="h-5 w-5 text-indigo-500" />, text: 'Fast Delivery' },
        { icon: <RefreshCcw className="h-5 w-5 text-indigo-500" />, text: '7 Days Return' },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="aspect-square relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-500">No Image</div>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.images?.slice(1).map((img, idx) => (
                            <div key={idx} className="aspect-square relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
                                <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20 mb-4">{product.category}</Badge>
                        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{product.name}</h1>
                        <div className="mt-6 flex items-baseline gap-4">
                            <span className="text-4xl font-black text-white">₹{product.price.toLocaleString()}</span>
                            {product.mrp > product.price && (
                                <>
                                    <span className="text-xl text-slate-500 line-through">₹{product.mrp.toLocaleString()}</span>
                                    <span className="text-lg font-bold text-green-500">
                                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-400 leading-relaxed text-lg">{product.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-slate-800">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                {f.icon}
                                <span className="text-sm font-medium text-slate-300">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden h-12">
                                <button
                                    className="px-4 py-2 hover:bg-slate-800 text-white transition-colors disabled:opacity-50"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="px-4 py-2 font-bold text-white">{quantity}</span>
                                <button
                                    className="px-4 py-2 hover:bg-slate-800 text-white transition-colors"
                                    onClick={() => setQuantity(q => q + 1)}
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                            <span className="text-sm text-slate-500">{product.stock} pieces available</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-14 text-lg">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="outline" className="flex-1 border-slate-800 hover:bg-slate-900 h-14 text-lg">
                                <Zap className="mr-2 h-5 w-5 text-indigo-500" />
                                Buy Now
                            </Button>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                        <div className="h-32 w-32 bg-white rounded-xl p-2 flex items-center justify-center">
                            {qrData?.qrCode ? (
                                <img src={qrData.qrCode} alt="Product QR Code" className="max-w-full max-h-full" />
                            ) : (
                                <QrCode className="h-10 w-10 text-slate-300" />
                            )}
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-lg font-bold text-white">Scan & Purchase</h3>
                            <p className="text-sm text-slate-400">Scan this QR code with your mobile to quickly access and buy this product on the go.</p>
                            <Button variant="link" className="text-indigo-400 p-0 h-auto">Download QR Code</Button>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Specifications</h3>
                        <div className="grid grid-cols-1 gap-1">
                            {product.attributes?.map((attr, idx) => (
                                <div key={idx} className="flex py-3 border-b border-slate-800 flex-wrap">
                                    <span className="w-full sm:w-1/3 text-slate-500 text-sm font-medium">{attr.name}</span>
                                    <span className="w-full sm:w-2/3 text-slate-200 text-sm">{attr.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
