'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    Package,
    ShoppingBag,
    ShieldCheck,
    Store,
    LayoutDashboard,
    AlertCircle,
    Wallet,
    Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: BarChart3, label: 'Market Intelligence', href: '/admin/analytics' },
    { icon: Store, label: 'Seller Directory', href: '/admin/sellers' },
    { icon: Package, label: 'Product Audit', href: '/admin/products' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: Wallet, label: 'Financial Oversight', href: '/admin/finance' },
    { icon: ShoppingBag, label: 'Global Orders', href: '/admin/orders' },
];

export default function AdminMobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="lg:hidden text-slate-400 hover:text-white p-2">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-slate-950 border-r border-slate-900 p-0">
                <SheetHeader className="p-8 pb-4 text-left">
                    <SheetTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Platform</p>
                            <h1 className="text-xl font-black text-white italic">ADMIN OPS</h1>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-xl">
                    <nav className="space-y-1 p-4">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                                        isActive
                                            ? "bg-indigo-600/10 text-white border-r-2 border-indigo-500"
                                            : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-transform group-hover:scale-110",
                                        isActive ? "text-indigo-500" : "text-slate-600"
                                    )} />
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto p-4 mb-8">
                        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Platform Status</p>
                            </div>
                            <p className="text-xs text-white font-bold">Systems Operational</p>
                            <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                <div className="w-full h-full bg-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
