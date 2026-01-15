'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Building2,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { sellerService } from '@/services/seller.service';
import { useSellerStore } from '@/store/sellerStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const onboardingSchema = z.object({
    // Step 1: Store Details
    storeName: z.string().min(3, 'Store name must be at least 3 characters'),
    description: z.string().min(20, 'Please provide a more detailed description (min 20 chars)'),

    // Step 2: Business Details
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format (e.g. ABCDE1234F)'),
    gstNumber: z.string().optional().or(z.literal('')),
    address: z.string().min(10, 'Full business address is required'),

    // Step 3: Bank Details
    accountNumber: z.string().min(9, 'Invalid account number').max(18, 'Invalid account number'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0001234)'),
    bankName: z.string().min(3, 'Bank name is required'),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const STEPS = [
    { id: 1, title: 'Store', icon: Store, description: 'Basic info about your shop' },
    { id: 2, title: 'Business', icon: Building2, description: 'Verify your business identity' },
    { id: 3, title: 'Bank', icon: CreditCard, description: 'Where you will receive payments' },
];

export default function OnboardingForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { setSellerProfile } = useSellerStore();

    const form = useForm<OnboardingValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            storeName: '',
            description: '',
            pan: '',
            gstNumber: '',
            address: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
        },
        mode: 'onBlur',
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof OnboardingValues)[] = [];
        if (currentStep === 1) fieldsToValidate = ['storeName', 'description'];
        if (currentStep === 2) fieldsToValidate = ['pan', 'address', 'gstNumber'];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const onSubmit = async (values: OnboardingValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                storeName: values.storeName,
                description: values.description,
                businessDetails: {
                    pan: values.pan.toUpperCase(),
                    gstNumber: values.gstNumber || undefined,
                    address: values.address,
                },
                bankDetails: {
                    accountNumber: values.accountNumber,
                    ifscCode: values.ifscCode.toUpperCase(),
                    bankName: values.bankName,
                },
            };

            const response = await sellerService.apply(payload);

            // Update seller store with the new profile
            if (response.success && response.data) {
                setSellerProfile(response.data);
            }

            toast.success('Application submitted successfully! Our team will review it.');
            router.push('/seller/pending');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-12">
                <div className="flex justify-between items-start">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative">
                                <div className={`
                  z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                  ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-900 text-slate-500 border border-slate-800'}
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                `}>
                                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>

                                <div className="mt-4 text-center">
                                    <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-1 hidden sm:block">{step.description}</p>
                                </div>

                                {idx !== STEPS.length - 1 && (
                                    <div className={`
                    absolute top-6 left-[60%] w-[80%] h-[2px] -z-0
                    ${isActive ? 'bg-indigo-600/50' : 'bg-slate-800'}
                  `} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 mb-6">
                                    <h2 className="text-2xl font-bold text-white">Let's build your brand</h2>
                                    <p className="text-slate-400">Your store info will be visible to all customers on the marketplace.</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="storeName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Store Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Aura Premium Collection" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl" />
                                            </FormControl>
                                            <FormDescription className="text-slate-500">Must be unique across the platform</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Store Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell customers about what you sell, your brand values, and why they should choose you..."
                                                    className="min-h-[150px] bg-slate-950 border-slate-800 rounded-xl resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 mb-6">
                                    <h2 className="text-2xl font-bold text-white">Business Verification</h2>
                                    <p className="text-slate-400">Required for legal and taxation purposes.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="pan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">PAN Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ABCDE1234F" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl uppercase" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gstNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel className="text-slate-300">GST Number (Optional)</FormLabel>
                                                    <Info className="w-3 h-3 text-slate-500" />
                                                </div>
                                                <FormControl>
                                                    <Input placeholder="22AAAAA0000A1Z5" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl uppercase" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Business Address</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Full registered address as per records..."
                                                    className="min-h-[100px] bg-slate-950 border-slate-800 rounded-xl resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 mb-6">
                                    <h2 className="text-2xl font-bold text-white">Payout Settings</h2>
                                    <p className="text-slate-400">Earnings will be transferred to this account.</p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="bankName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Bank Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="HDFC Bank" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Account Number" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ifscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-300">IFSC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="HDFC0001234" {...field} className="h-14 bg-slate-950 border-slate-800 rounded-xl uppercase" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex gap-4">
                                    <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        By submitting, you agree to our Seller Terms and Conditions. We use manual verification to ensure platform quality. Review usually takes 24-48 hours.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-4">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-14 border-slate-800 hover:bg-slate-900 border-2"
                                onClick={prevStep}
                                disabled={isSubmitting}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" />
                                Back
                            </Button>
                        )}

                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 font-bold"
                                onClick={nextStep}
                            >
                                Next Step
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="flex-1 h-14 bg-green-600 hover:bg-green-700 font-bold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Complete Application
                                        <Check className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}

// Add simple helper icons that were used but not imported
function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
