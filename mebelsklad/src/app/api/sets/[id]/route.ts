// src/app/api/sets/[id]/route.ts
import { NextResponse } from 'next/server';
import { setsApi } from '@/lib/api/mongoApi';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const set = await setsApi.getSetById(params.id);

        if (!set) {
            return NextResponse.json({ error: 'Product set not found' }, { status: 404 });
        }

        return NextResponse.json(set);
    } catch (error) {
        console.error(`Error fetching product set ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch product set' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const set = await request.json();

        // Проверяем, что ID в URL совпадает с ID в теле запроса
        if (set.id !== params.id) {
            return NextResponse.json(
                { error: 'Set ID in URL does not match ID in request body' },
                { status: 400 }
            );
        }

        const existingSet = await setsApi.getSetById(params.id);
        if (!existingSet) {
            return NextResponse.json({ error: 'Product set not found' }, { status: 404 });
        }

        const updatedSet = await setsApi.saveSet(set);
        return NextResponse.json(updatedSet);
    } catch (error) {
        console.error(`Error updating product set ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to update product set' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await setsApi.deleteSet(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting product set ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete product set' }, { status: 500 });
    }
}