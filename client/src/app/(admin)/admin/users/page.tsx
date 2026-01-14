'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import {
    Users,
    Search,
    Shield,
    Store,
    User as UserIcon,
    MoreVertical,
    Ban,
    CheckCircle,
    Trash2,
    Mail,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import PageTransition from '@/components/shared/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminUsersPage() {
    // ... existing hooks ...
    const queryClient = useQueryClient();
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', roleFilter],
        queryFn: () => adminService.getAllUsers({ role: roleFilter === 'all' ? undefined : roleFilter }),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) =>
            adminService.updateUserStatus(id, isActive),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success(`User ${data.data.isActive ? 'activated' : 'suspended'} successfully`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            toast.success('User deleted permanently');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    });

    const users = data?.data?.users || [];
    const filteredUsers = users.filter((u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white">User Management</h1>
                    <p className="text-slate-400 mt-1">Oversee all registered accounts and moderation controls.</p>
                </div>

                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
                    <Button variant={roleFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => setRoleFilter('all')} className="h-10 rounded-xl px-4 font-bold">All Users</Button>
                    <Button variant={roleFilter === 'user' ? 'secondary' : 'ghost'} onClick={() => setRoleFilter('user')} className="h-10 rounded-xl px-4 font-bold">Customers</Button>
                    <Button variant={roleFilter === 'seller' ? 'secondary' : 'ghost'} onClick={() => setRoleFilter('seller')} className="h-10 rounded-xl px-4 font-bold">Sellers</Button>
                    <Button variant={roleFilter === 'admin' ? 'secondary' : 'ghost'} onClick={() => setRoleFilter('admin')} className="h-10 rounded-xl px-4 font-bold">Admins</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search by name or email address..."
                    className="pl-11 h-14 bg-slate-900/50 border-slate-800 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-24 rounded-3xl" />
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                    <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No users found</p>
                </div>
            ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-950/50 border-b border-slate-800/50">
                                    <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">User Profile</th>
                                    <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">Role</th>
                                    <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">Status</th>
                                    <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">Joined On</th>
                                    <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredUsers.map((user: any) => (
                                    <tr key={user._id} className="group hover:bg-slate-900/60 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{user.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-950/50">
                                                {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-500" />}
                                                {user.role === 'seller' && <Store className="w-3.5 h-3.5 text-amber-500" />}
                                                {user.role === 'user' && <UserIcon className="w-3.5 h-3.5 text-slate-500" />}
                                                <span className="text-xs font-bold capitalize text-slate-300">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className={`
                           uppercase text-[10px] font-black tracking-widest py-1 px-3 border-0
                           ${user.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-red-500/10 text-red-500'}
                        `}>
                                                {user.isActive ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm font-medium text-slate-400">
                                                {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-950 border-slate-800 text-slate-300">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer font-medium hover:bg-slate-900 focus:bg-slate-900"
                                                        onClick={() => toggleStatusMutation.mutate({ id: user._id, isActive: !user.isActive })}
                                                    >
                                                        {user.isActive ? (
                                                            <><Ban className="mr-2 h-4 w-4 text-red-500" /> Suspend Account</>
                                                        ) : (
                                                            <><CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Reactivate Account</>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-800" />
                                                    <DropdownMenuItem
                                                        className="cursor-pointer font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
                                                                deleteMutation.mutate(user._id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}
