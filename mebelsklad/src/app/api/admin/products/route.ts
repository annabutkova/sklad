import { NextRequest, NextResponse } from 'next/server';
import { jsonDataService } from '@/lib/api/jsonDataService';

export async function GET(request: NextRequest) {
  try {
    const products = await jsonDataService.getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json();
    await jsonDataService.saveProduct(product);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}