import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppData, AppMeeting, AppProject, ImportSummary } from "@/lib/app-types";

const storeDirectory = path.join(process.cwd(), ".data");
const storePath = path.join(storeDirectory, "meetcost.json");

function id(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function createFallbackData(): AppData {
  const projectDefinitions = [
    ["Project Alpha", "Kabir Shah", "Product Engineering", "high", 200000, ["alpha", "sprint", "backend"]],
    ["Project Phoenix", "Rohan Das", "Growth Engineering", "medium", 90000, ["phoenix", "growth", "launch"]],
    ["Project Orion", "Arjun Pillai", "Platform", "high", 180000, ["orion", "release", "platform"]],
    ["Operations", "Neha Bose", "Leadership Operations", "low", 140000, ["operations", "leadership", "finance"]],
    ["Project Nebula", "Ishita Sen", "Platform Infrastructure", "high", 150000, ["nebula", "infra", "kubernetes", "aws"]],
    ["Marketing & Growth Q3", "Aditya Roy", "Growth Marketing", "medium", 80000, ["marketing", "campaign", "growth", "ad"]],
  ] as const;
  const projects: AppProject[] = projectDefinitions.map(([name, owner, team, priority, budget, keywords], index) => ({
    id: id("project", index),
    name,
    owner,
    team,
    priority,
    budget,
    used: 0,
    projected: 0,
    status: "active",
    keywords: [...keywords],
    trend: [12, 31, -4, 18, 5, 24][index] || 0,
    meetingCount: 0,
    averageMeetingCost: 0,
    expenseBreakdown: [],
    topMeetings: [],
  }));
  const meetingDefinitions = [
    ["Alpha Sprint Planning", 0, "Product", 60, 8, 8400, 94, 82, true, "clear"],
    ["Phoenix Weekly Status", 1, "Engineering", 45, 12, 11250, 91, 24, true, "risk"],
    ["Quick Sync", -1, "Cross-team", 30, 6, 3600, 48, 35, false, "review"],
    ["Orion Release Review", 2, "Platform", 75, 9, 13500, 88, 76, false, "clear"],
    ["Leadership Operations", 3, "Leadership", 90, 7, 15750, 72, 51, true, "risk"],
    ["Backend Architecture Sync", 0, "Engineering", 60, 10, 10800, 86, 63, true, "clear"],
    ["Phoenix Launch Retrospective", 1, "Product", 60, 7, 7700, 92, 84, false, "clear"],
    ["Orion Reliability Review", 2, "Platform", 45, 6, 6750, 96, 90, true, "clear"],
    ["Nebula Kubernetes Alignment", 4, "Platform", 15, 4, 1200, 95, 88, true, "clear"],
    ["Q3 Growth Campaign Brainstorm", 5, "Marketing", 90, 8, 18000, 92, 20, false, "risk"],
    ["Monthly Company-Wide All-Hands", -1, "Cross-team", 60, 15, 32000, 55, 50, true, "review"],
    ["AWS Migration Post-Mortem", 4, "Platform", 60, 7, 9800, 94, 85, false, "clear"],
    ["Marketing & Design Sync", 5, "Marketing", 30, 3, 3500, 90, 70, true, "clear"],
    ["Virtual Coffee Chat", -1, "Cross-team", 30, 5, 2800, 30, 5, false, "review"],
  ] as const;
  const meetings: AppMeeting[] = Array.from({ length: 42 }, (_, index) => {
    const definition = meetingDefinitions[index % meetingDefinitions.length];
    const [title, projectIndex, team, duration, attendees, cost, confidence, roi, recurring, status] = definition;
    const startsAt = new Date("2026-06-13T09:30:00+05:30");
    startsAt.setDate(startsAt.getDate() - index);
    const project = projectIndex >= 0 ? projects[projectIndex] : null;
    return {
      id: id("meeting", index),
      title,
      description: project ? `${project.name} working session with accountable owners.` : "General cross-team sync with no project hint.",
      projectId: project?.id || null,
      project: project?.name || "Unattributed",
      team,
      startsAt: startsAt.toISOString(),
      date: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(startsAt),
      duration,
      attendees,
      cost,
      confidence,
      roi,
      recurring,
      status,
      evidence: {
        titleMatch: Math.min(99, confidence + 2),
        descriptionMatch: Math.max(25, confidence - 9),
        attendeeMatch: Math.max(42, confidence - 4),
        projectHintMatch: project ? Math.min(99, confidence + 4) : 12,
      },
      reason: project ? "Title, attendee pattern, and project context align." : "Insufficient project evidence. Human review is recommended.",
      attendeeBreakdown: [{ role: team, count: attendees, hourlyCost: Math.round(cost / Math.max(1, attendees) / (duration / 60)), totalCost: cost }],
    };
  });
  for (const project of projects) {
    const projectMeetings = meetings.filter((meeting) => meeting.projectId === project.id);
    project.used = projectMeetings.reduce((sum, meeting) => sum + meeting.cost, 0);
    project.projected = Math.round(project.used * 1.24);
    project.meetingCount = projectMeetings.length;
    project.averageMeetingCost = projectMeetings.length ? Math.round(project.used / projectMeetings.length) : 0;
    project.topMeetings = [...projectMeetings].sort((a, b) => b.cost - a.cost).slice(0, 5).map((meeting) => ({
      id: meeting.id, title: meeting.title, cost: meeting.cost, duration: meeting.duration, attendees: meeting.attendees,
    }));
    project.expenseBreakdown = [{ label: project.team, amount: project.used, percentage: project.used ? 100 : 0 }];
  }
  const anomalies = [
    ["budget_overrun", "Project Phoenix is projected to exceed budget", "82% consumed early in the cycle. Current meeting pattern creates a significant overrun risk.", "critical", 78000, projects[1].id, meetings[1].id],
    ["duplicate_meeting", "Two Alpha syncs share most attendees", "Sprint Planning and Backend Architecture cover overlapping updates each cycle.", "high", 18000, projects[0].id, meetings[5].id],
    ["ghost_meeting", "Quick Sync has no project or outcome", "Six attendees, no agenda, and weak attribution evidence require a human decision.", "high", 14400, null, meetings[2].id],
    ["low_roi", "Phoenix Weekly Status returned few decisions", "Recurring high-cost status sessions show low outcome density.", "medium", 22500, projects[1].id, meetings[1].id],
    ["low_roi", "Q3 Marketing brainstorm shows low output", "High-cost brainstorm session with 8 attendees returned very low decision density.", "high", 28000, projects[5].id, meetings[9].id],
  ].map(([type, title, detail, severity, saving, projectId, meetingId], index) => ({
    id: id("anomaly", index),
    type: String(type),
    title: String(title),
    detail: String(detail),
    severity: String(severity),
    saving: Number(saving),
    status: "open" as const,
    projectId: projectId ? String(projectId) : null,
    meetingId: meetingId ? String(meetingId) : null,
  }));
  const totalCost = meetings.reduce((sum, meeting) => sum + meeting.cost, 0);
  return {
    persistence: "local",
    organization: { id: "local-demo", name: "MeetCost Demo Labs", currency: "INR" },
    metrics: {
      totalCost,
      potentialSavings: anomalies.reduce((sum, anomaly) => sum + anomaly.saving, 0),
      unattributedCost: meetings.filter((meeting) => !meeting.projectId).reduce((sum, meeting) => sum + meeting.cost, 0),
      averageRoi: Math.round(meetings.reduce((sum, meeting) => sum + meeting.roi, 0) / meetings.length),
      activeAnomalies: anomalies.length,
      meetingCount: meetings.length,
    },
    projects,
    meetings,
    anomalies,
    costBands: [
      { id: "band-1", roleName: "Leadership", hourlyCost: 3500 },
      { id: "band-2", roleName: "Product Lead", hourlyCost: 2200 },
      { id: "band-3", roleName: "Product Manager", hourlyCost: 2000 },
      { id: "band-4", roleName: "Senior Engineer", hourlyCost: 1800 },
      { id: "band-5", roleName: "Designer", hourlyCost: 1300 },
      { id: "band-6", roleName: "Engineer", hourlyCost: 1200 },
      { id: "band-7", roleName: "QA Engineer", hourlyCost: 1000 },
    ],
    lastSyncedAt: new Date().toISOString(),
  };
}

function recalculate(data: AppData) {
  for (const project of data.projects) {
    const projectMeetings = data.meetings.filter((meeting) => meeting.projectId === project.id);
    project.used = projectMeetings.reduce((sum, meeting) => sum + meeting.cost, 0);
    project.projected = Math.round(project.used * 1.24);
    project.meetingCount = projectMeetings.length;
    project.averageMeetingCost = projectMeetings.length ? Math.round(project.used / projectMeetings.length) : 0;
    project.topMeetings = [...projectMeetings].sort((a, b) => b.cost - a.cost).slice(0, 5).map((meeting) => ({
      id: meeting.id, title: meeting.title, cost: meeting.cost, duration: meeting.duration, attendees: meeting.attendees,
    }));
    project.expenseBreakdown = [{ label: project.team, amount: project.used, percentage: project.used ? 100 : 0 }];
  }
  const open = data.anomalies.filter((anomaly) => anomaly.status === "open");
  data.metrics.totalCost = data.meetings.reduce((sum, meeting) => sum + meeting.cost, 0);
  data.metrics.potentialSavings = open.reduce((sum, anomaly) => sum + anomaly.saving, 0);
  data.metrics.unattributedCost = data.meetings.filter((meeting) => !meeting.projectId).reduce((sum, meeting) => sum + meeting.cost, 0);
  data.metrics.averageRoi = Math.round(data.meetings.reduce((sum, meeting) => sum + meeting.roi, 0) / Math.max(1, data.meetings.length));
  data.metrics.activeAnomalies = open.length;
  data.metrics.meetingCount = data.meetings.length;
  data.lastSyncedAt = new Date().toISOString();
  return data;
}

export function isMissingSchema(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "";
  return message.includes("schema cache") || message.includes("does not exist") || message.includes("PGRST205");
}

export async function readLocalData() {
  try {
    return recalculate(JSON.parse(await readFile(storePath, "utf8")) as AppData);
  } catch {
    const data = createFallbackData();
    await writeLocalData(data);
    return data;
  }
}

async function writeLocalData(data: AppData) {
  await mkdir(storeDirectory, { recursive: true });
  await writeFile(storePath, JSON.stringify(recalculate(data), null, 2), "utf8");
}

export async function updateLocalAnomaly(anomalyId: string, status: "open" | "resolved") {
  const data = await readLocalData();
  const anomaly = data.anomalies.find((item) => item.id === anomalyId);
  if (!anomaly) throw new Error("Anomaly not found.");
  anomaly.status = status;
  await writeLocalData(data);
  return anomaly;
}

export async function updateLocalProject(projectId: string, monthlyBudget?: number) {
  const data = await readLocalData();
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) throw new Error("Project not found.");
  if (typeof monthlyBudget === "number") project.budget = monthlyBudget;
  await writeLocalData(data);
  return project;
}

export async function updateLocalAttribution(meetingId: string, result: { projectId: string | null; projectName: string; confidence: number; reason: string; evidence: AppMeeting["evidence"] }) {
  const data = await readLocalData();
  const meeting = data.meetings.find((item) => item.id === meetingId);
  if (!meeting) throw new Error("Meeting not found.");
  meeting.projectId = result.projectId;
  meeting.project = result.projectId ? result.projectName : "Unattributed";
  meeting.confidence = result.confidence;
  meeting.reason = result.reason;
  meeting.evidence = result.evidence;
  meeting.status = result.confidence < 60 ? "review" : "clear";
  await writeLocalData(data);
}

export async function importLocalMeetings(rows: Array<Record<string, string | undefined>>): Promise<ImportSummary> {
  const data = await readLocalData();
  const summary: ImportSummary = { imported: 0, recurring: 0, missingProjects: 0, needsReview: 0, estimatedCost: 0, errors: [] };
  for (const [index, row] of rows.entries()) {
    if (!row.title) continue;
    const project = data.projects.find((item) => item.name.toLowerCase() === row.project?.toLowerCase());
    const duration = Math.max(5, Number(row.duration_minutes) || 30);
    const attendees = Math.max(1, (row.attendees || "attendee").split(/[;,]/).filter(Boolean).length);
    const cost = Math.round(attendees * 1400 * duration / 60);
    const startsAt = new Date(row.start || Date.now() + index * 3600000);
    const recurring = ["yes", "true", "1"].includes((row.recurring || "").toLowerCase());
    data.meetings.unshift({
      id: `import-${Date.now()}-${index}`,
      title: row.title,
      description: row.description || "",
      projectId: project?.id || null,
      project: project?.name || "Unattributed",
      team: row.department || "Imported",
      startsAt: startsAt.toISOString(),
      date: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(startsAt),
      duration,
      attendees,
      cost,
      confidence: project ? 82 : 34,
      roi: 50,
      recurring,
      status: project ? "clear" : "review",
      evidence: { titleMatch: project ? 76 : 25, descriptionMatch: row.description ? 62 : 18, attendeeMatch: 55, projectHintMatch: project ? 98 : 10 },
      reason: project ? "Imported project hint matched an existing project." : "No known project matched the imported row.",
      attendeeBreakdown: [{ role: row.attendee_roles || "Engineer", count: attendees, hourlyCost: 1400, totalCost: cost }],
    });
    summary.imported += 1;
    summary.recurring += recurring ? 1 : 0;
    summary.missingProjects += project ? 0 : 1;
    summary.needsReview += project ? 0 : 1;
    summary.estimatedCost += cost;
  }
  await writeLocalData(data);
  return summary;
}
