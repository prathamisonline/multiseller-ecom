'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { sellerOrderService } from '@/services/sellerOrder.service';
import { exportService } from '@/services/export.service';
import {
    ShoppingBag,
    User,
    MapPin,
    CreditCard,
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    ShieldCheck,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';

const workflowSteps = [
    { status: 'paid', label: 'Paid', icon: CreditCard, next: 'processing', nextLabel: 'Start Processing' },
    { status: 'processing', label: 'Processing', icon: Package, next: 'shipped', nextLabel: 'Mark as Shipped' },
    { status: 'shipped', label: 'Shipped', icon: Truck, next: null, nextLabel: 'Awaiting Delivery' },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2, next: null, nextLabel: 'Complete' },
];

export default function SellerOrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['seller-order', id],
        queryFn: () => sellerOrderService.getOrderById(id as string),
    });

    const mutation = useMutation({
        mutationFn: ({ status, note }: { status: string, note?: string }) =>
            sellerOrderService.updateStatus(id as string, status, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-order', id] });
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
            toast.success('Order status updated');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium tracking-tight">Accessing fulfillment details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Order not found</h2>
                <Button onClick={() => router.push('/seller/orders')} className="mt-6">Back to Dashboard</Button>
            </div>
        );
    }

    const order = data.data;
    const currentStep = workflowSteps.find(s => s.status === order.status) || workflowSteps[0];
    const nextStep = workflowSteps.find(s => s.status === currentStep.next);

    const handleStatusUpdate = async (status: string) => {
        setIsUpdating(true);
        try {
            await mutation.mutateAsync({ status });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownloadLabel = async () => {
        setIsDownloadingLabel(true);
        try {
            await exportService.downloadShippingLabel(id as string);
            toast.success('Label generated successfully');
        } catch (error) {
            toast.error('Failed to generate shipping label');
        } finally {
            setIsDownloadingLabel(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <Button
                variant="ghost"
                onClick={() => router.push('/seller/orders')}
                className="mb-8 text-slate-400 hover:text-white -ml-4"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Orders
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-extrabold text-white">Fulfillment Details</h1>
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20 uppercase text-[10px] tracking-widest px-2 h-6 font-black">
                            #{order.id.slice(-8).toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-slate-400">
                        Order received on {format(new Date(order.createdAt), 'PPPP · hh:mm a')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-800 hover:bg-slate-900 h-12 px-6">
                        <FileText className="mr-2 h-4 w-4" />
                        Pick List
                    </Button>
                    <Button
                        onClick={handleDownloadLabel}
                        disabled={isDownloadingLabel}
                        variant="outline"
                        className="border-slate-800 hover:bg-slate-900 h-12 px-6"
                    >
                        {isDownloadingLabel ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                        Shipping Label
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Timeline / Action Card */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4">
                            <Badge variant="outline" className="bg-indigo-600/5 border-indigo-500/20 text-indigo-400">Current: {order.status}</Badge>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-10 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            Workflow Progression
                        </h2>

                        <div className="relative flex justify-between mb-12">
                            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 -z-0" />
                            {workflowSteps.map((step, idx) => {
                                const Icon = step.icon;
                                const isActive = workflowSteps.findIndex(s => s.status === order.status) >= idx;
                                return (
                                    <div key={step.status} className="flex flex-col items-center flex-1 z-10">
                                        <div className={`
                         w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                         ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-900 border-slate-800 text-slate-600'}
                      `}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {nextStep && (
                            <div className="p-6 rounded-2xl bg-indigo-600 border border-indigo-400 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-600/20">
                                <div className="text-center sm:text-left">
                                    <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">Recommended Action</p>
                                    <h3 className="text-xl font-black text-white">{nextStep.nextLabel}</h3>
                                </div>
                                <Button
                                    onClick={() => handleStatusUpdate(nextStep.status)}
                                    disabled={isUpdating}
                                    className="bg-white text-indigo-600 hover:bg-slate-50 h-14 px-8 font-black text-lg active:scale-95 transition-all shadow-xl"
                                >
                                    {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                                    Move to {nextStep.label}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Ordered Items */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Package Manifest</h2>
                            <Badge variant="outline" className="border-slate-800 text-slate-400">{order.items.length} Products</Badge>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="p-8 flex gap-6 items-center group">
                                    <div className="h-24 w-24 relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                                        <img src={item.product.images?.[0]} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">SKU: {item.product.id.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <h3 className="text-xl font-bold text-white truncate mb-2">{item.product.name}</h3>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Quantity</span>
                                                <span className="text-white font-black text-lg">x {item.quantity}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">Unit Price</span>
                                                <span className="text-white font-medium">₹{item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter mb-1">Merchant Total</p>
                                        <p className="text-2xl font-black text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Client & Payment Info */}
                <div className="space-y-6">
                    <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" />
                                Customer Identity
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500 font-black text-xl">
                                    {order.shippingAddress.fullName[0]}
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg leading-tight">{order.shippingAddress.fullName}</p>
                                    <p className="text-slate-500 text-sm">Registered buyer</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                                    <MapPin className="w-4 h-4 text-slate-600" />
                                    <div className="text-sm">
                                        <p className="text-slate-300 font-medium">{order.shippingAddress.addressLine}</p>
                                        <p className="text-slate-500 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                                    <Clock className="w-4 h-4 text-slate-600" />
                                    <div className="text-sm">
                                        <p className="text-slate-300 font-medium">Preferred Contact</p>
                                        <p className="text-slate-500 text-xs">{order.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-800" />

                        <div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5" />
                                Transaction Verification
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Payment Status</span>
                                    <Badge variant="outline" className={`
                    capitalize border-0 h-6 px-3 text-[10px] font-black tracking-widest
                    ${order.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}
                  `}>
                                        {order.paymentStatus}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Internal Reference</span>
                                    <span className="text-white text-xs font-mono">#{order.id.slice(0, 12)}</span>
                                </div>
                                <Separator className="bg-slate-800/50" />
                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="font-bold text-white">Merchant Earning</span>
                                    <span className="text-3xl font-black text-indigo-500">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/50 flex gap-4">
                            <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0 mt-1" />
                            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
                                Payment is held in escrow. Payouts are triggered 7 days after 'Delivered' status to account for return policy.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
