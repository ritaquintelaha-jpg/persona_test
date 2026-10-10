import { NextResponse } from 'next/server';
import { duplicatePersona } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const duplicated = await duplicatePersona(params.id);
    if (!duplicated) {
      return NextResponse.json({ error: 'Persona not found to duplicate' }, { status: 404 });
    }
    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate persona' }, { status: 500 });
  }
}
