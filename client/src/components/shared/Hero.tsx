'use client';

import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative overflow-hidden py-20 md:py-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.1),transparent_50%)]" />
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                    The Hub for <span className="text-indigo-500">Premium</span> Products
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                    Discover a curated selection of high-end electronics, fashion, and lifestyle essentials from top-rated sellers across India.
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8" asChild>
                        <Link href="/products">
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Shop Now
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-border h-12 px-8 hover:bg-secondary" asChild>
                        <Link href="/seller/onboarding">
                            Become a Seller
                            <ArrowRight className="ml-2 h-5 w-5 text-indigo-500" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
