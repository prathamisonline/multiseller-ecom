'use client';

import PlatformAnalytics from '@/components/admin/PlatformAnalytics';

export default function AdminAnalyticsPage() {
    return (
        <div className="space-y-12">
            <div className="mb-12">
                <p className="text-indigo-500 font-black uppercase tracking-[0.3em] text-xs mb-2">Platform Intelligence</p>
                <h1 className="text-5xl font-black text-white tracking-tighter">Ecosystem Analytics</h1>
                <p className="text-slate-400 mt-2 max-w-2xl">
                    Comprehensive cross-vendor visualization of platform growth, inventory consumption, and fulfillment efficiency.
                </p>
            </div>

            <PlatformAnalytics />
        </div>
    );
}
