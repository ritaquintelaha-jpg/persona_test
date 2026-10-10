export type PersonaArchetype =
  | 'Primary User'
  | 'Secondary User'
  | 'Buyer / Decision Maker'
  | 'Influencer'
  | 'Anti-Persona';

export interface ProductContext {
  id: string;
  name: string;
  tagline: string;
  description: string;
  industry: string;
  targetMarket: string[];       // Target segments e.g. ["B2B SaaS", "DevOps Engineers"]
  coreValueProps: string[];     // Key value propositions
  keyFeatures: string[];        // Main feature capabilities
  competitors: string[];        // Known alternatives / competitors
  updatedAt: string;
}

export interface PersonaDemographics {
  ageRange?: string;
  experienceLevel?: 'Junior' | 'Mid' | 'Senior' | 'Executive';
  companySize?: string;
  industry?: string;
  location?: string;
}

export interface Persona {
  id: string;
  productId?: string;
  name: string;                 // e.g. "DevOps Dave"
  role: string;                 // e.g. "Lead Infrastructure Engineer"
  archetype: PersonaArchetype;
  avatarEmoji?: string;         // e.g. "⚡", "🛠️", "💼"
  summary: string;              // 2-3 sentence overview

  demographics: PersonaDemographics;

  goals: string[];              // Core objectives and needs
  painPoints: string[];         // Frustrations and current blockers
  motivations: string[];        // What drives adoption
  fearsAndRisks: string[];      // Objections, concerns, perceived risks

  typicalDay?: string;          // Narrative workflow
  keyTools: string[];           // Software stack currently used
  decisionCriteria: string[];   // What makes them adopt or buy a product

  quotes: string[];             // Quotable statements representing their mindset

  tags: string[];
  version: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface PersonaRevision {
  id: string;
  personaId: string;
  version: number;
  changeSummary: string;
  snapshot: Persona;
  timestamp: string;
}
