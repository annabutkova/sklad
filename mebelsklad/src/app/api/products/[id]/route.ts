// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { productsApi } from '@/lib/api/mongoApi';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await productsApi.getProductById(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error(`Error fetching product ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await productsApi.deleteProduct(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting product ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const product = await request.json();

        // Проверяем, что ID в URL совпадает с ID в теле запроса
        if (product.id !== params.id) {
            return NextResponse.json(
                { error: 'Product ID in URL does not match ID in request body' },
                { status: 400 }
            );
        }

        const existingProduct = await productsApi.getProductById(params.id);
        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updatedProduct = await productsApi.saveProduct(product);
        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error(`Error updating product ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}