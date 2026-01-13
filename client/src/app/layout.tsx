import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/shared/Navbar';
import QueryProvider from '@/components/shared/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shoplivedeals | Multi-Vendor Marketplace',
  description: 'Premium multi-vendor marketplace for quality products.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <QueryProvider>
          <Navbar />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
