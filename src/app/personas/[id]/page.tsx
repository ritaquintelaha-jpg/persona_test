'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Persona, PersonaRevision, PersonaArchetype } from '@/types/persona';
import { getArchetypeColor, formatDateTime } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit3,
  Save,
  Trash2,
  Copy,
  Check,
  Sparkles,
  History,
  Target,
  AlertCircle,
  Briefcase,
  Quote,
  Wrench,
  Clock,
  Layers,
  FileText,
  Share2,
  X,
  Plus,
  Loader2
} from 'lucide-react';

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [revisions, setRevisions] = useState<PersonaRevision[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [aiAssistingField, setAiAssistingField] = useState<string | null>(null);

  // Form edit states
  const [formData, setFormData] = useState<Partial<Persona>>({});

  useEffect(() => {
    fetchPersona();
    fetchRevisions();
  }, [id]);

  const fetchPersona = async () => {
    try {
      const res = await fetch(`/api/personas/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data: Persona = await res.json();
      setPersona(data);
      setFormData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async () => {
    try {
      const res = await fetch(`/api/personas/${id}/revisions`);
      if (res.ok) setRevisions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!persona) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/personas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _changeSummary: changeSummary.trim() || 'Updated persona fields',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setPersona(updated);
        setFormData(updated);
        setIsEditing(false);
        setChangeSummary('');
        fetchRevisions();
      }
    } catch (e) {
      console.error('Failed to update persona:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/');
    } catch (e) {
      console.error('Failed to delete persona:', e);
    }
  };

  const handleCopyMarkdown = () => {
    if (!persona) return;
    const md = `# ${persona.name} — ${persona.role}
**Archetype:** ${persona.archetype} | **Version:** v${persona.version}

> ${persona.summary}

## Demographics
- **Experience:** ${persona.demographics.experienceLevel || 'N/A'}
- **Company Size:** ${persona.demographics.companySize || 'N/A'}
- **Industry:** ${persona.demographics.industry || 'N/A'}
- **Location:** ${persona.demographics.location || 'N/A'}

## Core Goals
${persona.goals.map((g) => `- ${g}`).join('\n')}

## Pain Points & Frustrations
${persona.painPoints.map((p) => `- ${p}`).join('\n')}

## Motivations
${persona.motivations.map((m) => `- ${m}`).join('\n')}

## Fears & Objections
${persona.fearsAndRisks.map((f) => `- ${f}`).join('\n')}

## Day in the Life
${persona.typicalDay || 'N/A'}

## Tools & Ecosystem
${persona.keyTools.map((t) => `- ${t}`).join('\n')}

## Quotable Voice
${persona.quotes.map((q) => `> "${q}"`).join('\n\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAIAssist = async (field: 'goals' | 'painPoints' | 'motivations' | 'quotes') => {
    if (!persona) return;
    setAiAssistingField(field);
    try {
      const res = await fetch('/api/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          field,
          instruction: `Suggest 2 additional high-leverage realistic items based on our product space.`,
        }),
      });

      if (res.ok) {
        const { suggestions } = await res.json();
        setFormData((prev) => ({
          ...prev,
          [field]: suggestions,
        }));
        setIsEditing(true);
      }
    } catch (e) {
      console.error('AI Assist error:', e);
    } finally {
      setAiAssistingField(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading persona...
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-700">
        Persona not found.{' '}
        <Link href="/" className="text-indigo-600 font-semibold underline">
          Return to gallery
        </Link>
      </div>
    );
  }

  const colors = getArchetypeColor(formData.archetype || persona.archetype);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Personas</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900">{persona.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
              {persona.archetype}
            </span>
            <button
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>v{persona.version} ({revisions.length} revs)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Export MD'}</span>
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Persona</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setFormData(persona);
                  setIsEditing(false);
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            title="Delete Persona"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editing Change Summary Input */}
      {isEditing && (
        <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-medium">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Describe this update for version history:</span>
          </div>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Added security objections after enterprise customer interview"
            className="flex-1 max-w-md px-3 py-1.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      )}

      {/* Persona Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className={`h-2.5 w-full ${colors.bg.replace('50', '500')}`} />

        <div className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Overview & Identity */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl border border-slate-200 shadow-inner shrink-0">
              {persona.avatarEmoji || '👤'}
            </div>

            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-3 py-1.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="px-3 py-1.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl"
                    placeholder="Role"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{persona.name}</h2>
                  <p className="text-sm text-slate-600 font-medium">{persona.role}</p>
                </div>
              )}

              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  {persona.summary}
                </p>
              )}

              {/* Demographics Badges */}
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                  🏢 {persona.demographics.companySize || '50-250 employees'}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                  💼 {persona.demographics.experienceLevel || 'Senior'}
                </span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                  🌐 {persona.demographics.industry || 'Tech'}
                </span>
                {persona.demographics.location && (
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    📍 {persona.demographics.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Goals & Pain Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goals */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Goals & Core Needs</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAIAssist('goals')}
                  disabled={aiAssistingField === 'goals'}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {aiAssistingField === 'goals' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>AI Suggest</span>
                </button>
              </div>

              <ul className="space-y-2 text-xs text-slate-700">
                {(isEditing ? formData.goals : persona.goals)?.map((goal, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => {
                          const next = [...(formData.goals || [])];
                          next[idx] = e.target.value;
                          setFormData({ ...formData, goals: next });
                        }}
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    ) : (
                      <span>{goal}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pain Points */}
            <div className="bg-rose-50/40 rounded-2xl p-5 border border-rose-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Pain Points & Friction</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAIAssist('painPoints')}
                  disabled={aiAssistingField === 'painPoints'}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                >
                  {aiAssistingField === 'painPoints' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>AI Suggest</span>
                </button>
              </div>

              <ul className="space-y-2 text-xs text-rose-900">
                {(isEditing ? formData.painPoints : persona.painPoints)?.map((pain, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={pain}
                        onChange={(e) => {
                          const next = [...(formData.painPoints || [])];
                          next[idx] = e.target.value;
                          setFormData({ ...formData, painPoints: next });
                        }}
                        className="flex-1 px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-xs"
                      />
                    ) : (
                      <span>{pain}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 3: Daily Workflow & Tech Ecosystem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Typical Workflow & Routine</span>
              </h3>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={formData.typicalDay || ''}
                  onChange={(e) => setFormData({ ...formData, typicalDay: e.target.value })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {persona.typicalDay || 'No workflow narrative specified.'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Wrench className="w-4 h-4 text-slate-500" />
                <span>Current Tech Stack & Tools</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(isEditing ? formData.keyTools : persona.keyTools)?.map((tool, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Adoption & Buying Criteria
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {(isEditing ? formData.decisionCriteria : persona.decisionCriteria)?.map((crit, idx) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Quotable Voice */}
          {persona.quotes && persona.quotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Quote className="w-4 h-4 text-indigo-600" />
                <span>Persona Voice & Quotables</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(isEditing ? formData.quotes : persona.quotes)?.map((quote, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-xs italic text-slate-700"
                  >
                    "{quote}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version History Drawer / Modal */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Revision History</h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {revisions.length === 0 ? (
                <p className="text-xs text-slate-500">No previous revisions recorded yet.</p>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Version {rev.version}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(rev.timestamp)}</span>
                    </div>
                    <p className="text-slate-600">{rev.changeSummary}</p>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
