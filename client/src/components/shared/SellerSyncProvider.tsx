'use client';

import { useSellerSync } from '@/hooks/useSellerSync';

export default function SellerSyncProvider({ children }: { children: React.ReactNode }) {
    useSellerSync();
    return <>{children}</>;
}
