# Persona Studio

An autonomous, full-stack product persona management system built with **Next.js 14**, **React**, **Tailwind CSS**, and **Google Gemini AI**.

---

## 🌟 Key Features

1. **In-App Product Profile Hub (`/product`)**
   - Centralize your product context: description, target markets, value propositions, key features, and competitors.
   - All AI proposals dynamically ground themselves in this profile.

2. **Dual-Path Persona Creation (`/personas/new`)**
   - **Manual Builder**: Deep, sectioned editor for demographics, core goals, friction/pain points, ecosystem tooling, and quotables.
   - **AI Persona Proposal Engine**: Synthesize rich, realistic persona drafts directly from your product profile with 1-click adoption.

3. **Persona Lifecycle & Version History (`/personas/[id]`)**
   - Track every update with automated revision versioning and change summaries (`v1`, `v2`, ...).
   - In-editor AI co-pilot assists (e.g., *"AI Suggest More Pain Points"*, *"AI Suggest Goals"*).
   - Instant Markdown and JSON export for PRDs, Notion docs, or engineering tickets.

4. **Gallery & Search Dashboard (`/`)**
   - Filter by archetypes: *Primary User*, *Secondary User*, *Buyer / Decision Maker*, *Influencer*, *Anti-Persona*.
   - Live search across roles, names, tools, and tags.

---

## 🚀 Running the App

### 1. Start Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. (Optional) Configure Gemini API Key
To connect directly to live Gemini generative inference models:
1. Copy or create `.env.local`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
*(Note: If no API key is provided, the system seamlessly uses its built-in context-grounded synthesis engine, so all features function immediately without any external setup!)*

---

## 📁 Project Architecture
```
Persona/
├── .data/                  # Persistent JSON storage (personas, product, revisions)
├── src/
│   ├── app/
│   │   ├── api/            # REST API endpoints (personas, product, ai/propose, ai/refine)
│   │   ├── personas/       # New and Detail/Edit persona studio pages
│   │   ├── product/        # Product Profile knowledge configuration page
│   │   ├── layout.tsx      # Global responsive layout with Navbar
│   │   └── page.tsx        # Persona Gallery & Search Dashboard
│   ├── components/         # PersonaCard, Navbar, AIProposalModal
│   ├── lib/                # Storage engine, Gemini AI client, styling utils
│   └── types/              # Persona & ProductContext TypeScript definitions
└── package.json
```