'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import {
    Wallet,
    TrendingUp,
    ArrowUpRight,
    Search,
    Building2,
    Landmark,
    Download,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import PageTransition from '@/components/shared/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminFinancePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-finance-stats'],
        queryFn: adminService.getFinanceStats,
    });

    const { data: payouts, isLoading: payoutsLoading } = useQuery({
        queryKey: ['admin-payouts'],
        queryFn: adminService.getPayouts,
    });

    const payoutList = payouts?.data || [];
    const finance = stats?.data || {};

    const filteredPayouts = payoutList.filter((p: any) =>
        p.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-white">Financial Oversight</h1>
                    <p className="text-slate-400 mt-1">Monitor revenue, commissions, and manage vendor payouts.</p>
                </div>

                <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
                    <Button variant="ghost" className="h-10 rounded-xl px-4 font-bold text-slate-400 hover:text-white">
                        <Download className="mr-2 h-4 w-4" /> Export Ledger
                    </Button>
                </div>
            </div>

            {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-40 rounded-3xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border-indigo-500/20 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
                        <CardHeader className="relative z-10 pb-2">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Total Platform Revenue</p>
                            <CardTitle className="text-4xl font-black text-white mt-2">₹{finance.totalPlatformRevenue?.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 w-fit px-3 py-1 rounded-full border border-indigo-500/20">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold">Commission Earnings</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Total GMV</p>
                            <CardTitle className="text-4xl font-black text-white mt-2">₹{finance.totalGMV?.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="text-xs font-bold">Gross Merchandise Value</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800 rounded-3xl overflow-hidden group hover:border-amber-500/30 transition-all">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Pending Payouts</p>
                            <CardTitle className="text-4xl font-black text-white mt-2">₹{finance.pendingPayouts?.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="text-xs font-bold">Payable to Vendors</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Payout Ledger */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">Payout Ledger</h3>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search vendor..."
                            className="pl-9 bg-slate-900/50 border-slate-800 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {payoutsLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : filteredPayouts.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10">
                        <Wallet className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No active payout records found</p>
                    </div>
                ) : (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-950/50 border-b border-slate-800/50">
                                        <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">Vendor Entity</th>
                                        <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest">Bank Details</th>
                                        <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest text-right">Commission (Fees)</th>
                                        <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest text-right">Net Payable</th>
                                        <th className="p-6 font-black text-[10px] uppercase text-slate-500 tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {filteredPayouts.map((payout: any) => (
                                        <tr key={payout._id} className="group hover:bg-slate-900/60 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{payout.storeName}</p>
                                                        <p className="text-xs text-slate-500">{payout.ordersCount} Orders Fulfilled</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {payout.bankDetails ? (
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                                            <Landmark className="w-3 h-3 text-slate-500" />
                                                            {payout.bankDetails.bankName}
                                                        </div>
                                                        <p className="text-[10px] font-mono text-slate-500">**** {payout.bankDetails.accountNumber.slice(-4)}</p>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="border-red-500/20  text-[10px] uppercase text-red-500 bg-red-500/10">Missing Info</Badge>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <p className="font-bold text-red-400">-₹{payout.totalCommission.toLocaleString()}</p>
                                            </td>
                                            <td className="p-6 text-right">
                                                <p className="font-black text-emerald-400 text-lg">₹{payout.totalEarnings.toLocaleString()}</p>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Button size="sm" className="bg-white text-black hover:bg-slate-200 font-bold ml-auto" disabled={!payout.bankDetails}>
                                                    Process
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
