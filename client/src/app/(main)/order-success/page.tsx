'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CheckCircle2,
    ShoppingBag,
    ArrowRight,
    Package,
    Truck,
    Clock,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const router = useRouter();

    if (!orderId) {
        router.replace('/');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8"
            >
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4 max-w-lg"
            >
                <h1 className="text-4xl font-extrabold text-white">Order Confirmed!</h1>
                <p className="text-slate-400 text-lg">
                    Your payment was successful and your order is currently being processed.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">Order ID:</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{orderId}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-8 pb-12">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Processed</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Shipped</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Delivered</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        size="lg"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
                        onClick={() => router.push('/account/orders')}
                    >
                        Track Order
                        <Clock className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 border-slate-800 hover:bg-slate-900 h-12"
                        onClick={() => router.push('/products')}
                    >
                        Continue Shopping
                        <ShoppingBag className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <SuccessContent />
        </Suspense>
    );
}
