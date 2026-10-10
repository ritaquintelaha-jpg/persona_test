'use client';

import { useState } from 'react';
import { Persona, PersonaArchetype } from '@/types/persona';
import { Sparkles, Loader2, Check, RefreshCw, X, ArrowRight, UserCheck } from 'lucide-react';
import { getArchetypeColor } from '@/lib/utils';

interface AIProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptProposal: (proposal: Partial<Persona>) => void;
}

const ARCHETYPES: PersonaArchetype[] = [
  'Primary User',
  'Secondary User',
  'Buyer / Decision Maker',
  'Influencer',
  'Anti-Persona',
];

export default function AIProposalModal({
  isOpen,
  onClose,
  onAcceptProposal,
}: AIProposalModalProps) {
  const [selectedArchetype, setSelectedArchetype] = useState<PersonaArchetype>('Primary User');
  const [focusPrompt, setFocusPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Partial<Persona> | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archetype: selectedArchetype,
          focusPrompt: focusPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate proposal');
      const data = await res.json();
      setProposal(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI engine');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (proposal) {
      onAcceptProposal(proposal);
      onClose();
    }
  };

  const colors = proposal?.archetype ? getArchetypeColor(proposal.archetype) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Persona Proposal Engine</h3>
              <p className="text-xs text-slate-500">Synthesizes a realistic persona grounded in your Product Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!proposal ? (
            /* Setup Step */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  1. Select Target Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ARCHETYPES.map((arch) => (
                    <button
                      key={arch}
                      type="button"
                      onClick={() => setSelectedArchetype(arch)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                        selectedArchetype === arch
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {arch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  2. Optional Focus or Specific Role Guidance
                </label>
                <textarea
                  value={focusPrompt}
                  onChange={(e) => setFocusPrompt(e.target.value)}
                  placeholder="e.g. 'Enterprise security evaluator concerned with compliance' or 'Startup founder wearing multiple hats'..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="bg-indigo-50/60 rounded-xl p-3.5 border border-indigo-100 text-xs text-indigo-900">
                <span className="font-semibold block mb-0.5">💡 Grounded in your Product Profile</span>
                The AI will use your product description, target segments, key features, and value props to craft a high-fidelity profile.
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Proposal Result Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Proposed Persona Draft</span>
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl border border-slate-200 shadow-sm shrink-0">
                    {proposal.avatarEmoji || '👤'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-bold text-slate-900">{proposal.name}</h4>
                      {colors && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}>
                          {proposal.archetype}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{proposal.role}</p>
                    <p className="text-xs text-slate-500 mt-1">{proposal.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                    <span className="font-semibold text-slate-800 block mb-1.5">🎯 Key Goals</span>
                    <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                      {proposal.goals?.slice(0, 3).map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                    <span className="font-semibold text-rose-800 block mb-1.5">⚠️ Pain Points</span>
                    <ul className="space-y-1 text-rose-700 text-[11px] list-disc list-inside">
                      {proposal.painPoints?.slice(0, 3).map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {proposal.quotes && proposal.quotes.length > 0 && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-xs italic text-slate-600">
                    "{proposal.quotes[0]}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>

          {!proposal ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Persona...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Propose Persona Profile</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Adopt & Load into Editor</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
