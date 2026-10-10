import { NextResponse } from 'next/server';
import { getPersonas, createPersona } from '@/lib/storage';

export async function GET() {
  try {
    const personas = await getPersonas();
    return NextResponse.json(personas);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.role || !body.archetype) {
      return NextResponse.json({ error: 'Missing required fields: name, role, archetype' }, { status: 400 });
    }
    const newPersona = await createPersona(body);
    return NextResponse.json(newPersona, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 });
  }
}
