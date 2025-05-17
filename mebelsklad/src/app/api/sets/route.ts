// src/app/api/sets/route.ts
import { NextResponse } from 'next/server';
import { setsApi } from '@/lib/api/mongoApi';

export async function GET() {
    try {
        const sets = await setsApi.getAllSets();
        return NextResponse.json(sets);
    } catch (error) {
        console.error('Error fetching product sets:', error);
        return NextResponse.json({ error: 'Failed to fetch product sets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const set = await request.json();
        const savedSet = await setsApi.saveSet(set);
        return NextResponse.json(savedSet);
    } catch (error) {
        console.error('Error saving product set:', error);
        return NextResponse.json({ error: 'Failed to save product set' }, { status: 500 });
    }
}