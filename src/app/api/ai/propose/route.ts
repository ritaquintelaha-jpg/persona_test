import { NextResponse } from 'next/server';
import { getProductContext } from '@/lib/storage';
import { generatePersonaWithAI } from '@/lib/gemini';
import { PersonaArchetype } from '@/types/persona';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const archetype: PersonaArchetype = body.archetype || 'Primary User';
    const focusPrompt: string | undefined = body.focusPrompt;

    const product = await getProductContext();
    const proposal = await generatePersonaWithAI({
      product,
      archetype,
      focusPrompt,
    });

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('Error generating persona proposal:', error);
    return NextResponse.json({ error: 'Failed to propose persona profile' }, { status: 500 });
  }
}
