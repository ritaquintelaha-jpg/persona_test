'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Layers, Plus, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">Persona Studio</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Product AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Personas</span>
              </span>
            </Link>

            <Link
              href="/product"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/product'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Product Profile</span>
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/personas/new?mode=ai"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Propose</span>
          </Link>

          <Link
            href="/personas/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm shadow-slate-300"
          >
            <Plus className="w-4 h-4" />
            <span>New Persona</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
