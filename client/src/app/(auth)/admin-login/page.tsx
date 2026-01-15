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
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
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

            // Verify that the user is an admin
            if (response.user.role !== 'admin') {
                setError('Access denied. This portal is for administrators only.');
                setIsLoading(false);
                return;
            }

            setAuth(response.user, response.token);
            router.push('/admin');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
            <Card className="w-full max-w-md border-purple-900/50 bg-slate-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                            <ShieldCheck className="h-9 w-9 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white text-center">Admin Portal</CardTitle>
                    <CardDescription className="text-slate-400 text-center">
                        Authorized personnel only
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
                                Admin Email
                            </label>
                            <Input
                                id="email"
                                placeholder="admin@example.com"
                                type="email"
                                className="border-slate-800 bg-slate-950 text-white focus:ring-purple-500 focus:border-purple-500"
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
                                className="border-slate-800 bg-slate-950 text-white focus:ring-purple-500 focus:border-purple-500"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700 font-semibold"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Access Admin Panel'
                            )}
                        </Button>
                        <div className="text-center text-sm text-slate-400">
                            Not an admin?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                                User Login
                            </Link>
                            {' / '}
                            <Link href="/seller/login" className="text-amber-400 hover:text-amber-300">
                                Seller Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
