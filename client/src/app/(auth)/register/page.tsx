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
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.register(data);
            setAuth(response.user, response.token);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-foreground">Create an account</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your details to register as a customer
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="name">
                                Full Name
                            </label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className="border-border bg-background text-foreground focus:ring-indigo-500"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="email">
                                Email
                            </label>
                            <Input
                                id="email"
                                placeholder="m@example.com"
                                type="email"
                                className="border-border bg-background text-foreground focus:ring-indigo-500"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                className="border-border bg-background text-foreground focus:ring-indigo-500"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                className="border-border bg-background text-foreground focus:ring-indigo-500"
                                {...register('confirmPassword')}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Register'
                            )}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
