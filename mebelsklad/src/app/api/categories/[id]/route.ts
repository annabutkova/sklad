// src/app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { categoriesApi } from '@/lib/api/serverApi';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const category = await categoriesApi.getCategoryById(params.id);

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error(`Error fetching category ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const category = await request.json();

        // Проверяем, что ID в URL совпадает с ID в теле запроса
        if (category.id !== params.id) {
            return NextResponse.json(
                { error: 'Category ID in URL does not match ID in request body' },
                { status: 400 }
            );
        }

        const existingCategory = await categoriesApi.getCategoryById(params.id);
        if (!existingCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const updatedCategory = await categoriesApi.saveCategory(category);
        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error(`Error updating category ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await categoriesApi.deleteCategory(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting category ${params.id}:`, error);
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
    }
}