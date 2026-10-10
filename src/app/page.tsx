'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Persona, ProductContext, PersonaArchetype } from '@/types/persona';
import PersonaCard from '@/components/PersonaCard';
import AIProposalModal from '@/components/AIProposalModal';
import { useRouter } from 'next/navigation';
import {
  Users,
  Sparkles,
  Plus,
  Search,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const ARCHETYPE_FILTERS: Array<'All' | PersonaArchetype> = [
  'All',
  'Primary User',
  'Secondary User',
  'Buyer / Decision Maker',
  'Influencer',
  'Anti-Persona',
];

export default function DashboardPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | PersonaArchetype>('All');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, prodRes] = await Promise.all([
        fetch('/api/personas'),
        fetch('/api/product'),
      ]);
      if (pRes.ok) setPersonas(await pRes.json());
      if (prodRes.ok) setProduct(await prodRes.json());
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    try {
      const res = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPersonas((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete persona:', e);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/personas/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const dup = await res.json();
        setPersonas((prev) => [dup, ...prev]);
      }
    } catch (e) {
      console.error('Failed to duplicate persona:', e);
    }
  };

  const handleAcceptProposal = (proposal: Partial<Persona>) => {
    // Store proposal in sessionStorage and navigate to /personas/new
    sessionStorage.setItem('pending_ai_persona', JSON.stringify(proposal));
    router.push('/personas/new?source=ai');
  };

  const filteredPersonas = personas.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.archetype === activeFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.summary.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query)) ||
      p.keyTools.some((t) => t.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const countPrimary = personas.filter((p) => p.archetype === 'Primary User').length;
  const countBuyer = personas.filter((p) => p.archetype === 'Buyer / Decision Maker').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Top Product Banner */}
      {product && (
        <div className="mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Grounded Product Context</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {product.targetMarket.slice(0, 3).map((tm, idx) => (
                  <span key={idx} className="bg-white/10 text-slate-200 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                    {tm}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-xs shadow-md shadow-indigo-950/40 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Propose with AI</span>
              </button>
              <Link
                href="/product"
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 backdrop-blur-sm transition-all"
              >
                <span>Edit Product Info</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{personas.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Personas</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{countPrimary}</div>
            <div className="text-xs text-slate-500 font-medium">Primary Users</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{countBuyer}</div>
            <div className="text-xs text-slate-500 font-medium">Decision Makers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{personas.length - countPrimary - countBuyer}</div>
            <div className="text-xs text-slate-500 font-medium">Other Archetypes</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, tools, tags..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ARCHETYPE_FILTERS.map((arch) => (
            <button
              key={arch}
              onClick={() => setActiveFilter(arch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeFilter === arch
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {arch}
            </button>
          ))}
        </div>
      </div>

      {/* Personas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>
      ) : filteredPersonas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No personas found</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {search || activeFilter !== 'All'
              ? 'Try adjusting your search query or archetype filters.'
              : 'Start defining the target audiences for your product either manually or using our AI proposal engine.'}
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Propose with AI</span>
            </button>
            <Link
              href="/personas/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Manually</span>
            </Link>
          </div>
        </div>
      )}

      {/* AI Proposal Modal */}
      <AIProposalModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onAcceptProposal={handleAcceptProposal}
      />
    </div>
  );
}
