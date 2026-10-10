import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona, ProductContext, PersonaArchetype } from '@/types/persona';

export interface GeneratePersonaParams {
  product: ProductContext;
  archetype?: PersonaArchetype;
  focusPrompt?: string;
}

export async function generatePersonaWithAI(params: {
  product: ProductContext;
  archetype?: PersonaArchetype;
  focusPrompt?: string;
}): Promise<Omit<Persona, 'id' | 'createdAt' | 'updatedAt' | 'version'>> {
  const { product, archetype = 'Primary User', focusPrompt } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const prompt = `
You are an expert Chief Product Officer and user research specialist.
Based on the provided product information below, generate a rich, realistic, and highly actionable persona profile.

PRODUCT INFORMATION:
- Product Name: ${product.name}
- Tagline: ${product.tagline}
- Description: ${product.description}
- Industry: ${product.industry}
- Target Markets: ${product.targetMarket.join(', ')}
- Core Value Propositions: ${product.coreValueProps.join(', ')}
- Key Features: ${product.keyFeatures.join(', ')}
- Competitors / Alternatives: ${product.competitors.join(', ')}

REQUESTED PERSONA TYPE:
- Archetype: ${archetype}
- Specific Focus / Instructions: ${focusPrompt || 'Generate an authentic, grounded profile reflecting realistic user needs and friction points.'}

Respond ONLY with valid JSON conforming strictly to this structure:
{
  "name": "Full Realistic Name",
  "role": "Specific Job Title",
  "archetype": "${archetype}",
  "avatarEmoji": "1 relevant emoji (e.g. 🎯, 💻, ⚡, 🚀, 🔬, 💼)",
  "summary": "2-3 sentences capturing their core role, pain, and how they interact with this domain.",
  "demographics": {
    "ageRange": "e.g. 28-38",
    "experienceLevel": "Junior | Mid | Senior | Executive",
    "companySize": "e.g. 50-200 employees",
    "industry": "e.g. SaaS / FinTech",
    "location": "e.g. Austin, TX (Remote)"
  },
  "goals": ["3-5 concrete personal & team goals related to the product problem space"],
  "painPoints": ["3-5 deep frustrations and bottlenecks they currently face"],
  "motivations": ["3-4 drivers that compel them to adopt a better solution"],
  "fearsAndRisks": ["2-3 objections or risks they worry about when adopting a new tool"],
  "typicalDay": "Narrative paragraph detailing their day-to-day workflow and pain points.",
  "keyTools": ["4-6 tools they already use in their current tech stack"],
  "decisionCriteria": ["3-4 specific evaluation requirements for buying or adopting"],
  "quotes": ["2 authentic first-person quotes reflecting their voice and mindset"],
  "tags": ["3-4 categorizing tags"],
  "status": "active"
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        archetype: archetype || parsed.archetype || 'Primary User',
        status: 'active',
      };
    } catch (err) {
      console.warn('Gemini API call failed or encountered error, falling back to contextual generator:', err);
    }
  }

  // Fallback intelligent generator grounded in product context
  return generateContextualFallbackPersona(product, archetype, focusPrompt);
}

function generateContextualFallbackPersona(
  product: ProductContext,
  archetype: PersonaArchetype,
  focusPrompt?: string
): Omit<Persona, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  const isBuyer = archetype.includes('Buyer');
  const isAnti = archetype.includes('Anti');
  const isTechnical = product.industry.toLowerCase().includes('developer') || product.description.toLowerCase().includes('engineer');

  let name = isBuyer ? 'Victoria Reed' : isTechnical ? 'Daniel Ramos' : 'Chloe Miller';
  let role = isBuyer ? 'Head of Operations & Strategy' : isTechnical ? 'Senior Full-Stack Architect' : 'Senior Product Strategist';
  let emoji = isBuyer ? '💼' : isAnti ? '⛔' : '⚡';

  if (focusPrompt) {
    if (/design/i.test(focusPrompt)) {
      name = 'Sofia Morales';
      role = 'Lead Product Designer';
      emoji = '🎨';
    } else if (/security|compliance/i.test(focusPrompt)) {
      name = 'Arthur Pendelton';
      role = 'Chief Information Security Officer';
      emoji = '🛡️';
    } else if (/sales|growth/i.test(focusPrompt)) {
      name = 'Jordan Blake';
      role = 'Director of Growth & Revenue';
      emoji = '📈';
    }
  }

  const primarySegment = product.targetMarket[0] || 'Modern Tech Teams';
  const primaryFeature = product.keyFeatures[0] || 'core platform';
  const primaryValue = product.coreValueProps[0] || 'accelerated workflows';

  return {
    name,
    role,
    archetype,
    avatarEmoji: emoji,
    summary: `${name} is a ${role} in ${primarySegment}. They struggle with fragmentation and lack of visibility, and are actively looking for ${primaryValue} to elevate team velocity.`,
    demographics: {
      ageRange: isBuyer ? '38-48' : '29-37',
      experienceLevel: isBuyer ? 'Executive' : 'Senior',
      companySize: '50-500 employees',
      industry: product.industry || 'Technology',
      location: 'Hybrid / Remote',
    },
    goals: [
      `Eliminate manual friction when orchestrating ${primaryFeature}`,
      `Improve cross-team collaboration across ${product.name}`,
      `Measure clear ROI and time saved on a weekly basis`,
    ],
    painPoints: [
      `Existing processes feel disjointed and disconnected from actual product context`,
      `Context loss between discovery, documentation, and engineering execution`,
      `Lack of modern AI tooling that understands our unique domain requirements`,
    ],
    motivations: [
      `Delivering customer impact faster without burning out teammates`,
      `Consolidating fragmented toolchains into intuitive unified systems`,
      `Automating routine synthesis so time can be spent on high-leverage decisions`,
    ],
    fearsAndRisks: [
      `Steep learning curve causing team churn or tool abandonment`,
      `Security and data privacy concerns with third-party systems`,
    ],
    typicalDay: `Starts by checking daily milestones and team blockers, conducts priority reviews, evaluates feature impact, and collaborates with stakeholders on strategic initiatives.`,
    keyTools: product.competitors.length > 0 ? product.competitors.slice(0, 3) : ['Slack', 'Figma', 'Linear', 'GitHub'],
    decisionCriteria: [
      `Immediate time-to-value with zero setup overhead`,
      `Clean, exportable assets for leadership and engineering`,
      `Cost transparency and reliable security defaults`,
    ],
    quotes: [
      `"We need tools that adapt to how our product operates, not another rigid spreadsheet."`,
      `"Show me clarity and speed, and our entire organization will get behind it."`,
    ],
    tags: [archetype, product.industry.split(' ')[0] || 'Core', 'AI-Proposed'],
    status: 'active',
  };
}

export async function refinePersonaFieldWithAI(params: {
  persona: Persona;
  field: 'goals' | 'painPoints' | 'motivations' | 'quotes';
  product: ProductContext;
  instruction?: string;
}): Promise<string[]> {
  const { persona, field, product, instruction } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
Given this persona: ${persona.name} (${persona.role}, Archetype: ${persona.archetype})
And product context: ${product.name} - ${product.description}
Current ${field}: ${JSON.stringify(persona[field])}
Instruction: ${instruction || 'Suggest 3 high-impact, realistic additions or refinements.'}

Respond with a JSON array of strings for the field '${field}'. Example: ["item 1", "item 2", "item 3"]
`;
      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('Refinement fallback:', e);
    }
  }

  // Intelligent fallback suggestions
  return [
    ...persona[field],
    `Optimize execution around ${product.keyFeatures[0] || 'core roadmap'}`,
    `Ensure seamless alignment with ${product.targetMarket[0] || 'team goals'}`,
  ];
}
