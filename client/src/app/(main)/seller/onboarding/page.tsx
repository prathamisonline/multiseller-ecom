import OnboardingForm from '@/components/seller/OnboardingForm';
import { Store } from 'lucide-react';

export default function SellerOnboardingPage() {
    return (
        <div className="min-h-screen bg-slate-950 pt-20 pb-32">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold uppercase tracking-widest animate-fade-in">
                        <Store className="w-4 h-4" />
                        Seller Hub
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Start selling on <span className="text-indigo-500">Shoplivedeals</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Join thousands of successful sellers. Reach millions of customers
                        and grow your business with our powerful marketplace tools.
                    </p>
                </div>

                {/* Form Section */}
                <OnboardingForm />

                {/* Features Grid */}
                <div className="max-w-5xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Fast Onboarding</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Get your shop ready in minutes. Our streamlined process gets you from application to live in record time.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Secure Payouts</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Timely and direct bank settlements enabled by Razorpay. Focus on your growth while we handle the money.
                        </p>
                    </div>

                    <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white">Powerful Analytics</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Track your sales, customer behavior, and inventory with real-time dashboards designed for growth.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
