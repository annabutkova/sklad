import { NextRequest, NextResponse } from 'next/server';
import { setsApi } from '@/lib/api/mongoApi';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const set = await setsApi.getSetById(params.id);

    if (!set) {
      return NextResponse.json(
        { error: 'Product set not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(set);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product set' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const set = await request.json();

    if (params.id !== set.id) {
      return NextResponse.json(
        { error: 'Product set ID mismatch' },
        { status: 400 }
      );
    }

    await setsApi.saveSet(set);
    return NextResponse.json({ success: true, set });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product set' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await setsApi.deleteSet(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product set' },
      { status: 500 }
    );
  }
}