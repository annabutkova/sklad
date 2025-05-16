import { NextRequest, NextResponse } from 'next/server';
import { jsonDataService } from '@/lib/api/jsonDataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categories = await jsonDataService.getAllCategories();
    const category = categories.find(c => c.id === params.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await request.json();

    if (params.id !== category.id) {
      return NextResponse.json(
        { error: 'Category ID mismatch' },
        { status: 400 }
      );
    }

    await jsonDataService.saveCategory(category);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await jsonDataService.deleteCategory(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}