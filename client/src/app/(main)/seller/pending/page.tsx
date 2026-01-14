'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ApplicationPendingPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center mb-8"
            >
                <Clock className="w-12 h-12 text-indigo-500 animate-pulse" />
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl space-y-6"
            >
                <h1 className="text-4xl font-extrabold text-white">Application Under Review</h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                    Great job! Your seller application has been received. Our compliance team
                    manually reviews every application to maintain platform quality. This usually takes
                    <span className="text-white font-bold"> 24 to 48 hours</span>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-3">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            What's Next?
                        </h3>
                        <p className="text-sm text-slate-500">
                            We will verify your PAN, GST, and Bank details. Once approved, you'll receive an email with instructions to set up your store.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-3">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Mail className="w-4 h-4 text-indigo-500" />
                            Need Help?
                        </h3>
                        <p className="text-sm text-slate-500">
                            If you have any questions or need to update your info, reach out to our support team at <span className="text-indigo-400">sellers@shoplivedeals.com</span>
                        </p>
                    </div>
                </div>

                <div className="pt-12">
                    <Link href="/">
                        <Button variant="outline" className="border-slate-800 hover:bg-slate-900 h-12 px-8">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Marketplace
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
