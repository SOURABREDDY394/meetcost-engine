# MeetCost // 参謀 — Cost Strategist Engine

Welcome to the official submission for **MeetCost // 参謀** (Sanbou - Strategist). This project serves as a premium corporate cost intelligence platform, turning unstructured meeting schedules and calendar lists into rigorous cost attribution data, ROI markers, and budget recovery actions.

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

Modern businesses suffer from "meeting bloat"—unproductive, long status syncs with dozens of attendees that drain engineering budgets and developer focus. **MeetCost // 参謀** solves this by attributing a clear, dollar-amount cost to calendar entries, matching meetings to dynamic project budgets, and identifying leakages.

### Target Audience:
- **Executives / C-Level**: For bird's-eye visibility into meeting spend distribution across departments (Product, Engineering, Marketing) and ROI health metrics.
- **Project Managers**: For keeping track of active project budgets, predicting burn rates, and editing financial guardrails.
- **Engineering Leads / Tech Leads**: For reviewing meeting cost metrics and optimizing their team's sync schedules.
- **Engineers / Employees**: For calendar logging and importing team calendars without administrative complexity.

---

## Key Features

1. **Strategic Dashboard (Overview)**: 
   - Displays critical parameters: Total cost (INR), Potential savings, Unattributed cost, and Average meeting ROI.
   - Provides live charts showing cost distribution by project and budget burn rates.
2. **Google/Outlook Calendar Intake**: 
   - Supports dragging and dropping standard CSV calendar exports.
   - Calibrates cost metrics using employee role-based hourly cost bands.
3. **Workspace Autopilot AI**: 
   - A non-destructive background pipeline that scans meeting descriptions and keyword patterns to automatically link unattributed meetings to projects.
4. **Manual Cost Entry Form**: 
   - An entry layer for manual expense accounting. Calculates projected costs instantly using attendee sizes, cost bands, and meeting duration.
5. **Project & Budget Financial Controls**: 
   - Budget inspector highlighting actual spend, projected spend, and remaining budget limits.
   - Allows authorized managers to adjust monthly budgets and review expenditure breakdowns.
6. **calibrated AI Attribution Engine**: 
   - Uses AI (Llama 3.3 70B via Groq) to calculate matching confidence scores, logging an audit trail of keyword evidence, department matches, and logical reasoning.
7. **Actionable Anomaly Center**:
   - Lists high-severity budget anomalies (e.g., duplicate meetings, low-ROI weekly syncs) with actionable statuses.
8. **Interactive "Budget Rescue" Simulation**:
   - A visual playground showing "Before vs. After" geometry of meeting sizes, simulating immediate monthly savings by cutting redundant attendees.
9. **Scoped AI Cost Assistant**: 
   - An interactive sidebar chat window. The assistant's data scope is dynamically restricted to either the whole company or a single project depending on user credentials.

---

## Architectural Approach

We built a highly performant corporate terminal, focusing on visual excellence and solid software engineering practices:

### 1. Visual Strategy & Design Identity
Instead of standard SaaS templates, we drew inspiration from minimalist Japanese design:
- **Curated Palette**: Replaced generic colors with HSL-balanced Cream Vanilla (`#efe6dd`), deep Cherry Cola red (`#9a0002`), and ink Charcoal Black (`#0f0f10`) for the dark mode.
- **Aesthetic Structure**: Standardized on hard square elements (`0px` border-radius) representing Shoji screen paneling.
- **Premium Typography**: Linked Google Font `Cinzel` for sharp, high-contrast headings and `Noto Serif JP` for calligraphic, readable body text.

### 2. Governance: Role-Based Access Control (RBAC)
We integrated an interactive Profile Switcher to switch view layers and enforce operational boundaries:
- **SOURA / ADMIN (Administrator)**: Full administrative read-write access across all screens, controls, and resets.
- **KABIR SHAH (Product Lead / Project Manager)**:
  - Can only edit the budget of his assigned project (*Project Alpha*).
  - Other project budget controls show as locked (`BUDGET CONTROL LOCKED`).
  - Hides the AI Attribution and Budget Rescue tabs.
- **MIRA IYER (Senior Engineer / Tech Lead)**:
  - All views are read-only. Project budgets and AI attributions are locked.
  - Hides AI Attribution, Budget Rescue, and Anomalies.
- **AARAV MEHTA (Engineer / Employee)**:
  - Access is locked strictly to the Dashboard and manual Calendar Import views.
  - Hides data Autopilot, Workspace resets, and financial project settings.

### 3. Dynamic UUID Resolution
To avoid fragile configurations where static identifiers break in production, we wrote a React lifecycle hook that maps project names (like *Project Alpha*) to their actual generated UUIDs on page load. This dynamically grants Project Managers write permissions on their assigned project, regardless of how database IDs are generated.

---

## Tech Stack and Tools Used

- **Frontend Core**: Next.js 16.2 (Turbopack) & React 19
- **Database**: Supabase / PostgreSQL (for persistent cost ledger tables)
- **Large Language Model (LLM)**: Llama 3.3 70B via the Groq Cloud API
- **Styling**: Modern CSS Custom Properties & Vanilla CSS variables
- **Language**: TypeScript
- **State & Lifecycles**: React hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
