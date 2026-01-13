import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const { pathname } = request.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protect Seller Routes
    if (pathname.startsWith('/seller')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        if (userRole !== 'seller' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Redirect if already logged in
    if (token && (pathname === '/login' || pathname === '/register')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/seller/:path*', '/login', '/register'],
};
