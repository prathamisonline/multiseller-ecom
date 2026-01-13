'use client';

import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.1),transparent_50%)]" />
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                    The Hub for <span className="text-indigo-500">Premium</span> Products
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
                    Discover a curated selection of high-end electronics, fashion, and lifestyle essentials from top-rated sellers across India.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link href="/products">
                        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Shop Now
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button size="lg" variant="outline" className="border-slate-800 h-12 px-8 hover:bg-slate-900">
                            Become a Seller
                            <ArrowRight className="ml-2 h-5 w-5 text-indigo-500" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
