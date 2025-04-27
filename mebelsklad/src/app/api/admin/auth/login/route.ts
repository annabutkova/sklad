import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// In a real app, these would be stored securely in environment variables
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';
const JWT_SECRET = 'aswedsa';

export async function POST(request: NextRequest) {
    console.log("Login successful");
    try {
        const body = await request.json();
        console.log("Received login attempt:", { username: body.username });

        const { username, password } = body;

        // Validate credentials
        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            console.log("Login failed: Invalid credentials");
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }


        // Create session token
        const token = sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '4h' }
        );

        console.log("Setting cookie with token:", token); // Add this for debugging

        const response = NextResponse.json({ success: true });

        response.cookies.set({
            name: 'admin-token',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 4, // 4 hours in seconds
            sameSite: 'strict',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}