// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // jose is Edge-compatible

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'aswedsa';

export async function middleware(request: NextRequest) {
    // Get the token from the cookies or Authorization header
    const token = request.cookies.get('token')?.value ||
        request.headers.get('Authorization')?.split(' ')[1];

    // If there's no token and the path starts with /api/admin
    if (!token && request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
            { success: false, message: 'Authentication required' },
            { status: 401 }
        );
    }

    // For paths that require authentication
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        try {
            // Verify the token with jose library (Edge compatible)
            await jwtVerify(
                token!,
                new TextEncoder().encode(JWT_SECRET)
            );

            // Token is valid, allow access
            return NextResponse.next();
        } catch (error) {
            console.error('Token verification failed:', error);

            // Return a JSON response for API routes
            return NextResponse.json(
                { success: false, message: 'Invalid authentication token' },
                { status: 401 }
            );
        }
    }

    // For non-authenticated routes
    return NextResponse.next();
}

// Configure which paths this middleware runs on
export const config = {
    matcher: ['/api/admin/:path*', '/admin/:path*'],
};