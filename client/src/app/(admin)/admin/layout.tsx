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
    CheckCircle,
    XCircle,
    AlertCircle,
    Wallet,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { icon: BarChart3, label: 'Market Intelligence', href: '/admin/analytics' },
    { icon: Store, label: 'Seller Directory', href: '/admin/sellers' },
    { icon: Package, label: 'Product Audit', href: '/admin/products' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: Wallet, label: 'Financial Oversight', href: '/admin/finance' },
    { icon: ShoppingBag, label: 'Global Orders', href: '/admin/orders' },
];

import AdminMobileSidebar from '@/components/admin/AdminMobileSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logoutAdmin } = useAuthStore();
    const router = useRouter();

    // Verify admin role
    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/');
        }
    }, [user, router]);

    if (!user || user.role !== 'admin') {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Admin Sidebar */}
            <aside className="w-72 border-r border-slate-900 bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen hidden lg:block">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">Platform</p>
                            <h1 className="text-xl font-black text-white italic">ADMIN OPS</h1>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
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
                </div>

                <div className="absolute bottom-8 left-8 right-8 space-y-3">
                    <Button
                        onClick={logoutAdmin}
                        variant="outline"
                        className="w-full border-red-900/50 hover:bg-red-950/50 hover:border-red-800 text-red-400 hover:text-red-300"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Admin Logout
                    </Button>

                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800"
                    >
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black text-white italic">ADMIN OPS</span>
                    </div>
                    <AdminMobileSidebar />
                </div>

                <div className="p-4 md:p-12 lg:p-16 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
