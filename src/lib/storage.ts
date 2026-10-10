import fs from 'fs/promises';
import path from 'path';
import { Persona, ProductContext, PersonaRevision } from '@/types/persona';

const DATA_DIR = path.join(process.cwd(), '.data');
const PRODUCT_FILE = path.join(DATA_DIR, 'product.json');
const PERSONAS_FILE = path.join(DATA_DIR, 'personas.json');
const REVISIONS_FILE = path.join(DATA_DIR, 'revisions.json');

const DEFAULT_PRODUCT: ProductContext = {
  id: 'prod-default',
  name: 'Antigravity Studio',
  tagline: 'Autonomous AI-Powered Product Intelligence and Agentic Development',
  description: 'An AI-native developer and product management platform that unifies persona mapping, automated feature discovery, and full-stack agentic coding workflows to accelerate modern software engineering teams.',
  industry: 'Developer Tools & SaaS',
  targetMarket: [
    'B2B SaaS Engineering Teams',
    'Technical Product Managers',
    'Startup Founders & Solopreneurs',
    'Enterprise Platform & DevOps Engineers',
  ],
  coreValueProps: [
    'Autonomous pair programming with deep context awareness',
    'Live persona generation grounded in real product telemetry and feature specs',
    'Zero-friction iteration between product vision and working code',
  ],
  keyFeatures: [
    'Persona Studio with AI proposal engine',
    'Contextual agentic coding and test execution',
    'Automated changelog and release impact analysis',
  ],
  competitors: ['Linear', 'Cursor', 'Jira Product Discovery', 'Productboard'],
  updatedAt: new Date().toISOString(),
};

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'persona-1',
    productId: 'prod-default',
    name: 'Priya Sharma',
    role: 'Lead Technical Product Manager',
    archetype: 'Primary User',
    avatarEmoji: '🎯',
    summary: 'A fast-paced product leader who orchestrates cross-functional roadmaps, translates user interviews into engineering specs, and needs quick persona validation before sprints.',
    demographics: {
      ageRange: '28-36',
      experienceLevel: 'Senior',
      companySize: '50-250 employees',
      industry: 'Cloud Software / B2B',
      location: 'San Francisco, CA (Hybrid)',
    },
    goals: [
      'Bridge the gap between customer discovery interviews and engineering backlog items',
      'Ensure every sprint feature directly addresses a verified user pain point',
      'Keep personas up-to-date as the product expands to new market segments',
    ],
    painPoints: [
      'Personas created during quarterly planning quickly become stale and ignored',
      'Engineers frequently ask "who are we building this for?" without a centralized single source of truth',
      'Spending too much time manually writing persona documents in Notion/Slides',
    ],
    motivations: [
      'High product adoption and low churn',
      'Shipping features with clear user empathy',
      'Autonomous tooling that frees up strategic thinking time',
    ],
    fearsAndRisks: [
      'Building the wrong features that miss market need',
      'Complex tools that team members abandon after two weeks',
    ],
    typicalDay: 'Starts with reviewing user analytics and support tickets, conducts customer interviews mid-day, syncs with tech leads, and refines feature user stories in the late afternoon.',
    keyTools: ['Linear', 'Figma', 'Slack', 'Notion', 'Mixpanel', 'PostHog'],
    decisionCriteria: [
      'Fast onboarding with low setup time',
      'Seamless AI proposals that feel accurate rather than generic',
      'Clean export options to share with executive leadership',
    ],
    quotes: [
      'If our engineers cannot picture the user in 10 seconds, the user story has failed.',
      'I need dynamic personas that evolve with our product releases, not static PDF snapshots.',
    ],
    tags: ['Core Team', 'High Influence', 'Daily Active'],
    version: 1,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'persona-2',
    productId: 'prod-default',
    name: 'Marcus Vance',
    role: 'VP of Product & Engineering',
    archetype: 'Buyer / Decision Maker',
    avatarEmoji: '💼',
    summary: 'An executive buyer focused on team velocity, ROI, developer retention, and maintaining architectural rigor across 5 squads.',
    demographics: {
      ageRange: '40-52',
      experienceLevel: 'Executive',
      companySize: '150-1000 employees',
      industry: 'Enterprise Software',
      location: 'New York, NY',
    },
    goals: [
      'Accelerate sprint velocity while reducing wasted engineering rework',
      'Ensure cross-functional alignment between Product and Engineering',
      'Maintain clear governance and compliance for software tools',
    ],
    painPoints: [
      'Siloed teams building redundant solutions or misaligned features',
      'Tool fatigue and uncontrolled SaaS seat spend',
      'Lack of visibility into how customer feedback influences product roadmap',
    ],
    motivations: [
      'Measurable engineering throughput increase',
      'High team morale and reduced developer context switching',
      'Predictable release milestones',
    ],
    fearsAndRisks: [
      'Security risks or leakage of proprietary product data',
      'Expensive enterprise licenses that teams fail to adopt',
    ],
    typicalDay: 'Exec reviews, budget planning, roadmap prioritization meetings with C-suite, unblocking team roadblocks, and vendor evaluations.',
    keyTools: ['Jira Enterprise', 'Google Workspace', 'Datadog', 'GitHub Enterprise'],
    decisionCriteria: [
      'Security compliance (SOC2, private workspace data)',
      'High ROI with clear team time savings',
      'Easy integration with existing stack',
    ],
    quotes: [
      'Show me how this saves 5 hours per week per engineer, and you have my approval.',
      'We cannot afford to waste a 6-week cycle on features nobody asked for.',
    ],
    tags: ['Executive', 'Budget Holder', 'Decision Maker'],
    version: 1,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

async function safeReadFile<T>(filePath: string, defaultData: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
}

async function safeWriteFile<T>(filePath: string, data: T): Promise<void> {
  await ensureDataDir();
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tempPath, filePath);
}

// Product Context API
export async function getProductContext(): Promise<ProductContext> {
  return safeReadFile<ProductContext>(PRODUCT_FILE, DEFAULT_PRODUCT);
}

export async function saveProductContext(data: Partial<ProductContext>): Promise<ProductContext> {
  const current = await getProductContext();
  const updated: ProductContext = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await safeWriteFile(PRODUCT_FILE, updated);
  return updated;
}

// Persona API
export async function getPersonas(): Promise<Persona[]> {
  return safeReadFile<Persona[]>(PERSONAS_FILE, DEFAULT_PERSONAS);
}

export async function getPersonaById(id: string): Promise<Persona | null> {
  const personas = await getPersonas();
  return personas.find((p) => p.id === id) || null;
}

export async function createPersona(
  data: Omit<Persona, 'id' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<Persona> {
  const personas = await getPersonas();
  const now = new Date().toISOString();
  const newPersona: Persona = {
    ...data,
    id: `persona-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };

  personas.unshift(newPersona);
  await safeWriteFile(PERSONAS_FILE, personas);

  // Save initial revision
  await createRevision({
    personaId: newPersona.id,
    version: 1,
    changeSummary: 'Initial persona created',
    snapshot: newPersona,
  });

  return newPersona;
}

export async function updatePersona(
  id: string,
  data: Partial<Persona>,
  changeSummary: string = 'Updated persona fields'
): Promise<Persona | null> {
  const personas = await getPersonas();
  const index = personas.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = personas[index];
  const newVersion = (current.version || 1) + 1;
  const updated: Persona = {
    ...current,
    ...data,
    id: current.id,
    version: newVersion,
    updatedAt: new Date().toISOString(),
  };

  personas[index] = updated;
  await safeWriteFile(PERSONAS_FILE, personas);

  await createRevision({
    personaId: updated.id,
    version: newVersion,
    changeSummary,
    snapshot: updated,
  });

  return updated;
}

export async function deletePersona(id: string): Promise<boolean> {
  const personas = await getPersonas();
  const filtered = personas.filter((p) => p.id !== id);
  if (filtered.length === personas.length) return false;
  await safeWriteFile(PERSONAS_FILE, filtered);
  return true;
}

export async function duplicatePersona(id: string): Promise<Persona | null> {
  const persona = await getPersonaById(id);
  if (!persona) return null;

  return createPersona({
    ...persona,
    name: `${persona.name} (Copy)`,
    summary: persona.summary,
  });
}

// Revisions API
export async function getPersonaRevisions(personaId: string): Promise<PersonaRevision[]> {
  const allRevisions = await safeReadFile<PersonaRevision[]>(REVISIONS_FILE, []);
  return allRevisions
    .filter((r) => r.personaId === personaId)
    .sort((a, b) => b.version - a.version);
}

async function createRevision(
  item: Omit<PersonaRevision, 'id' | 'timestamp'>
): Promise<PersonaRevision> {
  const allRevisions = await safeReadFile<PersonaRevision[]>(REVISIONS_FILE, []);
  const newRev: PersonaRevision = {
    ...item,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  allRevisions.unshift(newRev);
  await safeWriteFile(REVISIONS_FILE, allRevisions);
  return newRev;
}
