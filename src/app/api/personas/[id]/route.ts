import { NextResponse } from 'next/server';
import { getPersonaById, updatePersona, deletePersona } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const persona = await getPersonaById(params.id);
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    return NextResponse.json(persona);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch persona' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const changeSummary = body._changeSummary || 'Updated persona fields';
    delete body._changeSummary;

    const updated = await updatePersona(params.id, body, changeSummary);
    if (!updated) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update persona' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deletePersona(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete persona' }, { status: 500 });
  }
}
