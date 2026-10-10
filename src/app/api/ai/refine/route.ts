import { NextResponse } from 'next/server';
import { getProductContext } from '@/lib/storage';
import { refinePersonaFieldWithAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { persona, field, instruction } = body;

    if (!persona || !field) {
      return NextResponse.json({ error: 'Missing persona or field' }, { status: 400 });
    }

    const product = await getProductContext();
    const suggestions = await refinePersonaFieldWithAI({
      persona,
      field,
      product,
      instruction,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to refine persona field' }, { status: 500 });
  }
}
