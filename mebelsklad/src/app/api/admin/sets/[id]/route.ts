import { NextRequest, NextResponse } from 'next/server';
import { jsonDataService } from '@/lib/api/jsonDataService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const set = await jsonDataService.getProductSetById(params.id);
    
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
    
    await jsonDataService.saveProductSet(set);
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
    await jsonDataService.deleteProductSet(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product set' },
      { status: 500 }
    );
  }
}