import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/shared/Navbar';
import QueryProvider from '@/components/shared/QueryProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import SellerSyncProvider from '@/components/shared/SellerSyncProvider';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020617',
}

export const metadata: Metadata = {
  title: 'Shoplivedeals | Premium Multi-Vendor Marketplace',
  description: 'The premier destination for quality products from verified sellers. Shop electronics, fashion, and home goods with confidence.',
  keywords: ['marketplace', 'ecommerce', 'shoplivedeals', 'multi-vendor', 'shopping'],
  authors: [{ name: 'Shoplivedeals Team' }],
  openGraph: {
    title: 'Shoplivedeals | Premium Marketplace',
    description: 'Discover curated products from top-rated sellers.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <SellerSyncProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster position="bottom-right" theme="system" richColors />
                <Navbar />
                <main className="min-h-screen">{children}</main>
              </ThemeProvider>
            </SellerSyncProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
