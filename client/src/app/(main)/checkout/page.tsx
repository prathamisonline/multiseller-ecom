'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { addressService } from '@/services/address.service';
import { cartService } from '@/services/cart.service';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Address } from '@/types';
import {
    ShieldCheck,
    MapPin,
    CreditCard,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useRazorpayScript } from '@/hooks/use-razorpay/use-razorpay-script';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { items, totalAmount, clearCart } = useCartStore();
    const isScriptLoaded = useRazorpayScript();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: addressData, isLoading: isLoadingAddresses } = useQuery({
        queryKey: ['addresses'],
        queryFn: addressService.getAddresses,
        enabled: isAuthenticated,
    });

    const addresses = addressData?.data || [];

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/checkout');
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            else setSelectedAddressId(addresses[0]._id);
        }
    }, [addresses, selectedAddressId]);

    if (items.length === 0 && !isProcessing) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
                <Button onClick={() => router.push('/products')}>Back to Shop</Button>
            </div>
        );
    }

    const handlePayment = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a shipping address');
            return;
        }

        if (!isScriptLoaded) {
            toast.error('Payment SDK is still loading. Please wait a moment.');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Platform Order
            const orderResponse = await orderService.createOrder({
                shippingAddressId: selectedAddressId,
            });
            const platformOrder = orderResponse.data;

            // 2. Create Razorpay Order
            const rzpOrderResponse = await paymentService.createRazorpayOrder(platformOrder.id);
            const { id: rzpOrderId, amount, currency, keyId } = rzpOrderResponse.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: 'Shoplivedeals',
                description: `Order Payment for #${platformOrder.id.slice(-6).toUpperCase()}`,
                order_id: rzpOrderId,
                handler: async (response: any) => {
                    try {
                        // 4. Verify Payment on Backend
                        const verification = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: platformOrder.id,
                        });

                        if (verification.success) {
                            toast.success('Payment Successful!');
                            clearCart();
                            router.push(`/order-success?orderId=${platformOrder.id}`);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Verification error:', error);
                        toast.error('Something went wrong during verification');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#4F46E5', // Indigo-600
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Checkout failed. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex items-center gap-2 mb-8 text-slate-400 text-sm">
                <span className="text-white font-medium">Cart</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-white font-medium">Checkout</span>
                <ChevronRight className="h-4 w-4" />
                <span>Payment</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Address Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <MapPin className="h-6 w-6 text-indigo-500" />
                                Shipping Address
                            </h2>
                            <Button
                                variant="link"
                                className="text-indigo-400 h-auto p-0"
                                onClick={() => router.push('/account/addresses')}
                            >
                                Manage Addresses
                            </Button>
                        </div>

                        {isLoadingAddresses ? (
                            <div className="space-y-4">
                                <div className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                                <div className="h-24 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/40 text-center">
                                <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 mb-4">No saved addresses found</p>
                                <Button onClick={() => router.push('/account/addresses')}>Add New Address</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        onClick={() => setSelectedAddressId(address._id)}
                                        className={`cursor-pointer rounded-2xl p-5 border transition-all ${selectedAddressId === address._id
                                                ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/20'
                                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-white">{address.fullName}</p>
                                            {selectedAddressId === address._id && (
                                                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-400 lowercase italic">
                                            {address.addressType}
                                        </div>
                                        <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                                            {address.addressLine}, {address.city}
                                        </p>
                                        <p className="text-sm text-slate-300">
                                            {address.state} - {address.postalCode}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-6 pt-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="h-6 w-6 text-indigo-500" />
                            Payment Method
                        </h2>
                        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-600/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded-lg">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Online Payment (Razorpay)</p>
                                    <p className="text-xs text-slate-400">Cards, UPI, Netbanking, Wallets</p>
                                </div>
                            </div>
                            <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30 uppercase text-[10px]">Secure</Badge>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sticky top-24">
                        <h2 className="text-xl font-bold text-white mb-6">Order Review</h2>

                        <div className="max-h-60 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.productId} className="flex gap-3 mb-4 last:mb-0">
                                    <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-900 border border-slate-800 relative overflow-hidden">
                                        <img src={item.product.images?.[0]} alt="" className="object-cover w-full h-full" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                                        <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.product.price.toLocaleString()}</p>
                                    </div>
                                    <div className="text-sm font-bold text-white">
                                        ₹{(item.product.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="bg-slate-800 mb-6" />

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Subtotal</span>
                                <span className="text-white">₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>Shipping</span>
                                <span className="text-green-500">FREE</span>
                            </div>

                            <Separator className="bg-slate-800" />

                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-bold text-white">Amount Payable</span>
                                <span className="text-3xl font-black text-indigo-500">₹{totalAmount.toLocaleString()}</span>
                            </div>

                            <div className="pt-6">
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold shadow-lg shadow-indigo-600/20"
                                    disabled={isProcessing || !selectedAddressId}
                                    onClick={handlePayment}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Pay ₹{totalAmount.toLocaleString()}
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="flex items-center justify-center gap-2 pt-4">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">100% Secure Transaction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
