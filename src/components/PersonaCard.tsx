'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Persona } from '@/types/persona';
import { getArchetypeColor, formatDateTime } from '@/lib/utils';
import {
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Target,
  AlertCircle,
  Clock,
  MoreVertical,
  Check,
  Files
} from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function PersonaCard({ persona, onDelete, onDuplicate }: PersonaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const colors = getArchetypeColor(persona.archetype);

  const handleCopyMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const md = `## ${persona.name} — ${persona.role} (${persona.archetype})
> ${persona.summary}

### Demographics
- Experience: ${persona.demographics.experienceLevel || 'N/A'}
- Company Size: ${persona.demographics.companySize || 'N/A'}
- Industry: ${persona.demographics.industry || 'N/A'}

### Top Goals
${persona.goals.map((g) => `- ${g}`).join('\n')}

### Pain Points
${persona.painPoints.map((p) => `- ${p}`).join('\n')}

### Quotes
${persona.quotes.map((q) => `> "${q}"`).join('\n\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Accent Bar */}
      <div className={`h-1.5 w-full ${colors.bg.replace('50', '500')}`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Card Header: Archetype & Menu */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
            {persona.archetype}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full px-3 py-2 text-left flex items-center space-x-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied Markdown!' : 'Copy Markdown'}</span>
                </button>
                <button
                  onClick={() => {
                    onDuplicate(persona.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center space-x-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Files className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duplicate Persona</span>
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => {
                    onDelete(persona.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center space-x-2 text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Identity & Avatar */}
        <div className="flex items-start space-x-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl border border-slate-200/60 shadow-inner shrink-0">
            {persona.avatarEmoji || '👤'}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/personas/${persona.id}`}
              className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block"
            >
              {persona.name}
            </Link>
            <p className="text-xs text-slate-600 font-medium truncate">{persona.role}</p>
            {persona.demographics.companySize && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {persona.demographics.companySize} • {persona.demographics.experienceLevel || 'Mid'}
              </p>
            )}
          </div>
        </div>

        {/* Short Summary */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {persona.summary}
        </p>

        {/* Goals & Frustrations preview */}
        <div className="space-y-2 mb-4 flex-1">
          {persona.goals.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs">
              <div className="flex items-center text-slate-700 font-semibold mb-1 space-x-1.5 text-[11px]">
                <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Primary Goal</span>
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-1">{persona.goals[0]}</p>
            </div>
          )}

          {persona.painPoints.length > 0 && (
            <div className="bg-rose-50/50 rounded-lg p-2.5 border border-rose-100/60 text-xs">
              <div className="flex items-center text-rose-800 font-semibold mb-1 space-x-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Core Friction</span>
              </div>
              <p className="text-rose-700 text-[11px] line-clamp-1">{persona.painPoints[0]}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {persona.tags && persona.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {persona.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>v{persona.version || 1} • {formatDateTime(persona.updatedAt)}</span>
        </span>

        <Link
          href={`/personas/${persona.id}`}
          className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>View Details</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
