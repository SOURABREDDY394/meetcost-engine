"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppAnomaly, AppData, AppMeeting, AppProject, ImportSummary } from "@/lib/app-types";

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  role: string;
  rank: string;
  assignedProjectName?: string;
  assignedProjectId?: string;
  allowedViews: View[];
}

export const profilesList: UserProfile[] = [
  {
    id: "user-admin",
    name: "SOURA / ADMIN",
    initials: "SA",
    role: "ADMINISTRATOR",
    rank: "ADMIN / EXECUTIVE",
    allowedViews: ["Dashboard", "Calendar Import", "Projects & Budgets", "AI Attribution", "Cost Ledger", "Budget Rescue", "Anomalies"],
  },
  {
    id: "user-project-lead",
    name: "KABIR SHAH",
    initials: "KS",
    role: "PRODUCT LEAD",
    rank: "PROJECT MANAGER",
    assignedProjectName: "Project Alpha",
    assignedProjectId: "project-001",
    allowedViews: ["Dashboard", "Calendar Import", "Projects & Budgets", "Cost Ledger", "Anomalies"],
  },
  {
    id: "user-tech-lead",
    name: "MIRA IYER",
    initials: "MI",
    role: "SENIOR ENGINEER",
    rank: "TECH LEAD",
    allowedViews: ["Dashboard", "Calendar Import", "Projects & Budgets", "Cost Ledger"],
  },
  {
    id: "user-employee",
    name: "AARAV MEHTA",
    initials: "AM",
    role: "ENGINEER",
    rank: "EMPLOYEE",
    allowedViews: ["Dashboard", "Calendar Import"],
  },
];

function ProfileSwitcherModal({
  isOpen,
  onClose,
  onSelectProfile,
  currentProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (profile: UserProfile) => void;
  currentProfile: UserProfile;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="panel max-w-md w-full p-6 bg-[var(--surface-solid)] border-2 border-[var(--line)] flex flex-col gap-5 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div>
            <p className="eyebrow">PERSPECTIVE OVERLAY</p>
            <h2 className="text-xl font-bold font-serif" style={{ fontFamily: "var(--font-serif)" }}>SELECT PROFILE</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            aria-label="Close profile switcher"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {profilesList.map((profile) => {
            const isSelected = profile.id === currentProfile.id;
            return (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile)}
                className={`w-full min-h-[76px] grid grid-cols-[48px_1fr] items-center gap-4 p-3 border transition-all text-left ${
                  isSelected 
                    ? "border-[var(--accent)] bg-[linear-gradient(90deg,rgba(154,0,2,0.1),transparent)]" 
                    : "border-[var(--line)] hover:bg-[var(--faint)]"
                }`}
                style={{ display: "grid", gridTemplateColumns: "48px 1fr" }}
              >
                <span className="w-10 h-10 flex items-center justify-center border border-[var(--line)] text-sm font-serif bg-[var(--navy)] font-bold text-[var(--accent)]">
                  {profile.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold font-serif uppercase tracking-wider text-[var(--ice)]" style={{ fontFamily: "var(--font-serif)" }}>
                    {profile.name}
                  </span>
                  <span className="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mt-1">
                    {profile.rank} • {profile.role}
                  </span>
                  <span className="text-[9px] text-[var(--dim)] mt-1">
                    {profile.allowedViews.length === 7 ? "All Systems Access" : `Access to ${profile.allowedViews.length} views`}
                    {profile.assignedProjectName && ` • Restricted to ${profile.assignedProjectName}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[var(--line)] pt-3 text-[10px] text-[var(--dim)] font-mono flex items-center justify-between">
          <span>ROLE-BASED VIEW CONTROL</span>
          <span>SELECT TO SWAP PERSPECTIVE</span>
        </div>
      </div>
    </div>
  );
}

type View = "Dashboard" | "Calendar Import" | "Projects & Budgets" | "AI Attribution" | "Cost Ledger" | "Budget Rescue" | "Anomalies";
type Theme = "dark" | "light";

const navItems: Array<{ id: string; label: View; short: string; icon: IconName }> = [
  { id: "01", label: "Dashboard", short: "Overview", icon: "grid" },
  { id: "02", label: "Calendar Import", short: "Data intake", icon: "upload" },
  { id: "03", label: "Projects & Budgets", short: "Controls", icon: "folder" },
  { id: "04", label: "AI Attribution", short: "Intelligence", icon: "ai" },
  { id: "05", label: "Cost Ledger", short: "Financial record", icon: "ledger" },
  { id: "06", label: "Budget Rescue", short: "Action layer", icon: "rescue" },
  { id: "07", label: "Anomalies", short: "Risk center", icon: "alert" },
];

type IconName = "grid" | "upload" | "folder" | "ai" | "ledger" | "rescue" | "alert" | "menu" | "close" | "sun" | "moon" | "refresh";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    upload: <><path d="M12 16V3m0 0L7 8m5-5 5 5" /><path d="M4 15v6h16v-6" /></>,
    folder: <path d="M3 6h7l2 3h9v11H3z" />,
    ai: <><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
    ledger: <><path d="M5 3h14v18H5z" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
    rescue: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><path d="M12 3v5m0 8v5M3 12h5m8 0h5" /></>,
    alert: <><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5m0 3v.2" /></>,
    menu: <path d="M3 7h18M3 12h18M3 17h18" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8.2 8.2 0 1 0 20 15.5z" />,
    refresh: <><path d="M20 7v5h-5" /><path d="M18.3 17A8 8 0 1 1 20 12" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function money(value: number, compact = false) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

function PageTitle({ index, kicker, title, detail }: { index: string; kicker: string; title: string; detail: string }) {
  return (
    <section className="page-title">
      <div className="mono"><span>{index}</span><span>{kicker}</span></div>
      <h1>{title}</h1>
      <p>{detail}</p>
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const coords = points.map((point, index) => `${(index / (points.length - 1)) * 100},${100 - point}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={coords} /><line x1="0" y1="99" x2="100" y2="99" /></svg>;
}

function Loader({ done }: { done: boolean }) {
  return (
    <div className={`mc-loader ${done ? "is-done" : ""}`} aria-hidden={done}>
      <div className="loader-orbit"><i /><i /><b /></div>
      <div className="mc-loader-logo">MEETCOST <span>参謀</span></div>
      <div className="mc-loader-status mono"><span>100%</span><i><b /></i><span>STRATEGIST READY</span></div>
    </div>
  );
}

function Dashboard({ data, onNavigate }: { data: AppData; onNavigate: (view: View) => void }) {
  const metrics = [
    { label: "Total meeting cost", value: money(data.metrics.totalCost), delta: `${data.metrics.meetingCount} meetings`, tone: "blue", points: [72, 66, 70, 48, 55, 34, 27] },
    { label: "Potential savings", value: money(data.metrics.potentialSavings), delta: `${Math.round(data.metrics.potentialSavings / Math.max(1, data.metrics.totalCost) * 100)}% recoverable`, tone: "mint", points: [82, 78, 64, 68, 45, 38, 22] },
    { label: "Unattributed cost", value: money(data.metrics.unattributedCost), delta: "Needs review", tone: "amber", points: [40, 53, 46, 63, 58, 72, 66] },
    { label: "Average meeting ROI", value: `${data.metrics.averageRoi} / 100`, delta: data.metrics.averageRoi >= 60 ? "Healthy" : "Below target", tone: "violet", points: [66, 58, 62, 48, 40, 33, 28] },
  ];
  const critical = data.anomalies.find((anomaly) => anomaly.status === "open") || data.anomalies[0];

  return (
    <div className="view-stack">
      <section className="command-hero">
        <div>
          <p className="eyebrow"><span className="status-dot" /> COST STRATEGIST ENGINE / LIVE</p>
          <h1>CALENDAR.<br /><span>STRATEGY.</span></h1>
        </div>
        <div className="hero-summary">
          <p>Turn calendar activity into project cost, ROI signals, and budget recovery actions with traceable strategist evidence.</p>
          <button className="outline-action" onClick={() => onNavigate("Calendar Import")}>IMPORT CALENDAR <span>↗</span></button>
        </div>
        <div className="hero-radar" aria-hidden="true"><i /><i /><b /></div>
        <div className="hero-tag mono">{data.organization.name} / INR</div>
      </section>

      <section className="metric-grid">
        {metrics.map((metric, index) => (
          <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
            <div className="metric-head mono"><span>0{index + 1}</span><span>{metric.delta}</span></div>
            <p>{metric.label}</p><strong>{metric.value}</strong><Sparkline points={metric.points} />
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel cost-distribution">
          <div className="panel-head"><div><p className="eyebrow">COST DISTRIBUTION</p><h2>Spend by project</h2></div><span className="mono">JUN / 2026</span></div>
          <div className="bar-chart">
            {data.projects.map((project, index) => (
              <div className={`bar-item project-${index}`} key={project.id}>
                <div className="bar-value mono">{money(project.used, true)}</div>
                <div className="bar-track"><i style={{ height: `${Math.min(94, 26 + project.used / Math.max(project.budget, 1) * 70)}%` }} /></div>
                <span className="mono">0{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="chart-key">{data.projects.map((project, index) => <span key={project.id}><b>0{index + 1}</b>{project.name.replace("Project ", "")}</span>)}</div>
        </article>

        <article className="panel budget-watch">
          <div className="panel-head"><div><p className="eyebrow">BUDGET WATCH</p><h2>Project burn</h2></div><button className="micro-button" onClick={() => onNavigate("Projects & Budgets")}>VIEW ALL</button></div>
          <div className="budget-list">
            {data.projects.map((project) => {
              const pct = Math.round(project.used / Math.max(project.budget, 1) * 100);
              return <button className="budget-row" key={project.id} onClick={() => onNavigate("Projects & Budgets")}><div><strong>{project.name}</strong><span className="mono">{project.priority} / {project.trend >= 0 ? "+" : ""}{project.trend}%</span></div><div className="budget-track"><i style={{ width: `${Math.min(100, pct)}%` }} /></div><b>{pct}%</b></button>;
            })}
          </div>
        </article>

        <article className="panel meeting-feed">
          <div className="panel-head"><div><p className="eyebrow">COST LEDGER</p><h2>High-cost meetings</h2></div><button className="micro-button" onClick={() => onNavigate("Cost Ledger")}>OPEN LEDGER</button></div>
          <div className="mini-table">
            {[...data.meetings].sort((a, b) => b.cost - a.cost).slice(0, 5).map((meeting, index) => (
              <button key={meeting.id} onClick={() => onNavigate("Cost Ledger")}><span className="mono">0{index + 1}</span><div><strong>{meeting.title}</strong><small>{meeting.project} / {meeting.attendees} attendees</small></div><b>{money(meeting.cost)}</b><span className={`risk-mark ${meeting.status}`} /></button>
            ))}
          </div>
        </article>

        <article className="panel anomaly-preview">
          <div className="panel-head"><div><p className="eyebrow">ANOMALY SIGNAL</p><h2>Budget leakage</h2></div><span className="signal-live mono"><i /> {String(data.metrics.activeAnomalies).padStart(2, "0")} ACTIVE</span></div>
          {critical && <div className="anomaly-focus"><span className="mono">{critical.severity} / {critical.type.replaceAll("_", " ")}</span><strong>{money(critical.saving)}</strong><p>{critical.title}</p><button className="solid-action" onClick={() => onNavigate("Budget Rescue")}>ENTER RESCUE MODE ↗</button></div>}
        </article>
      </section>
    </div>
  );
}

function CalendarImport({ projects, onRefresh, currentUser }: { projects: AppProject[]; onRefresh: () => Promise<void>; currentUser: UserProfile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState("");
  const [autopilot, setAutopilot] = useState<{ scanned: number; assigned: number; queued: number } | null>(null);
  const [autopilotBusy, setAutopilotBusy] = useState(false);
  const [meetingBusy, setMeetingBusy] = useState(false);
  const [clearBusy, setClearBusy] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "", projectId: "", department: "", duration: "30", attendeeCount: "4",
    roleName: "Engineer", hourlyCost: "1200", roi: "50", recurring: false,
  });

  async function importFile(file: File) {
    setBusy(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("/api/import", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed.");
      setSummary(result);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const csv = "title,start,duration_minutes,attendees,attendee_roles,project,department,recurring,description\nAlpha Design Review,2026-06-16T10:00:00+05:30,45,kabir@example.com;mira@example.com,Product Lead;Senior Engineer,Project Alpha,Product,true,Review design decisions";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "meetcost-import-template.csv"; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function runAutopilot() {
    setAutopilotBusy(true); setError("");
    try {
      const response = await fetch("/api/autopilot", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Autopilot failed.");
      setAutopilot(result);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Autopilot failed.");
    } finally {
      setAutopilotBusy(false);
    }
  }

  async function addMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMeetingBusy(true); setError("");
    try {
      const response = await fetch("/api/meetings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...meetingForm,
          duration: Number(meetingForm.duration),
          attendeeCount: Number(meetingForm.attendeeCount),
          hourlyCost: Number(meetingForm.hourlyCost),
          roi: Number(meetingForm.roi),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to add meeting.");
      setMeetingForm((current) => ({ ...current, title: "", department: "" }));
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to add meeting.");
    } finally {
      setMeetingBusy(false);
    }
  }

  async function clearDemoWorkspace() {
    if (!window.confirm("Remove every current meeting, project, anomaly, and sample employee? Cost bands will be kept. This cannot be undone.")) return;
    setClearBusy(true); setError("");
    try {
      const response = await fetch("/api/workspace/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "CLEAR_DEMO" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to clear workspace.");
      setSummary(null); setAutopilot(null);
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to clear workspace.");
    } finally {
      setClearBusy(false);
    }
  }

  return (
    <div className="view-stack">
      <PageTitle index="02" kicker="DATA WORKSPACE" title="Build your cost model." detail="Import a calendar, add expenses manually, or let Autopilot organize unstructured meeting data." />
      {currentUser.role === "ADMINISTRATOR" && (
        <section className="setup-strip">
          <div><span className="eyebrow">SELF-IMPLEMENTING DATA</span><h2>Run workspace Autopilot</h2><p>Scans meeting titles, descriptions, project hints, and existing keywords. Strong matches are assigned; ambiguous records stay in review.</p></div>
          <div className="autopilot-result mono">{autopilot ? <><b>{autopilot.scanned}</b> SCANNED <b>{autopilot.assigned}</b> ASSIGNED <b>{autopilot.queued}</b> REVIEW</> : "NON-DESTRUCTIVE / AUDITED"}</div>
          <button className="solid-action" onClick={runAutopilot} disabled={autopilotBusy}>{autopilotBusy ? "ANALYZING WORKSPACE..." : "RUN DATA AUTOPILOT"}</button>
        </section>
      )}
      {currentUser.role === "ADMINISTRATOR" && (
        <div className="clean-workspace"><div><span className="mono">READY FOR REAL DATA?</span><p>Remove the current sample projects and meetings. Your cost bands and Supabase connection stay intact.</p></div><button className="danger-action" onClick={clearDemoWorkspace} disabled={clearBusy}>{clearBusy ? "CLEARING..." : "START CLEAN WORKSPACE"}</button></div>
      )}
      <section className="import-layout">
        <button className={`upload-zone ${dragging ? "is-dragging" : ""} ${summary ? "is-complete" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void importFile(file); }}>
          <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
          <span className="upload-cross">{busy ? "…" : "+"}</span>
          <p className="eyebrow">{busy ? "IMPORTING" : summary ? "IMPORT COMPLETE" : "DROP CALENDAR EXPORT"}</p>
          <h2>{summary ? <>{summary.imported} MEETINGS<br />CALIBRATED</> : "CSV / GOOGLE / OUTLOOK"}</h2>
          <span className="mono">{summary ? `${money(summary.estimatedCost)} ESTIMATED COST DETECTED` : "CLICK TO SELECT A CSV FILE"}</span>
        </button>
        <div className="import-terminal panel">
          <div className="panel-head"><div><p className="eyebrow">IMPORT LOG</p><h2>Validation stream</h2></div><span className="mono">{busy ? "RUNNING" : "READY"}</span></div>
          <div className="terminal-lines mono">
            <span><b>01</b> Header mapping initialized <i>OK</i></span>
            <span><b>02</b> Meetings persisted <i>{summary?.imported ?? "--"}</i></span>
            <span><b>03</b> Recurring series detected <i>{summary?.recurring ?? "--"}</i></span>
            <span><b>04</b> Missing project hints <i>{summary?.missingProjects ?? "--"}</i></span>
            <span><b>05</b> Human review required <i>{summary?.needsReview ?? "--"}</i></span>
          </div>
          {error && <p className="form-error mono">{error}</p>}
          <div className="import-actions"><button className="outline-action" onClick={downloadTemplate}>DOWNLOAD TEMPLATE</button><button className="micro-button" onClick={() => inputRef.current?.click()}>SELECT CSV</button></div>
        </div>
      </section>
      <section className="manual-entry panel">
        <div className="panel-head"><div><p className="eyebrow">MANUAL COST ENTRY</p><h2>Add a meeting expense</h2></div><span className="mono">COST = PEOPLE × RATE × TIME</span></div>
        <form onSubmit={addMeeting} className="entry-form">
          <label><span>Meeting title</span><input required value={meetingForm.title} onChange={(event) => setMeetingForm({ ...meetingForm, title: event.target.value })} placeholder="Customer launch review" /></label>
          <label><span>Project</span><select value={meetingForm.projectId} onChange={(event) => setMeetingForm({ ...meetingForm, projectId: event.target.value })}><option value="">Unattributed / AI review</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label>
          <label><span>Department</span><input value={meetingForm.department} onChange={(event) => setMeetingForm({ ...meetingForm, department: event.target.value })} placeholder="Product" /></label>
          <label><span>Duration (min)</span><input type="number" min="5" value={meetingForm.duration} onChange={(event) => setMeetingForm({ ...meetingForm, duration: event.target.value })} /></label>
          <label><span>People</span><input type="number" min="1" value={meetingForm.attendeeCount} onChange={(event) => setMeetingForm({ ...meetingForm, attendeeCount: event.target.value })} /></label>
          <label><span>Role / cost band</span><input value={meetingForm.roleName} onChange={(event) => setMeetingForm({ ...meetingForm, roleName: event.target.value })} /></label>
          <label><span>Hourly cost (INR)</span><input type="number" min="0" value={meetingForm.hourlyCost} onChange={(event) => setMeetingForm({ ...meetingForm, hourlyCost: event.target.value })} /></label>
          <label><span>ROI score</span><input type="number" min="0" max="100" value={meetingForm.roi} onChange={(event) => setMeetingForm({ ...meetingForm, roi: event.target.value })} /></label>
          <label className="check-label"><input type="checkbox" checked={meetingForm.recurring} onChange={(event) => setMeetingForm({ ...meetingForm, recurring: event.target.checked })} /><span>Recurring meeting</span></label>
          <div className="entry-estimate"><span className="mono">ESTIMATED COST</span><strong>{money(Number(meetingForm.attendeeCount) * Number(meetingForm.hourlyCost) * Number(meetingForm.duration) / 60)}</strong></div>
          <button className="solid-action" disabled={meetingBusy}>{meetingBusy ? "ADDING..." : "ADD TO COST LEDGER"}</button>
        </form>
      </section>
      {summary && <section className="import-summary">{[[summary.imported, "MEETINGS IMPORTED"], [summary.recurring, "RECURRING FOUND"], [summary.missingProjects, "MISSING PROJECTS"], [summary.needsReview, "NEED HUMAN REVIEW"]].map(([value, label]) => <div key={label}><strong>{value}</strong><span className="mono">{label}</span></div>)}</section>}
    </div>
  );
}

function ProjectsBudgets({ projects, onRefresh, currentUser }: { projects: AppProject[]; onRefresh: () => Promise<void>; currentUser: UserProfile }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "");
  const project = projects.find((item) => item.id === selectedId) || projects[0];
  const [budget, setBudget] = useState(String(project?.budget || 0));
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newProject, setNewProject] = useState({ name: "", owner: "", team: "", priority: "medium", monthlyBudget: "", keywords: "" });
  const pct = project ? Math.round(project.used / Math.max(project.budget, 1) * 100) : 0;

  async function saveBudget() {
    if (!project) return;
    setSaving(true);
    await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ monthlyBudget: Number(budget) }) });
    await onRefresh();
    setSaving(false);
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreateBusy(true); setCreateError("");
    try {
      const response = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          monthlyBudget: Number(newProject.monthlyBudget),
          keywords: newProject.keywords.split(","),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create project.");
      setShowCreate(false);
      setNewProject({ name: "", owner: "", team: "", priority: "medium", monthlyBudget: "", keywords: "" });
      await onRefresh();
    } catch (caught) {
      setCreateError(caught instanceof Error ? caught.message : "Unable to create project.");
    } finally {
      setCreateBusy(false);
    }
  }

  const createForm = <form className="create-project panel" onSubmit={createProject}>
    <label><span>Project name</span><input required value={newProject.name} onChange={(event) => setNewProject({ ...newProject, name: event.target.value })} placeholder="Project Atlas" /></label>
    <label><span>Owner</span><input value={newProject.owner} onChange={(event) => setNewProject({ ...newProject, owner: event.target.value })} placeholder="Owner name" /></label>
    <label><span>Team</span><input value={newProject.team} onChange={(event) => setNewProject({ ...newProject, team: event.target.value })} placeholder="Product Engineering" /></label>
    <label><span>Monthly budget</span><input required type="number" min="0" value={newProject.monthlyBudget} onChange={(event) => setNewProject({ ...newProject, monthlyBudget: event.target.value })} /></label>
    <label><span>Priority</span><select value={newProject.priority} onChange={(event) => setNewProject({ ...newProject, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
    <label><span>AI matching keywords</span><input value={newProject.keywords} onChange={(event) => setNewProject({ ...newProject, keywords: event.target.value })} placeholder="atlas, mobile, launch" /></label>
    {createError && <p className="form-error mono">{createError}</p>}
    <button className="solid-action" disabled={createBusy}>{createBusy ? "CREATING..." : "CREATE PROJECT"}</button>
  </form>;

  if (!project) {
    return <div className="view-stack">
      <PageTitle index="03" kicker="FINANCIAL CONTROLS" title="Create your first project." detail="Define a budget and matching keywords, then import or add meetings to build the cost ledger." />
      {createForm}
      {currentUser.role === "ADMINISTRATOR" && createForm}
    </div>;
  }

  return (
    <div className="view-stack">
      <PageTitle index="03" kicker="FINANCIAL CONTROLS" title="Projects & Budgets" detail="See exactly where meeting spend came from, then change the project or its financial guardrails." />
      <div className="section-actions">
        <span className="mono">{projects.length} ACTIVE PROJECTS</span>
        {currentUser.role === "ADMINISTRATOR" && (
          <button className="solid-action" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? "CLOSE FORM" : "+ CREATE PROJECT"}
          </button>
        )}
      </div>
      {showCreate && currentUser.role === "ADMINISTRATOR" && createForm}
      <section className="project-control">
        <div className="project-selector">{projects.map((item, index) => <button className={project.id === item.id ? "is-active" : ""} onClick={() => { setSelectedId(item.id); setBudget(String(item.budget)); }} key={item.id}><span className="mono">0{index + 1}</span><strong>{item.name}</strong><span className="mono">{Math.round(item.used / Math.max(item.budget, 1) * 100)}% USED</span></button>)}</div>
        <article className="project-inspector">
          <div className="inspector-grid" aria-hidden="true" />
          <div className="inspector-top"><span className="eyebrow">ACTIVE PROJECT</span><span className="priority-chip mono">{project.priority} PRIORITY</span></div>
          <h2>{project.name}</h2><div className="giant-percent">{pct}<span>%</span></div><div className="budget-line"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>
          <div className="project-facts"><div><span className="mono">CURRENT SPEND</span><strong>{money(project.used)}</strong></div><div><span className="mono">MONTHLY BUDGET</span><strong>{money(project.budget)}</strong></div><div><span className="mono">PROJECTED SPEND</span><strong>{money(project.projected)}</strong></div></div>
          <div className="project-facts project-facts-secondary"><div><span className="mono">MEETINGS</span><strong>{project.meetingCount}</strong></div><div><span className="mono">AVG / MEETING</span><strong>{money(project.averageMeetingCost)}</strong></div><div><span className="mono">BUDGET REMAINING</span><strong>{money(Math.max(0, project.budget - project.used))}</strong></div></div>
          <div className="budget-editor">
            {currentUser.role === "ADMINISTRATOR" || (currentUser.role === "PRODUCT LEAD" && project.id === currentUser.assignedProjectId) ? (
              <>
                <label>
                  <span className="mono">EDIT MONTHLY BUDGET</span>
                  <input type="number" min="0" step="5000" value={budget} onChange={(event) => setBudget(event.target.value)} />
                </label>
                <button className="solid-action" onClick={saveBudget} disabled={saving}>
                  {saving ? "SAVING..." : "SAVE BUDGET"}
                </button>
              </>
            ) : (
              <p className="mono" style={{ color: "var(--dim)" }}>BUDGET CONTROL LOCKED (READ-ONLY)</p>
            )}
          </div>
        </article>
      </section>
      <section className="expense-depth">
        <article className="panel">
          <div className="panel-head"><div><p className="eyebrow">WHY THIS MUCH?</p><h2>Cost by role</h2></div><span className="mono">ATTENDEE-HOUR SOURCE</span></div>
          <div className="expense-breakdown">{project.expenseBreakdown.length ? project.expenseBreakdown.map((item) => <div key={item.label}><div><strong>{item.label}</strong><span>{money(item.amount)} / {item.percentage}%</span></div><i><b style={{ width: `${item.percentage}%` }} /></i></div>) : <p className="empty-copy">No attributed meeting expenses yet.</p>}</div>
        </article>
        <article className="panel">
          <div className="panel-head"><div><p className="eyebrow">EXPENSE SOURCES</p><h2>Meetings driving spend</h2></div><span className="mono">HIGHEST FIRST</span></div>
          <div className="expense-meetings">{project.topMeetings.length ? project.topMeetings.map((meeting, index) => <div key={meeting.id}><span className="mono">0{index + 1}</span><div><strong>{meeting.title}</strong><small>{meeting.attendees} people × {meeting.duration} min</small></div><b>{money(meeting.cost)}</b></div>) : <p className="empty-copy">No meeting expenses linked to this project.</p>}</div>
        </article>
      </section>
    </div>
  );
}

function Attribution({ meetings, projects, onRefresh, currentUser }: { meetings: AppMeeting[]; projects: AppProject[]; onRefresh: () => Promise<void>; currentUser: UserProfile }) {
  const [selectedId, setSelectedId] = useState(meetings[0]?.id || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [manualProjectId, setManualProjectId] = useState("");
  const meeting = meetings.find((item) => item.id === selectedId) || meetings[0];
  if (!meeting) return null;

  async function runAttribution() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/ai/attribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meeting.id,
          title: meeting.title,
          description: meeting.description,
          attendees: [`${meeting.attendees} attendees`, meeting.team],
          projectHint: meeting.project === "Unattributed" ? "" : meeting.project,
          projects: projects.map((project) => ({ id: project.id, name: project.name, keywords: project.keywords, team: project.team })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Attribution failed.");
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Attribution failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveCorrection() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/attributions/${meeting.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: manualProjectId || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Correction failed.");
      await onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Correction failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="view-stack">
      <PageTitle index="04" kicker="AI ATTRIBUTION" title="Evidence, not guesses." detail="Run live AI classification and persist the reason, score, and evidence." />
      <section className="attribution-layout">
        <div className="attribution-list"><div className="list-head mono"><span>MEETING</span><span>CONF.</span></div>{meetings.slice(0, 12).map((item) => <button className={meeting.id === item.id ? "is-active" : ""} onClick={() => { setSelectedId(item.id); setManualProjectId(item.projectId || ""); }} key={item.id}><span className={`risk-mark ${item.status}`} /><div><strong>{item.title}</strong><small>{item.project}</small></div><b>{item.confidence}%</b></button>)}</div>
        <article className="evidence-panel">
          <div className="evidence-title"><div><p className="eyebrow">SELECTED MEETING</p><h2>{meeting.title}</h2></div><div className="confidence-ring" style={{ "--score": `${meeting.confidence * 3.6}deg` } as React.CSSProperties}><strong>{meeting.confidence}%</strong><span>CONFIDENCE</span></div></div>
          <div className="assignment"><span className="mono">PROJECT ASSIGNMENT</span><strong>{meeting.project}</strong><p>{meeting.reason}</p>{error && <p className="form-error mono">{error}</p>}</div>
          <div className="evidence-bars">{Object.entries(meeting.evidence).map(([label, value]) => <div key={label}><span className="mono">{label.replace(/([A-Z])/g, " $1")}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}</div>
          <div className="confidence-explainer"><span className="mono">CALIBRATION</span><p>The score is calculated from title 35%, description 25%, attendees 15%, and project hint 25%, then reduced when another project is similarly plausible.</p></div>
          <div className="manual-correction"><label><span className="mono">HUMAN CORRECTION</span><select disabled={currentUser.role !== "ADMINISTRATOR"} value={manualProjectId} onChange={(event) => setManualProjectId(event.target.value)}><option value="">Keep unattributed</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><button className="outline-action" onClick={saveCorrection} disabled={busy || currentUser.role !== "ADMINISTRATOR"}>SAVE CORRECTION</button></div>
          <div className="evidence-actions">
            <button className="solid-action" onClick={runAttribution} disabled={busy || currentUser.role !== "ADMINISTRATOR"}>
              {busy ? "ANALYZING WITH GROQ..." : "RUN CALIBRATED AI ATTRIBUTION"}
            </button>
            <span className="mono model-note">MODEL / LLAMA 3.3 70B + DETERMINISTIC CALIBRATION</span>
          </div>
          {currentUser.role !== "ADMINISTRATOR" && <p className="mono text-center" style={{ color: "var(--dim)", marginTop: "12px", fontSize: "10px" }}>READ-ONLY CLASS LOGS</p>}
        </article>
      </section>
    </div>
  );
}

function CostLedger({ meetings }: { meetings: AppMeeting[] }) {
  const [filter, setFilter] = useState("ALL");
  const visible = meetings.filter((meeting) => filter === "ALL" || (filter === "REVIEW" ? meeting.status === "review" : meeting.recurring));
  function exportCsv() {
    const rows = [["Meeting", "Project", "Date", "Duration", "Attendees", "Cost INR", "Confidence", "ROI"], ...visible.map((meeting) => [meeting.title, meeting.project, meeting.startsAt, meeting.duration, meeting.attendees, meeting.cost, meeting.confidence, meeting.roi])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "meetcost-ledger.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="view-stack">
      <PageTitle index="05" kicker="FINANCIAL RECORD" title="Meeting Cost Ledger" detail="A complete, exportable record of meeting cost, attribution, and return." />
      <div className="ledger-tools"><div>{["ALL", "RECURRING", "REVIEW"].map((item) => <button className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><button className="outline-action" onClick={exportCsv}>EXPORT CSV ↗</button></div>
      <section className="ledger-table"><div className="ledger-head mono"><span>MEETING / PROJECT</span><span>DATE</span><span>DURATION</span><span>ATTENDEES</span><span>COST</span><span>CONF.</span><span>ROI</span></div>{visible.map((meeting) => <div className="ledger-row" key={meeting.id}><div><span className={`risk-mark ${meeting.status}`} /><strong>{meeting.title}</strong><small>{meeting.project} / {meeting.team}</small></div><span className="mono">{meeting.date}</span><span>{meeting.duration} min</span><span>{meeting.attendees}</span><b>{money(meeting.cost)}</b><span>{meeting.confidence}%</span><span>{meeting.roi}/100</span></div>)}</section>
    </div>
  );
}

function BudgetRescue({ anomalies, onRefresh }: { anomalies: AppAnomaly[]; onRefresh: () => Promise<void> }) {
  const target = anomalies.find((anomaly) => anomaly.type === "low_roi") || anomalies[0];
  const optimized = target?.status === "resolved";
  const [busy, setBusy] = useState(false);
  if (!target) return null;
  async function apply() {
    setBusy(true);
    await fetch("/api/rescue", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ anomalyId: target.id, applied: !optimized }) });
    await onRefresh(); setBusy(false);
  }
  return (
    <div className="view-stack">
      <PageTitle index="06" kicker="ACTION LAYER" title="Budget Rescue Mode" detail="Convert costly patterns into a measured, auditable intervention." />
      <section className="rescue-hero"><div className="rescue-copy"><span className="mono">RECOMMENDATION / 001</span><h2>REDUCE THE ROOM.<br /><span>RECOVER THE BUDGET.</span></h2><p>Phoenix Weekly Status has twelve attendees but only five recurring decision owners. Reduce duration and retain the core team.</p></div><div className="rescue-savings"><span className="mono">MONTHLY SAVING</span><strong>{optimized ? money(target.saving) : money(0)}</strong><small>{optimized ? "OPTIMIZATION APPLIED" : "READY TO SIMULATE"}</small></div></section>
      <section className="before-after"><article><p className="eyebrow">CURRENT FORMAT</p><div className="meeting-geometry">{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div><dl><div><dt>Duration</dt><dd>45 min</dd></div><div><dt>Attendees</dt><dd>12 people</dd></div><div><dt>Monthly cost</dt><dd>{money(target.saving * 2)}</dd></div></dl></article><div className="rescue-arrow">→</div><article className={optimized ? "optimized" : ""}><p className="eyebrow">OPTIMIZED FORMAT</p><div className="meeting-geometry five">{Array.from({ length: 5 }).map((_, index) => <i key={index} />)}</div><dl><div><dt>Duration</dt><dd>30 min</dd></div><div><dt>Attendees</dt><dd>5 people</dd></div><div><dt>Monthly cost</dt><dd>{money(target.saving)}</dd></div></dl></article></section>
      <button className="apply-rescue" onClick={apply} disabled={busy}>{busy ? "UPDATING..." : optimized ? "OPTIMIZATION APPLIED / UNDO" : "APPLY AI RECOMMENDATION"} <span>↗</span></button>
    </div>
  );
}

function Anomalies({ anomalies, onRefresh, currentUser }: { anomalies: AppAnomaly[]; onRefresh: () => Promise<void>; currentUser: UserProfile }) {
  const [busyId, setBusyId] = useState("");
  async function toggle(anomaly: AppAnomaly) {
    setBusyId(anomaly.id);
    await fetch(`/api/anomalies/${anomaly.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: anomaly.status === "open" ? "resolved" : "open" }) });
    await onRefresh(); setBusyId("");
  }
  return (
    <div className="view-stack">
      <PageTitle index="07" kicker="RISK CENTER" title="Anomaly Detection" detail="Cost patterns ranked by severity, evidence, and recoverable value." />
      <section className="anomaly-list">{anomalies.map((anomaly, index) => <article className={anomaly.status === "resolved" ? "is-resolved" : ""} key={anomaly.id}><span className="anomaly-number mono">0{index + 1}</span><div className="anomaly-copy"><span className="mono">{anomaly.type.replaceAll("_", " ")} / {anomaly.severity}</span><h2>{anomaly.title}</h2><p>{anomaly.detail}</p></div><div className="anomaly-saving"><span className="mono">POTENTIAL SAVING</span><strong>{money(anomaly.saving)}</strong></div><button onClick={() => void toggle(anomaly)} disabled={busyId === anomaly.id || currentUser.role !== "ADMINISTRATOR"}>{busyId === anomaly.id ? "UPDATING" : anomaly.status === "resolved" ? "REOPEN" : "RESOLVE"} ↗</button></article>)}</section>
    </div>
  );
}

function CostAssistant({ data, currentUser }: { data: AppData; currentUser: UserProfile }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [projectId, setProjectId] = useState(currentUser.assignedProjectId || "");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Ask me why a project costs this much, which meetings to cut, or how a budget is calculated. I answer from your live workspace data." },
  ]);

  async function ask(prompt?: string) {
    const nextQuestion = (prompt || question).trim();
    if (!nextQuestion || busy) return;
    setMessages((items) => [...items, { role: "user", content: nextQuestion }]);
    setQuestion(""); setBusy(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: nextQuestion, projectId: (currentUser.assignedProjectId || projectId) || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Assistant failed.");
      setMessages((items) => [...items, { role: "assistant", content: result.answer }]);
    } catch (caught) {
      setMessages((items) => [...items, { role: "assistant", content: caught instanceof Error ? caught.message : "Assistant failed." }]);
    } finally {
      setBusy(false);
    }
  }

  // Sync project ID when user profile changes
  useEffect(() => {
    setProjectId(currentUser.assignedProjectId || "");
  }, [currentUser]);

  return (
    <div className={`assistant-shell ${open ? "is-open" : ""}`}>
      {open && <section className="assistant-panel" aria-label="MeetCost AI assistant">
        <div className="assistant-head"><div><span className="eyebrow">GROQ / LIVE WORKSPACE</span><h2>Cost Strategist</h2></div><button onClick={() => setOpen(false)} aria-label="Close assistant"><Icon name="close" /></button></div>
        <label className="assistant-scope">
          <span className="mono">SCOPE</span>
          {currentUser.assignedProjectId ? (
            <select disabled value={currentUser.assignedProjectId}>
              <option value={currentUser.assignedProjectId}>{currentUser.assignedProjectName}</option>
            </select>
          ) : (
            <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              <option value="">Entire workspace</option>
              {data.projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}
            </select>
          )}
        </label>
        <div className="assistant-prompts">{["Why is Phoenix expensive?", "Which meetings can we reduce?", "Explain the budget calculation"].map((prompt) => <button key={prompt} onClick={() => void ask(prompt)}>{prompt}</button>)}</div>
        <div className="assistant-messages">{messages.map((message, index) => <div className={message.role} key={`${message.role}-${index}`}><span className="mono">{message.role === "assistant" ? "STRATEGIST" : "YOU"}</span><p>{message.content}</p></div>)}{busy && <div className="assistant-thinking mono">ANALYZING LIVE COST DATA...</div>}</div>
        <form onSubmit={(event) => { event.preventDefault(); void ask(); }} className="assistant-input"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about cost, budgets, ROI, or a meeting..." /><button className="solid-action" disabled={busy || !question.trim()}>ASK</button></form>
      </section>}
      <button className="assistant-fab" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close cost assistant" : "Open cost assistant"}><Icon name={open ? "close" : "ai"} /><span>ASK STRATEGIST</span></button>
    </div>
  );
}

export function MeetCostApp() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [range, setRange] = useState("THIS MONTH");
  const [theme, setTheme] = useState<Theme>("dark");
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(profilesList[0]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (data?.projects && currentUser.assignedProjectName) {
      const proj = data.projects.find((p) => p.name === currentUser.assignedProjectName);
      if (proj && currentUser.assignedProjectId !== proj.id) {
        setCurrentUser((curr) => ({
          ...curr,
          assignedProjectId: proj.id,
        }));
      }
    }
  }, [data, currentUser.assignedProjectName, currentUser.assignedProjectId]);

  const handleSelectProfile = (profile: UserProfile) => {
    setCurrentUser(profile);
    setSwitcherOpen(false);
    if (!profile.allowedViews.includes(activeView)) {
      setActiveView("Dashboard");
    }
  };

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/data", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load data.");
      setData(result); setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load data.");
    } finally {
      setRefreshing(false); setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadData]);
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = localStorage.getItem("meetcost-theme") as Theme | null;
      setTheme(saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.body.style.overflow = mobileNav ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [mobileNav]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme); localStorage.setItem("meetcost-theme", nextTheme); document.documentElement.dataset.theme = nextTheme;
  }
  function navigate(view: View) { 
    if (currentUser.allowedViews.includes(view)) {
      setActiveView(view); 
      setMobileNav(false); 
      window.scrollTo({ top: 0, behavior: "smooth" }); 
    }
  }

  const activeIndex = navItems.findIndex((item) => item.label === activeView);
  return (
    <>
      <Loader done={loaded} />
      <div className={`app-shell ${loaded ? "is-visible" : ""}`}>
        <aside className={`app-sidebar ${mobileNav ? "is-open" : ""}`}>
          <div className="app-brand"><div>MEETCOST <span>参謀</span></div><small className="mono">COST STRATEGIST ENGINE</small></div>
          <nav>{navItems.filter((item) => currentUser.allowedViews.includes(item.label)).map((item) => <button className={activeView === item.label ? "is-active" : ""} onClick={() => navigate(item.label)} key={item.label}><Icon name={item.icon} /><span><strong>{item.label}</strong><small>{item.short}</small></span><b className="mono">{item.id}</b></button>)}</nav>
          <div className="sidebar-foot">
            <div className="privacy-chip"><i /><span><b>PRIVACY MODE</b><small>Role cost bands only</small></span></div>
            <button 
              className="user-chip w-full flex items-center gap-3 p-3 border-0 bg-transparent text-left hover:bg-[var(--faint)] transition-colors"
              onClick={() => setSwitcherOpen(true)}
              style={{ padding: "14px 17px", width: "100%" }}
            >
              <span className="grid place-items-center border border-[var(--line)] font-serif text-[10px] bg-[var(--navy-2)] font-bold text-[var(--accent)]" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center" }}>
                {currentUser.initials}
              </span>
              <div>
                <b className="text-[10px] text-[var(--ice)] block font-serif tracking-wider" style={{ display: "block" }}>{currentUser.name}</b>
                <small className="mono block mt-1" style={{ display: "block" }}>{currentUser.rank}</small>
              </div>
            </button>
          </div>
        </aside>

        <header className="app-header">
          <button className="mobile-menu" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation"><Icon name={mobileNav ? "close" : "menu"} /></button>
          <div className="breadcrumb mono"><span>MEETCOST /</span><b>{activeView.toUpperCase()}</b></div>
          <div className="header-controls">
            <span className={`live-chip mono ${error ? "is-offline" : ""}`}><i /> {error ? "BACKEND ERROR" : refreshing ? "SYNCING" : data?.persistence === "supabase" ? "SUPABASE LIVE" : "LOCAL PERSISTENCE"}</span>
            <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Date range"><option>THIS MONTH</option><option>LAST 30 DAYS</option><option>THIS QUARTER</option></select>
            <button className={`header-icon ${refreshing ? "is-spinning" : ""}`} onClick={() => void loadData()} aria-label="Refresh data"><Icon name="refresh" /></button>
            <button className="header-icon theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><Icon name={theme === "dark" ? "sun" : "moon"} /></button>
            <button className="header-icon" onClick={() => navigate("Anomalies")} aria-label="Open anomalies" disabled={!currentUser.allowedViews.includes("Anomalies")}><Icon name="alert" /><i>{data?.metrics.activeAnomalies || 0}</i></button>
          </div>
        </header>

        <main className="app-main">
          <div className="view-marker mono"><span>0{activeIndex + 1}</span><i /><span>07</span></div>
          {error && !data && <section className="fatal-state"><p className="eyebrow">CONNECTION ERROR</p><h1>THE COST ENGINE IS OFFLINE.</h1><p>{error}</p><button className="solid-action" onClick={() => void loadData()}>RETRY CONNECTION</button></section>}
          {data && activeView === "Dashboard" && <Dashboard data={data} onNavigate={navigate} />}
          {data && activeView === "Calendar Import" && <CalendarImport projects={data.projects} onRefresh={loadData} currentUser={currentUser} />}
          {data && activeView === "Projects & Budgets" && <ProjectsBudgets projects={data.projects} onRefresh={loadData} currentUser={currentUser} />}
          {data && activeView === "AI Attribution" && <Attribution meetings={data.meetings} projects={data.projects} onRefresh={loadData} currentUser={currentUser} />}
          {data && activeView === "Cost Ledger" && <CostLedger meetings={data.meetings} />}
          {data && activeView === "Budget Rescue" && <BudgetRescue anomalies={data.anomalies} onRefresh={loadData} />}
          {data && activeView === "Anomalies" && <Anomalies anomalies={data.anomalies} onRefresh={loadData} currentUser={currentUser} />}
        </main>
        {data && <CostAssistant data={data} currentUser={currentUser} />}
        <ProfileSwitcherModal 
          isOpen={switcherOpen} 
          onClose={() => setSwitcherOpen(false)} 
          onSelectProfile={handleSelectProfile} 
          currentProfile={currentUser} 
        />
      </div>
    </>
  );
}
