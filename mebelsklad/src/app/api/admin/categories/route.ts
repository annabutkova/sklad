import { NextRequest, NextResponse } from 'next/server';
import { categoriesApi } from '@/lib/api/mongoApi';

export async function GET(request: NextRequest) {
  try {
    const categories = await categoriesApi.getAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const category = await request.json();
    await categoriesApi.saveCategory(category);
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}