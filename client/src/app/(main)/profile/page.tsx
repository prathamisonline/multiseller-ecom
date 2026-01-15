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
                    <h1 className="text-2xl font-bold text-white mb-4">Please login to view your profile</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-white mb-2">My Profile</h1>
                <p className="text-slate-400">Manage your account information</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Information Card */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Profile Information</CardTitle>
                        <CardDescription className="text-slate-400">
                            Your personal details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wide mb-1">Full Name</p>
                                {isEditing ? (
                                    <Input
                                        defaultValue={user.name}
                                        className="border-slate-800 bg-slate-950 text-white"
                                    />
                                ) : (
                                    <p className="text-lg font-bold text-white">{user.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center">
                                <Mail className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wide mb-1">Email Address</p>
                                <p className="text-lg font-bold text-white">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500 uppercase font-semibold tracking-wide mb-1">Role</p>
                                <p className="text-lg font-bold text-white capitalize">{user.role}</p>
                            </div>
                        </div>

                        {user.createdAt && (
                            <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500 uppercase font-semibold tracking-wide mb-1">Member Since</p>
                                    <p className="text-lg font-bold text-white">
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
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Account Status</CardTitle>
                        <CardDescription className="text-slate-400">
                            Your account information and status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                <p className="text-sm text-slate-500 mb-1">Account Status</p>
                                <p className="text-lg font-bold text-emerald-500">
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                                <p className="text-sm text-slate-500 mb-1">Account Type</p>
                                <p className="text-lg font-bold text-indigo-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
