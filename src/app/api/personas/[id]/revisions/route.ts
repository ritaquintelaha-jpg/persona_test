import { NextResponse } from 'next/server';
import { getPersonaRevisions } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const revisions = await getPersonaRevisions(params.id);
    return NextResponse.json(revisions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
}
