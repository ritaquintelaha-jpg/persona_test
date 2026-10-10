'use client';

import { useState, useEffect } from 'react';
import { ProductContext } from '@/types/persona';
import { Layers, Save, Check, Plus, X, Sparkles, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function ProductProfilePage() {
  const [product, setProduct] = useState<ProductContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Temporary inputs for array fields
  const [newSegment, setNewSegment] = useState('');
  const [newValueProp, setNewValueProp] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  useEffect(() => {
    fetch('/api/product')
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save product context:', err);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: 'targetMarket' | 'coreValueProps' | 'keyFeatures' | 'competitors', value: string, setter: (val: string) => void) => {
    if (!product || !value.trim()) return;
    setProduct({
      ...product,
      [field]: [...product[field], value.trim()],
    });
    setter('');
  };

  const removeItem = (field: 'targetMarket' | 'coreValueProps' | 'keyFeatures' | 'competitors', index: number) => {
    if (!product) return;
    setProduct({
      ...product,
      [field]: product[field].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        Loading product intelligence context...
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Personas</span>
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Product Profile & Knowledge Context</h1>
              <p className="text-xs text-slate-500">
                This foundation grounds the AI when proposing and updating personas.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-md shadow-slate-300 transition-all disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Product Profile'}</span>
            </>
          )}
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-xs text-indigo-950">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>AI Persona Generation Engine:</strong> When you click <em>"Propose Persona"</em>, the AI reads your product description, segments, features, and value props below to craft highly realistic persona roles, objections, pain points, and tools tailored directly to what you are building.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Product Identity Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Core Product Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Industry / Category
              </label>
              <input
                type="text"
                value={product.industry}
                onChange={(e) => setProduct({ ...product, industry: e.target.value })}
                placeholder="e.g. Developer Tools, B2B SaaS, HealthTech"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              One-line Tagline
            </label>
            <input
              type="text"
              value={product.tagline}
              onChange={(e) => setProduct({ ...product, tagline: e.target.value })}
              placeholder="e.g. The fastest way to build, test, and ship agentic workflows"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deep Product Description & Problem Solved
            </label>
            <textarea
              rows={4}
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              placeholder="Describe what the product does, why it exists, and the key problem it solves..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Target Market Segments */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Target Market Segments
            </h2>
            <span className="text-[11px] text-slate-400">e.g. B2B SaaS, Seed Startups, DevOps</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.targetMarket.map((seg, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <span>{seg}</span>
                <button
                  type="button"
                  onClick={() => removeItem('targetMarket', idx)}
                  className="hover:text-indigo-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newSegment}
              onChange={(e) => setNewSegment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('targetMarket', newSegment, setNewSegment))}
              placeholder="Add segment..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => addItem('targetMarket', newSegment, setNewSegment)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Core Value Props */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Core Value Propositions & Differentiators
            </h2>
            <span className="text-[11px] text-slate-400">Why customers choose this product</span>
          </div>

          <div className="space-y-2">
            {product.coreValueProps.map((vp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <span>{vp}</span>
                <button
                  type="button"
                  onClick={() => removeItem('coreValueProps', idx)}
                  className="text-slate-400 hover:text-rose-600 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newValueProp}
              onChange={(e) => setNewValueProp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('coreValueProps', newValueProp, setNewValueProp))}
              placeholder="e.g. Cut sprint discovery time by 60% with instant synthesis"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => addItem('coreValueProps', newValueProp, setNewValueProp)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Key Features & Competitors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Key Features */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Key Features / Capabilities
            </h2>

            <div className="space-y-2">
              {product.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <span>{feat}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('keyFeatures', idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('keyFeatures', newFeature, setNewFeature))}
                placeholder="Add feature capability..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addItem('keyFeatures', newFeature, setNewFeature)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Competitors */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              5. Known Competitors / Alternatives
            </h2>

            <div className="flex flex-wrap gap-2">
              {product.competitors.map((comp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <span>{comp}</span>
                  <button
                    type="button"
                    onClick={() => removeItem('competitors', idx)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('competitors', newCompetitor, setNewCompetitor))}
                placeholder="e.g. Linear, Jira, Notion..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => addItem('competitors', newCompetitor, setNewCompetitor)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
