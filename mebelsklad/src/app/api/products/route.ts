// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { productsApi } from '@/lib/api/mongoApi';

export async function GET() {
    try {
        const products = await productsApi.getAllProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const product = await request.json();
        const savedProduct = await productsApi.saveProduct(product);
        return NextResponse.json(savedProduct);
    } catch (error) {
        console.error('Error saving product:', error);
        return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
    }
}