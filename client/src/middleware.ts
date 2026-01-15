import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const { pathname } = request.nextUrl;

    // Protect Admin Routes (but not admin-login)
    if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
        if (!token) {
            return NextResponse.redirect(new URL('/admin-login', request.url));
        }
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protect Seller Routes (but not seller login)
    if (pathname.startsWith('/seller') && !pathname.startsWith('/seller/login') && !pathname.startsWith('/seller/onboarding')) {
        if (!token) {
            return NextResponse.redirect(new URL('/seller/login', request.url));
        }
        // Allow admin or seller role for seller routes
        if (userRole !== 'seller' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Redirect if already logged in and visiting login pages
    if (token) {
        // Admin trying to access login pages
        if (userRole === 'admin') {
            if (pathname === '/admin-login') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (pathname === '/login' || pathname === '/register') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }

        // Seller trying to access login pages
        if (userRole === 'seller') {
            if (pathname === '/seller/login') {
                return NextResponse.redirect(new URL('/seller', request.url));
            }
            if (pathname === '/login' || pathname === '/register') {
                return NextResponse.redirect(new URL('/seller', request.url));
            }
        }

        // Regular user trying to access login pages
        if (pathname === '/login' || pathname === '/register') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/admin-login', '/seller/:path*', '/login', '/register'],
};
