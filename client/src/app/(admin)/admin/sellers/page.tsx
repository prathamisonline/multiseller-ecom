'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Store,
    ExternalLink,
    ShieldCheck,
    CreditCard,
    MapPin,
    FileText,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

const statusConfig = {
    pending: { label: 'Pending Verification', icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    approved: { label: 'Verified Partner', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    rejected: { label: 'Application Rejected', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
    suspended: { label: 'Suspended Account', icon: AlertCircle, color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
};

export default function AdminSellersPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['admin-sellers', statusFilter],
        queryFn: () => adminService.getAllSellers({ status: statusFilter === 'all' ? undefined : statusFilter }),
    });

    const approveMutation = useMutation({
        mutationFn: adminService.approveSeller,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
            toast.success('Seller approved successfully');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => adminService.rejectSeller(id, 'Admin verification failed'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
            toast.error('Seller application rejected');
        },
    });

    const sellers = data?.sellers || [];
    const filteredSellers = sellers.filter((s: any) =>
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white">Vendor Verification</h1>
                    <p className="text-slate-400 mt-1">Review and manage seller applications for the marketplace.</p>
                </div>

                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
                    <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('pending')} className="h-10 rounded-xl px-4 font-bold">Pending</Button>
                    <Button variant={statusFilter === 'approved' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('approved')} className="h-10 rounded-xl px-4 font-bold">Approved</Button>
                    <Button variant={statusFilter === 'all' ? 'secondary' : 'ghost'} onClick={() => setStatusFilter('all')} className="h-10 rounded-xl px-4 font-bold">All</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search by store name..."
                    className="pl-11 h-14 bg-slate-900/50 border-slate-800 rounded-2xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                    <Store className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No sellers found match your criteria</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredSellers.map((seller: any) => {
                        const config = statusConfig[seller.status as keyof typeof statusConfig];
                        const Icon = config.icon;

                        return (
                            <div key={seller._id} className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col xl:flex-row gap-10">
                                <div className="flex-1 space-y-6">
                                    {/* Header info */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                                                <Store className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white">{seller.storeName}</h3>
                                                <p className="text-slate-500 font-medium">@{seller.slug}</p>
                                            </div>
                                        </div>
                                        <Badge className={config.color + " border py-1.5 px-4 rounded-full text-[10px] uppercase font-black"}>
                                            <Icon className="w-3.5 h-3.5 mr-2" />
                                            {config.label}
                                        </Badge>
                                    </div>

                                    {/* Business Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Business Verification
                                            </h4>
                                            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-slate-500">PAN Card No.</span>
                                                    <span className="text-xs text-white font-mono uppercase font-bold">{seller.businessDetails.pan}</span>
                                                </div>
                                                {seller.businessDetails.gstNumber && (
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-slate-500">GST Registration</span>
                                                        <span className="text-xs text-white font-mono uppercase font-bold">{seller.businessDetails.gstNumber}</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t border-slate-800/50">
                                                    <span className="text-xs text-slate-500 block mb-1">Business Address</span>
                                                    <p className="text-xs text-slate-300 leading-relaxed italic">{seller.businessDetails.address}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                <CreditCard className="w-3.5 h-3.5" /> Payout Destination
                                            </h4>
                                            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 h-full">
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-slate-500">Bank Name</span>
                                                    <span className="text-xs text-white font-bold">{seller.bankDetails.bankName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-slate-500">Account Ending</span>
                                                    <span className="text-xs text-white font-mono font-bold">••••{seller.bankDetails.accountNumber.slice(-4)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-xs text-slate-500">IFSC Code</span>
                                                    <span className="text-xs text-indigo-400 font-mono font-black">{seller.bankDetails.ifscCode}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Panel */}
                                <div className="xl:w-64 border-l border-slate-800 xl:pl-10 flex flex-col justify-center gap-3">
                                    {seller.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => approveMutation.mutate(seller._id)}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 font-black shadow-lg shadow-indigo-600/20"
                                            >
                                                Approve Merchant
                                            </Button>
                                            <Button
                                                onClick={() => rejectMutation.mutate(seller._id)}
                                                variant="outline"
                                                className="w-full border-slate-800 hover:bg-red-500/10 hover:text-red-500 h-14 font-bold"
                                            >
                                                Decline Application
                                            </Button>
                                        </>
                                    )}
                                    {seller.status === 'approved' && (
                                        <Button variant="outline" className="w-full border-slate-800 hover:bg-slate-900 h-14 font-bold text-slate-400">
                                            Audit Logs
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
