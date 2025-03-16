import { NextRequest, NextResponse } from 'next/server';
import { jsonDataService } from '@/lib/api/jsonDataService';

export async function GET(request: NextRequest) {
  try {
    const sets = await jsonDataService.getAllProductSets();
    return NextResponse.json(sets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product sets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const set = await request.json();
    await jsonDataService.saveProductSet(set);
    return NextResponse.json({ success: true, set });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product set' },
      { status: 500 }
    );
  }
}