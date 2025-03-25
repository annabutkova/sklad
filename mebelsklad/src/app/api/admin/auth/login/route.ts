import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

// In a real app, these would be stored securely in environment variables
// and users would be stored in a database
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';
const JWT_SECRET = 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validate credentials
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Create session token
        const token = sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '4h' } // Token expires in 4 hours
        );

        // Set the cookie
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'admin-token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 4, // 4 hours in seconds
            sameSite: 'strict',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}