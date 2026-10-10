'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Persona, PersonaArchetype } from '@/types/persona';
import AIProposalModal from '@/components/AIProposalModal';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  Save,
  Plus,
  X,
  Target,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Smile,
  Quote,
  CheckCircle2,
  Wrench,
  Loader2
} from 'lucide-react';

const ARCHETYPES: PersonaArchetype[] = [
  'Primary User',
  'Secondary User',
  'Buyer / Decision Maker',
  'Influencer',
  'Anti-Persona',
];

const EMOJI_OPTIONS = ['🎯', '⚡', '💻', '💼', '🚀', '🛠️', '🔬', '🎨', '📈', '🛡️', '📊', '🤝'];

function NewPersonaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basics' | 'needs' | 'workflow' | 'quotes'>('basics');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [archetype, setArchetype] = useState<PersonaArchetype>('Primary User');
  const [avatarEmoji, setAvatarEmoji] = useState('🎯');
  const [summary, setSummary] = useState('');

  // Demographics
  const [experienceLevel, setExperienceLevel] = useState<'Junior' | 'Mid' | 'Senior' | 'Executive'>('Mid');
  const [companySize, setCompanySize] = useState('50-250 employees');
  const [industry, setIndustry] = useState('Technology');
  const [location, setLocation] = useState('');

  // Arrays
  const [goals, setGoals] = useState<string[]>(['']);
  const [painPoints, setPainPoints] = useState<string[]>(['']);
  const [motivations, setMotivations] = useState<string[]>(['']);
  const [fearsAndRisks, setFearsAndRisks] = useState<string[]>(['']);

  // Workflow
  const [typicalDay, setTypicalDay] = useState('');
  const [keyTools, setKeyTools] = useState<string[]>(['Slack', 'Figma']);
  const [decisionCriteria, setDecisionCriteria] = useState<string[]>(['']);

  // Quotes & Tags
  const [quotes, setQuotes] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['Core']);

  useEffect(() => {
    const rawPending = sessionStorage.getItem('pending_ai_persona');
    if (rawPending) {
      try {
        const parsed: Partial<Persona> = JSON.parse(rawPending);
        applyProposal(parsed);
        sessionStorage.removeItem('pending_ai_persona');
      } catch (e) {
        console.error(e);
      }
    } else if (searchParams.get('mode') === 'ai') {
      setAiModalOpen(true);
    }
  }, [searchParams]);

  const applyProposal = (p: Partial<Persona>) => {
    if (p.name) setName(p.name);
    if (p.role) setRole(p.role);
    if (p.archetype) setArchetype(p.archetype);
    if (p.avatarEmoji) setAvatarEmoji(p.avatarEmoji);
    if (p.summary) setSummary(p.summary);

    if (p.demographics) {
      if (p.demographics.experienceLevel) setExperienceLevel(p.demographics.experienceLevel);
      if (p.demographics.companySize) setCompanySize(p.demographics.companySize);
      if (p.demographics.industry) setIndustry(p.demographics.industry);
      if (p.demographics.location) setLocation(p.demographics.location);
    }

    if (p.goals && p.goals.length > 0) setGoals(p.goals);
    if (p.painPoints && p.painPoints.length > 0) setPainPoints(p.painPoints);
    if (p.motivations && p.motivations.length > 0) setMotivations(p.motivations);
    if (p.fearsAndRisks && p.fearsAndRisks.length > 0) setFearsAndRisks(p.fearsAndRisks);

    if (p.typicalDay) setTypicalDay(p.typicalDay);
    if (p.keyTools && p.keyTools.length > 0) setKeyTools(p.keyTools);
    if (p.decisionCriteria && p.decisionCriteria.length > 0) setDecisionCriteria(p.decisionCriteria);

    if (p.quotes && p.quotes.length > 0) setQuotes(p.quotes);
    if (p.tags && p.tags.length > 0) setTags(p.tags);
  };

  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const removeArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setError('Please provide at least a name and role for this persona.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: Omit<Persona, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: name.trim(),
      role: role.trim(),
      archetype,
      avatarEmoji,
      summary: summary.trim(),
      demographics: {
        experienceLevel,
        companySize,
        industry,
        location: location.trim(),
      },
      goals: goals.map((g) => g.trim()).filter(Boolean),
      painPoints: painPoints.map((p) => p.trim()).filter(Boolean),
      motivations: motivations.map((m) => m.trim()).filter(Boolean),
      fearsAndRisks: fearsAndRisks.map((f) => f.trim()).filter(Boolean),
      typicalDay: typicalDay.trim(),
      keyTools: keyTools.map((t) => t.trim()).filter(Boolean),
      decisionCriteria: decisionCriteria.map((d) => d.trim()).filter(Boolean),
      quotes: quotes.map((q) => q.trim()).filter(Boolean),
      tags: tags.map((t) => t.trim()).filter(Boolean),
      status: 'active',
    };

    try {
      const res = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create persona');
      const saved = await res.json();
      router.push(`/personas/${saved.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Personas</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create New Persona</h1>
          <p className="text-xs text-slate-500">
            Define target user attributes manually or let AI propose a profile from your product specs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Propose with AI</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-300 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Creating...' : 'Save Persona'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('basics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'basics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>1. Identity & Role</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('needs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'needs'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>2. Goals & Frustrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'workflow'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>3. Workflow & Tools</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'quotes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Quote className="w-3.5 h-3.5" />
          <span>4. Quotes & Tags</span>
        </button>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: BASICS */}
        {activeTab === 'basics' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identity & Demographics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Persona Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Role / Title *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Security Architect"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Archetype Category
                </label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value as PersonaArchetype)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {ARCHETYPES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Avatar Emoji
                </label>
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xl border border-slate-200 shrink-0">
                    {avatarEmoji}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setAvatarEmoji(em)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                          avatarEmoji === em
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Executive Persona Summary
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2-3 sentence overview describing their core focus, day-to-day context, and relation to this product space..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote / NYC"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEEDS & FRUSTRATIONS */}
        {activeTab === 'needs' && (
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Primary Goals & Objectives</span>
                  </h3>
                  <p className="text-xs text-slate-500">What are they actively striving to achieve?</p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem(setGoals)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="space-y-2">
                {goals.map((goal, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => handleArrayChange(setGoals, idx, e.target.value)}
                      placeholder="e.g. Automate manual telemetry reports across clusters"
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setGoals, idx)}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pain Points */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Pain Points & Frustrations</span>
                  </h3>
                  <p className="text-xs text-slate-500">What bottlenecks drive them crazy right now?</p>
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem(setPainPoints)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Pain Point</span>
                </button>
              </div>

              <div className="space-y-2">
                {painPoints.map((pain, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input
                      type="text"
                      value={pain}
                      onChange={(e) => handleArrayChange(setPainPoints, idx, e.target.value)}
                      placeholder="e.g. Lack of real-time visibility causing repeated sprint delays"
                      className="flex-1 px-3.5 py-2 text-xs bg-rose-50/30 border border-rose-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    {painPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setPainPoints, idx)}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Motivations & Fears */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Motivations
                  </h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem(setMotivations)}
                    className="text-[11px] font-semibold text-indigo-600"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {motivations.map((m, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleArrayChange(setMotivations, idx, e.target.value)}
                        placeholder="e.g. Promotion, time savings..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      {motivations.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setMotivations, idx)}>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Fears & Objections
                  </h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem(setFearsAndRisks)}
                    className="text-[11px] font-semibold text-slate-600"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2">
                  {fearsAndRisks.map((f, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <input
                        type="text"
                        value={f}
                        onChange={(e) => handleArrayChange(setFearsAndRisks, idx, e.target.value)}
                        placeholder="e.g. Data leak, steep learning curve..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      {fearsAndRisks.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setFearsAndRisks, idx)}>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKFLOW & TOOLS */}
        {activeTab === 'workflow' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Day-in-the-Life & Ecosystem
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Typical Day Narrative
              </label>
              <textarea
                rows={4}
                value={typicalDay}
                onChange={(e) => setTypicalDay(e.target.value)}
                placeholder="Describe how their day starts, what meetings they attend, and when they encounter friction with existing systems..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tools in Their Current Stack
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayItem(setKeyTools)}
                    className="text-[11px] font-semibold text-indigo-600"
                  >
                    + Add Tool
                  </button>
                </div>
                <div className="space-y-2">
                  {keyTools.map((t, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <input
                        type="text"
                        value={t}
                        onChange={(e) => handleArrayChange(setKeyTools, idx, e.target.value)}
                        placeholder="e.g. Jira, GitHub, Notion..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      {keyTools.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setKeyTools, idx)}>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Decision & Adoption Criteria
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayItem(setDecisionCriteria)}
                    className="text-[11px] font-semibold text-indigo-600"
                  >
                    + Add Criteria
                  </button>
                </div>
                <div className="space-y-2">
                  {decisionCriteria.map((d, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => handleArrayChange(setDecisionCriteria, idx, e.target.value)}
                        placeholder="e.g. Fast setup, SOC2 compliance..."
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      {decisionCriteria.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem(setDecisionCriteria, idx)}>
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUOTES & TAGS */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Quote className="w-4 h-4 text-indigo-600" />
                  <span>Quotable Voice (Direct Quotes)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => addArrayItem(setQuotes)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Quote
                </button>
              </div>

              <div className="space-y-3">
                {quotes.map((q, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => handleArrayChange(setQuotes, idx, e.target.value)}
                      placeholder='e.g. "If our engineers cannot picture the user in 10 seconds, the user story has failed."'
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl italic focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    {quotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setQuotes, idx)}
                        className="p-2 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Tags & Taxonomy
                </h3>
                <button
                  type="button"
                  onClick={() => addArrayItem(setTags)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  + Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <div key={idx} className="inline-flex items-center space-x-1 bg-slate-100 rounded-lg px-2.5 py-1">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange(setTags, idx, e.target.value)}
                      placeholder="tag"
                      className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none w-20"
                    />
                    {tags.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem(setTags, idx)}>
                        <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-slate-500">
            Tip: You can update and version this persona anytime after creating it.
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-300 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Create Persona'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* AI Proposal Modal */}
      <AIProposalModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onAcceptProposal={applyProposal}
      />
    </div>
  );
}

export default function NewPersonaPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">Loading Persona Studio...</div>}>
      <NewPersonaForm />
    </Suspense>
  );
}
