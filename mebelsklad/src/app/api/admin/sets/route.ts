import { NextRequest, NextResponse } from 'next/server';
import { setsApi } from '@/lib/api/mongoApi';

export async function GET(request: NextRequest) {
  try {
    const sets = await setsApi.getAllSets();
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
    await setsApi.saveSet(set);
    return NextResponse.json({ success: true, set });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product set' },
      { status: 500 }
    );
  }
}