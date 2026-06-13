# MeetCost // 参謀 — Corporate Cost Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald?logo=supabase)](https://supabase.com/)
[![Groq](https://img.shields.io/badge/LLM-Llama%203.3%20via%20Groq-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

**MeetCost // 参謀** (Sanbou - *Strategist*) is a premium corporate cost intelligence platform designed to eliminate "meeting bloat" and optimize organizational spending. By ingesting unstructured calendar syncs, meeting lists, and attendee records, it attributes dollar-amount costs to meetings, tracks active project budgets, detects financial anomalies, and simulates immediate cost-recovery workflows.

---

## 🌟 Key Features

### 📊 1. Strategic Cost Dashboard
* **Spend Analytics**: Real-time monitoring of meeting costs (in INR/USD), potential savings, unattributed expenditure, and average ROI.
* **Live Burn Charts**: Dynamic visual representations of cost distribution by department, project alignment, and budget burn-rates.

### 📅 2. Calendar Intake & Role-Based Cost Bands
* **CSV Import**: Drag-and-drop support for exporting standard Google or Outlook calendars.
* **Calibrated Banding**: Auto-calculation of meeting costs using role-based hourly cost bands (e.g., Executive, Principal Engineer, Senior PM, Software Engineer).

### 🤖 3. Workspace Autopilot AI
* **Zero-Touch Attribution**: Background scanning of calendar entries, descriptions, and metadata.
* **Keyword Matching**: Automatically resolves and links unattributed syncs to existing project budgets using keyword matching patterns.

### 📝 4. Manual Cost Entry Layer
* **Pro-Active Estimation**: Live cost projection form for planning upcoming meetings based on attendee count, duration, and average team role bands.

### 💼 5. Project & Budget Inspector
* **Financial Controls**: Comprehensive list of active projects with indicators for allocated budget, actual spend, projected burn, and remaining headrooms.
* **Manager Controls**: Ability to adjust budgets and configure project guardrails on-the-fly.

### 🧠 6. Calibrated AI Attribution Engine
* **Confidence Scoring**: Uses **Llama 3.3 70B** (via Groq Cloud) to evaluate matching confidence.
* **Audit Trails**: Logs logical reasoning steps, keyword evidence, department matches, and confidence scoring breakdowns for transparency.

### 🚨 7. Anomaly & Action Center
* **Bloat Detection**: Lists high-severity anomalies, such as duplicate syncs, meetings with excessive attendees (>10), or low-ROI standing recurring check-ins.
* **Interactive Resolution**: Mark actions as acknowledged, dismissed, or trigger immediate budget rescue options.

### 🎮 8. "Budget Rescue" Simulator
* **Interactive Playground**: Interactive visual simulation showing "Before vs. After" attendee counts and sync frequencies.
* **Immediate Forecasts**: Drag sliders to trim attendees, shorten durations, or reduce frequencies, and see live projections of monthly budget savings.

### 💬 9. Scoped AI Cost Assistant
* **Sidebar Chat**: Instantly ask questions about company expenditures, budget status, or project health.
* **Security & Scope**: Data scope is dynamically adjusted based on the current user's profile permission level.

### 👤 10. Corporate Profile Switcher (RBAC)
* **Full RBAC Governance**: Test the app through different corporate lens states:
  * 👑 **SOURA (Admin)**: Full read-write capabilities, platform settings, resets, and configurations.
  * 👔 **KABIR SHAH (Product Lead / PM)**: Write access limited to assigned projects (e.g. *Project Alpha*); other projects are locked, and AI Attribution/Budget Rescue tabs are hidden.
  * 🎓 **MIRA IYER (Tech Lead)**: Read-only access to all dashboards; project budget editing is locked, administrative tabs are hidden.
  * 💻 **AARAV MEHTA (Engineer)**: Read-only dashboard view and manual CSV intake only; other sections are locked out.

---

## 🎨 Premium Visual Design System

Inspired by traditional **Japanese Shoji screen panels** and **Shogun-era minimalist layout aesthetics**:
* **Harmonious Palette**: Styled with **Cream Vanilla** (`#efe6dd`), deep **Cherry Cola red** (`#9a0002`), and rich **Charcoal Black** (`#0f0f10`) dark mode components.
* **Structure & Geometry**: Sharp, clean borders (`0px` border-radius) representing screen slides.
* **Typography**: Beautiful, high-contrast headings using Google Fonts **Cinzel** combined with highly legible **Noto Serif JP** body text.

---

## 🛠️ Tech Stack & Tools

* **Frontend**: Next.js 16.2 (Turbopack) & React 19
* **Database**: Supabase / PostgreSQL (for persistent ledger tracking)
* **LLM Core**: Llama 3.3 70B via the Groq Cloud API
* **Styling**: Vanilla CSS custom properties (custom-crafted, zero generic templates)
* **Language**: TypeScript
* **State Management**: Scoped React lifecycle hooks

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/SOURABREDDY394/meetcost-engine.git
cd meetcost-engine
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and copy variables from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Database Setup (Supabase)

Initialize your Supabase database using the SQL schema located in [supabase/schema.sql](file:///c:/Users/soura/OneDrive/Documents/lol/supabase/schema.sql).

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore **MeetCost // 参謀**.

---

## 📂 Project Structure

```txt
meetcost-engine/
├── .firecrawl/          # Wage dataset caching
├── public/              # Static assets and icons
├── src/
│   ├── app/
│   │   ├── api/         # Scoped API endpoints (AI, Autopilot, Assistant, Projects)
│   │   ├── globals.css  # Global variables and Shoji theme definition
│   │   ├── layout.tsx   # Typography and metadata integration
│   │   └── page.tsx     # Application entrypoint
│   ├── components/
│   │   └── meetcost-app.tsx # Main strategic dashboard and interface logic
│   └── lib/
│       ├── app-types.ts # TypeScript interfaces
│       ├── groq.ts      # LLM client integration
│       ├── local-store.ts # Session persistence utilities
│       ├── meetcost-data.ts # Initial mock data & presets
│       └── supabase/    # Supabase server & client initializers
└── supabase/
    └── schema.sql       # Database schema and initial seeds
```

---

## 📄 License

This project is licensed under the MIT License.
