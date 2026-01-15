'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Loader2, Store, AlertCircle } from 'lucide-react';
import { sellerService } from '@/services/seller.service';
import { useSellerStore } from '@/store/sellerStore';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SellerLoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const setSellerProfile = useSellerStore((state) => state.setSellerProfile);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            setAuth(response.user, response.token);

            // Fetch seller profile if exists
            try {
                const sellerResponse = await sellerService.getMySellerProfile();
                if (sellerResponse.data) {
                    setSellerProfile(sellerResponse.data);

                    // Redirect based on seller status
                    if (sellerResponse.data.status === 'approved') {
                        router.push('/seller');
                    } else if (sellerResponse.data.status === 'pending') {
                        router.push('/seller/pending');
                    } else if (sellerResponse.data.status === 'rejected') {
                        router.push('/seller/rejected');
                    } else {
                        router.push('/seller/onboarding');
                    }
                } else {
                    // No seller profile, redirect to onboarding
                    router.push('/seller/onboarding');
                }
            } catch (sellerErr: any) {
                // No seller profile exists yet
                router.push('/seller/onboarding');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-md border-amber-900/50 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
                            <Store className="h-9 w-9 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white text-center">Seller Portal</CardTitle>
                    <CardDescription className="text-slate-400 text-center">
                        Access your seller dashboard
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="email">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="seller@example.com"
                                type="email"
                                className="border-slate-800 bg-slate-950 text-white focus:ring-amber-500 focus:border-amber-500"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                className="border-slate-800 bg-slate-950 text-white focus:ring-amber-500 focus:border-amber-500"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            className="w-full bg-amber-600 hover:bg-amber-700 font-semibold"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login to Seller Portal'
                            )}
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-amber-400 hover:text-amber-300">
                                Register
                            </Link>
                        </div>
                        <div className="text-center text-sm text-slate-500">
                            <Link href="/login" className="hover:text-indigo-400">
                                User Login
                            </Link>
                            {' / '}
                            <Link href="/admin-login" className="hover:text-purple-400">
                                Admin Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
