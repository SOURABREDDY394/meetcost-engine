# MeetCost // 参謀 — Cost Strategist Engine

---

## Attendee Details

**Name:** [Your Full Name]
**GitHub Username:** [Your GitHub Username]
**LinkedIn Profile:** [Your LinkedIn Profile Link]
**GitHub Project Repository:** [Your GitHub Project Repository Link]

---

## Problem Statement Selected

```txt
HR Cost Intelligence Engine
```

---

## Project Description

**MeetCost // 参謀** is a premium, high-fidelity corporate cost intelligence dashboard designed to convert calendar activity into actionable project spend, ROI signals, and budget recovery recommendations. 

* **What is it?**: A real-time HR meeting cost tracker and strategist dashboard.
* **Who is it for?**: Enterprises, executives, PMs, and engineering leaders seeking to identify financial leakages from meeting bloat.
* **What problem does it solve?**: Unattributed developer-hour costs, meeting overhead, and low-ROI meetings that drain project budgets.
* **How does it help?**: Provides automated AI attribution, budget forecasts, anomaly detection alerts, interactive "Budget Rescue" simulation scenarios, and role-based views.

---

## Approach

We approached this solution by constructing a high-performance, double-mode (light/dark) enterprise web application with dynamic permissions.

1. **Strategic Aesthetics**: Built with a sleek, minimalist Japanese "Sanbou" (Strategist) aesthetic utilizing Cream Vanilla, Cherry Cola Red, and Charcoal Black. Standard components use a custom borderless square layout (0px border-radius) representing Shoji screen structures.
2. **Role-Based Access Control (RBAC)**: Integrated a dynamic profile switcher (impersonation menu) to swap perspectives instantly:
   - **Soura / Admin**: Full administrative and write access.
   - **Kabir Shah (Project Manager)**: Can only modify budgets and view metrics for his assigned project (*Project Alpha*). Other views like AI Attribution and Budget Rescue are hidden.
   - **Mira Iyer (Tech Lead)**: Accesses project dashboards but all budgets are read-only.
   - **Aarav Mehta (Employee)**: Can only view the Dashboard and import calendars; Autopilot and workspace resets are hidden.
3. **Dynamic ID Mapping**: The application queries database tables (Supabase/PostgreSQL) and maps Project Manager scopes dynamically to their UUIDs to enforce read-write vs. read-only permissions across active views.
4. **Cost Assistant Integration**: Implemented a side-rail AI strategist chat powered by Groq Llama 3.3. It answers workspace budget queries, dynamically restricted by the logged-in user's active permissions.

---

## Tech Stack and Tools Used

- **Framework**: Next.js 16 (with Turbopack)
- **Database**: Supabase / PostgreSQL (for live data persistence)
- **AI Model & Inference**: Groq Cloud API (Llama 3.3 70B model)
- **Styling**: Tailwind CSS & Custom CSS variables
- **State Management**: React Hooks & Contexts
- **Language**: TypeScript
