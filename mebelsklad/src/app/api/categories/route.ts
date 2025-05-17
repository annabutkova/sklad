// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { categoriesApi } from '@/lib/api/mongoApi';

export async function GET() {
    try {
        const categories = await categoriesApi.getAllCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const category = await request.json();
        const savedCategory = await categoriesApi.saveCategory(category);
        return NextResponse.json(savedCategory);
    } catch (error) {
        console.error('Error saving category:', error);
        return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
    }
}