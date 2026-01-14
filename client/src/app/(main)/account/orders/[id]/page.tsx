'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { orderService } from '@/services/order.service';
import {
    Package,
    MapPin,
    CreditCard,
    ChevronLeft,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';

const timelineSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'paid', label: 'Payment Confirmed', icon: CreditCard },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderService.getOrderById(id as string),
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-32 flex flex-col items-center">
                <Package className="h-12 w-12 text-slate-800 animate-bounce mb-4" />
                <p className="text-slate-500 font-medium">Fetching your order details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Order not found</h2>
                <Button onClick={() => router.push('/account/orders')} className="mt-6">Back to Orders</Button>
            </div>
        );
    }

    const order = data.data;
    const currentStatusIndex = timelineSteps.findIndex(step => step.status === order.status);

    // Custom logic for status index if it's 'cancelled'
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <Button
                variant="ghost"
                onClick={() => router.push('/account/orders')}
                className="mb-8 text-slate-400 hover:text-white -ml-4"
            >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to My Orders
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-extrabold text-white">Order Details</h1>
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-indigo-500/20 uppercase text-[10px] tracking-widest px-2">
                            #{order.id.slice(-8).toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-slate-400">
                        Placed on {format(new Date(order.createdAt), 'PPPP')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-800 hover:bg-slate-900 text-sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Invoice
                    </Button>
                    {!isCancelled && order.status !== 'delivered' && (
                        <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 text-sm">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tracking Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-indigo-500" />
                            Order Status
                        </h2>

                        {isCancelled ? (
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                                <div>
                                    <p className="font-bold text-white">This order was cancelled</p>
                                    <p className="text-sm text-slate-400">Total amount has been initiated for refund if paid.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800" />
                                <div
                                    className="absolute top-5 left-0 h-0.5 bg-indigo-500 transition-all duration-1000"
                                    style={{ width: `${(currentStatusIndex / (timelineSteps.length - 1)) * 100}%` }}
                                />

                                <div className="relative flex justify-between">
                                    {timelineSteps.map((step, idx) => {
                                        const Icon = step.icon;
                                        const isCompleted = idx <= currentStatusIndex;
                                        const isCurrent = idx === currentStatusIndex;

                                        return (
                                            <div key={step.status} className="flex flex-col items-center max-w-[80px]">
                                                <div className={`
                          z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors border-2
                          ${isCompleted
                                                        ? 'bg-indigo-600 border-indigo-400 text-white'
                                                        : 'bg-slate-900 border-slate-800 text-slate-600'}
                          ${isCurrent ? 'ring-4 ring-indigo-500/20' : ''}
                        `}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`
                          mt-4 text-[10px] font-bold uppercase tracking-wider text-center
                          ${isCompleted ? 'text-white' : 'text-slate-600'}
                        `}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Items Breakdown */}
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Order Items</h2>
                            <Badge variant="outline" className="border-slate-800 text-slate-400">{order.items.length} Items</Badge>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {order.items.map((item: any, idx) => (
                                <div key={idx} className="p-6 flex gap-4 sm:gap-6 items-center">
                                    <div className="h-20 w-20 relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                                        {item.product.images?.[0] ? (
                                            <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                        ) : (
                                            <Package className="w-8 h-8 m-auto text-slate-800" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-lg truncate mb-1">{item.product.name}</h3>
                                        <p className="text-sm text-slate-400 uppercase tracking-widest text-[10px]">{item.product.category}</p>
                                        <div className="mt-2 flex items-center gap-4 text-sm">
                                            <span className="text-slate-500">Qty: <span className="text-white font-medium">{item.quantity}</span></span>
                                            <span className="text-slate-500">Price: <span className="text-white font-medium">₹{item.price.toLocaleString()}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-lg font-black text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Column */}
                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
                        <section>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                Delivery Address
                            </h3>
                            <div className="text-sm">
                                <p className="text-white font-bold mb-1">{order.shippingAddress.fullName}</p>
                                <div className="text-slate-400 space-y-0.5">
                                    <p>{order.shippingAddress.addressLine}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p>{order.shippingAddress.postalCode}</p>
                                    <div className="pt-2 flex items-center gap-2">
                                        <span className="text-xs">Phone:</span>
                                        <span className="text-white font-medium">{order.shippingAddress.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Separator className="bg-slate-800" />

                        <section>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CreditCard className="w-3 h-3" />
                                Payment Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Payment Status</span>
                                    <Badge variant="outline" className={`
                    capitalize border-0 h-5 px-2
                    ${order.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}
                  `}>
                                        {order.paymentStatus}
                                    </Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="text-white">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Shipping</span>
                                    <span className="text-green-500 font-medium">Free</span>
                                </div>
                                <Separator className="bg-slate-800/50" />
                                <div className="flex justify-between items-baseline pt-1">
                                    <span className="font-bold text-white">Total Paid</span>
                                    <span className="text-2xl font-black text-indigo-500">₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </section>

                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 flex items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-indigo-500" />
                            <p className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider font-bold">
                                Consumer protection enabled for this order. 7-day easy returns apply.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
