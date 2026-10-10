import { NextResponse } from 'next/server';
import { getProductContext, saveProductContext } from '@/lib/storage';

export async function GET() {
  try {
    const product = await getProductContext();
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product context' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await saveProductContext(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save product context' }, { status: 500 });
  }
}
