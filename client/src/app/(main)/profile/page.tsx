'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Please login to view your profile</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-foreground mb-2">My Profile</h1>
                <p className="text-muted-foreground">Manage your account information</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information Card */}
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground">Profile Information</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Your personal details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-1">Full Name</p>
                                {isEditing ? (
                                    <Input
                                        defaultValue={user.name}
                                        className="border-border bg-background text-foreground"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-foreground">{user.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center">
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-1">Email Address</p>
                                <p className="text-lg font-bold text-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-1">Role</p>
                                <p className="text-lg font-bold text-foreground capitalize">{user.role}</p>
                            </div>
                        </div>

                        {user.createdAt && (
                            <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground uppercase font-semibold tracking-wide mb-1">Member Since</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {format(new Date(user.createdAt), 'MMMM dd, yyyy')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-slate-800 hover:bg-slate-900"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="border-slate-800 hover:bg-slate-900"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Account Status Card */}
                <Card className="border-border bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-foreground">Account Status</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Your account information and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-background rounded-lg border border-border">
                                <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                                <p className="text-lg font-bold text-emerald-500">
                                    Active
                                </p>
                            </div>
                            <div className="p-4 bg-background rounded-lg border border-border">
                                <p className="text-sm text-muted-foreground mb-1">Account Type</p>
                                <p className="text-lg font-bold text-indigo-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
