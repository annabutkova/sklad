import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// In a real app, this would be stored in environment variables
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Check if this is an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Skip authentication for the login route
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Get the token from the cookies
        const token = request.cookies.get('admin-token')?.value;

        if (!token) {
            // Redirect to login if no token found
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            // Verify the token
            verify(token, JWT_SECRET);

            // Token is valid, allow access
            return NextResponse.next();
        } catch (error) {
            // Token is invalid or expired, redirect to login
            console.error('Token verification failed:', error);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Not an admin route, allow access
    return NextResponse.next();
}

// Only run middleware on admin routes
export const config = {
    matcher: '/admin/:path*',
};