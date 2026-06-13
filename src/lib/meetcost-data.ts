import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AppAnomaly, AppData, AppMeeting, AppProject } from "@/lib/app-types";

const DEMO_ORGANIZATION = "MeetCost Demo Labs";

const bandSeed = [
  { role_name: "Leadership", hourly_cost: 3500 },
  { role_name: "Product Manager", hourly_cost: 2000 },
  { role_name: "Product Lead", hourly_cost: 2200 },
  { role_name: "Senior Engineer", hourly_cost: 1800 },
  { role_name: "Designer", hourly_cost: 1300 },
  { role_name: "Engineer", hourly_cost: 1200 },
  { role_name: "QA Engineer", hourly_cost: 1000 },
  { role_name: "Operations", hourly_cost: 900 },
];

const employeeSeed = [
  ["EMP-001", "Ananya Rao", "ananya@meetcost.demo", "Leadership", "Leadership", "Executive"],
  ["EMP-002", "Kabir Shah", "kabir@meetcost.demo", "Product Lead", "Product", "Alpha"],
  ["EMP-003", "Mira Iyer", "mira@meetcost.demo", "Senior Engineer", "Engineering", "Alpha"],
  ["EMP-004", "Aarav Mehta", "aarav@meetcost.demo", "Engineer", "Engineering", "Alpha"],
  ["EMP-005", "Diya Nair", "diya@meetcost.demo", "Designer", "Design", "Alpha"],
  ["EMP-006", "Rohan Das", "rohan@meetcost.demo", "Product Lead", "Product", "Phoenix"],
  ["EMP-007", "Ishita Sen", "ishita@meetcost.demo", "Senior Engineer", "Engineering", "Phoenix"],
  ["EMP-008", "Vikram Jain", "vikram@meetcost.demo", "Engineer", "Engineering", "Phoenix"],
  ["EMP-009", "Neha Bose", "neha@meetcost.demo", "Operations", "Operations", "Operations"],
  ["EMP-010", "Arjun Pillai", "arjun@meetcost.demo", "Senior Engineer", "Platform", "Orion"],
  ["EMP-011", "Tara Gupta", "tara@meetcost.demo", "Engineer", "Platform", "Orion"],
  ["EMP-012", "Sana Khan", "sana@meetcost.demo", "Designer", "Design", "Orion"],
  ["EMP-013", "Aditya Roy", "aditya@meetcost.demo", "Product Manager", "Growth", "Marketing"],
  ["EMP-014", "Riya Sen", "riya@meetcost.demo", "Designer", "Design", "Marketing"],
  ["EMP-015", "Dev Patel", "dev@meetcost.demo", "Engineer", "Engineering", "Nebula"],
  ["EMP-016", "Karan Johar", "karan@meetcost.demo", "QA Engineer", "Engineering", "Nebula"],
] as const;

const projectSeed = [
  { name: "Project Alpha", owner_name: "Kabir Shah", priority: "high", monthly_budget: 200000, team: "Product Engineering", keywords: ["alpha", "sprint", "backend", "product"] },
  { name: "Project Phoenix", owner_name: "Rohan Das", priority: "medium", monthly_budget: 90000, team: "Growth Engineering", keywords: ["phoenix", "growth", "status", "launch"] },
  { name: "Project Orion", owner_name: "Arjun Pillai", priority: "high", monthly_budget: 180000, team: "Platform", keywords: ["orion", "release", "platform", "infra"] },
  { name: "Operations", owner_name: "Neha Bose", priority: "low", monthly_budget: 140000, team: "Leadership Operations", keywords: ["operations", "leadership", "hiring", "finance"] },
  { name: "Project Nebula", owner_name: "Ishita Sen", priority: "high", monthly_budget: 150000, team: "Platform Infrastructure", keywords: ["nebula", "infra", "kubernetes", "aws"] },
  { name: "Marketing & Growth Q3", owner_name: "Aditya Roy", priority: "medium", monthly_budget: 80000, team: "Growth Marketing", keywords: ["marketing", "campaign", "growth", "ad"] },
] as const;

const meetingSeed = [
  ["alpha-planning", "Alpha Sprint Planning", "Roadmap priorities and sprint commitments.", "Product", "Project Alpha", 60, 8, true, "clear", 94, 82],
  ["phoenix-status", "Phoenix Weekly Status", "Weekly launch status, blockers, and owner updates.", "Engineering", "Project Phoenix", 45, 12, true, "risk", 91, 24],
  ["quick-sync", "Quick Sync", "General team sync.", "Cross-team", "", 30, 6, false, "review", 48, 35],
  ["orion-review", "Orion Release Review", "Release readiness and platform risk review.", "Platform", "Project Orion", 75, 9, false, "clear", 88, 76],
  ["leadership-ops", "Leadership Operations", "Hiring, finance, and operating review.", "Leadership", "Operations", 90, 7, true, "risk", 72, 51],
  ["alpha-architecture", "Backend Architecture Sync", "Alpha API architecture and migration decisions.", "Engineering", "Project Alpha", 60, 10, true, "clear", 86, 63],
  ["phoenix-retro", "Phoenix Launch Retrospective", "Review launch experiments and follow-up actions.", "Product", "Project Phoenix", 60, 7, false, "clear", 92, 84],
  ["orion-incident", "Orion Reliability Review", "Analyze service degradation and prevention work.", "Platform", "Project Orion", 45, 6, true, "clear", 96, 90],
  ["nebula-standup", "Nebula Kubernetes Alignment", "Daily standup for cloud migrations and AWS config.", "Platform", "Project Nebula", 15, 4, true, "clear", 95, 88],
  ["marketing-brainstorm", "Q3 Growth Campaign Brainstorm", "Open-ended brainstorming for Q3 ad budget allocation.", "Marketing", "Marketing & Growth Q3", 90, 8, false, "risk", 92, 20],
  ["all-hands", "Monthly Company-Wide All-Hands", "Monthly leadership update and team-wide alignments.", "Cross-team", "", 60, 15, true, "review", 55, 50],
  ["nebula-postmortem", "AWS Migration Post-Mortem", "Retrospective on database replication issues.", "Platform", "Project Nebula", 60, 7, false, "clear", 94, 85],
  ["marketing-alignment", "Marketing & Design Sync", "Design reviews for upcoming growth ads.", "Marketing", "Marketing & Growth Q3", 30, 3, true, "clear", 90, 70],
  ["random-catchup", "Virtual Coffee Chat", "Informal team catchup with no set agenda.", "Cross-team", "", 30, 5, false, "review", 30, 5],
] as const;

function asNumber(value: unknown) {
  return Number(value || 0);
}

function startForIndex(index: number) {
  const date = new Date("2026-06-13T09:30:00+05:30");
  date.setDate(date.getDate() - index);
  date.setHours(9 + (index % 5), index % 2 ? 30 : 0, 0, 0);
  return date;
}

export async function ensureDemoData() {
  const supabase = createAdminClient();
  const { data: existing, error: orgError } = await supabase
    .from("organizations")
    .select("id,name,currency")
    .eq("name", DEMO_ORGANIZATION)
    .maybeSingle();

  if (orgError) throw orgError;
  let organization = existing;
  let createdOrganization = false;

  if (!organization) {
    const { data, error } = await supabase
      .from("organizations")
      .insert({ name: DEMO_ORGANIZATION, currency: "INR" })
      .select("id,name,currency")
      .single();
    if (error) throw error;
    organization = data;
    createdOrganization = true;
  }

  const organizationId = organization.id;
  const { count, error: countError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  if (countError) throw countError;

  if ((count || 0) > 0) return organization;

  const { count: bandsCount, error: bandsCountError } = await supabase
    .from("cost_bands")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  if (bandsCountError) throw bandsCountError;

  if ((bandsCount || 0) === 0) {
    const { error: bandsError } = await supabase.from("cost_bands").insert(
      bandSeed.map((band) => ({ ...band, organization_id: organizationId })),
    );
    if (bandsError) throw bandsError;
  }

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .insert(employeeSeed.map(([external_id, display_name, email, role_name, department, team]) => ({
      organization_id: organizationId,
      external_id,
      display_name,
      email,
      role_name,
      department,
      team,
    })))
    .select("id,email,role_name");
  if (employeesError) throw employeesError;

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .insert(projectSeed.map((project) => ({ ...project, organization_id: organizationId })))
    .select("id,name");
  if (projectsError) throw projectsError;

  const projectByName = new Map(projects.map((project) => [project.name, project.id]));
  const bandByRole = new Map(bandSeed.map((band) => [band.role_name, band.hourly_cost]));

  for (let cycle = 0; cycle < 3; cycle += 1) {
    for (let index = 0; index < meetingSeed.length; index += 1) {
      const [key, title, description, department, projectHint, minutes, attendeeCount, recurring, risk, confidence, roi] = meetingSeed[index];
      const startsAt = startForIndex(index + cycle * meetingSeed.length);
      const endsAt = new Date(startsAt.getTime() + minutes * 60000);
      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .insert({
          organization_id: organizationId,
          external_id: `demo-${key}-${cycle + 1}`,
          title,
          description,
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          department,
          project_hint: projectHint || null,
          recurring,
          recurrence_key: recurring ? key : null,
          risk,
        })
        .select("id")
        .single();
      if (meetingError) throw meetingError;

      const rotated = [...employees].sort((a, b) => a.email.localeCompare(b.email));
      const selected = Array.from({ length: attendeeCount }, (_, attendeeIndex) => rotated[(attendeeIndex + index) % rotated.length]);
      const { error: attendeesError } = await supabase.from("meeting_attendees").insert(
        selected.map((employee) => ({
          meeting_id: meeting.id,
          employee_id: employee.id,
          attendee_email: employee.email,
          role_name: employee.role_name,
          hourly_cost_snapshot: bandByRole.get(employee.role_name) || 1000,
        })),
      );
      if (attendeesError) throw attendeesError;

      const { error: attributionError } = await supabase.from("attributions").insert({
        meeting_id: meeting.id,
        project_id: projectHint ? projectByName.get(projectHint) : null,
        confidence,
        evidence: {
          titleMatch: Math.min(99, confidence + 2),
          descriptionMatch: Math.max(30, confidence - 9),
          attendeeMatch: Math.max(45, confidence - 4),
          projectHintMatch: projectHint ? Math.min(99, confidence + 4) : 12,
        },
        reason: projectHint
          ? "Title, description, attendee pattern, and project hint align."
          : "Insufficient project evidence. Human review is recommended.",
      });
      if (attributionError) throw attributionError;

      const { error: outcomeError } = await supabase.from("meeting_outcomes").insert({
        meeting_id: meeting.id,
        outcome_type: roi > 70 ? "decision" : roi < 40 ? "status" : "working-session",
        decisions: roi > 70 ? 3 : roi < 40 ? 0 : 1,
        action_items: roi > 70 ? 5 : 2,
        roi_score: roi,
        summary: roi > 70 ? "Clear decisions and accountable next steps." : "Limited measurable outcome recorded.",
      });
      if (outcomeError) throw outcomeError;
    }
  }

  const { data: seededMeetings, error: seededMeetingsError } = await supabase
    .from("meetings")
    .select("id,external_id")
    .eq("organization_id", organizationId);
  if (seededMeetingsError) throw seededMeetingsError;
  const meetingByExternalId = new Map(seededMeetings.map((meeting) => [meeting.external_id, meeting.id]));

  const anomalyRows = [
    ["budget_overrun", "critical", "Project Phoenix is projected to exceed budget", "82% consumed early in the cycle. Current meeting pattern creates a significant overrun risk.", 78000, "Project Phoenix", "demo-phoenix-status-1"],
    ["duplicate_meeting", "high", "Two Alpha syncs share most attendees", "Sprint Planning and Backend Architecture cover overlapping updates each cycle.", 18000, "Project Alpha", "demo-alpha-architecture-1"],
    ["ghost_meeting", "high", "Quick Sync has no project or outcome", "Six attendees, no agenda, and weak attribution evidence require a human decision.", 14400, null, "demo-quick-sync-1"],
    ["low_roi", "medium", "Phoenix Weekly Status returned few decisions", "Recurring high-cost status sessions show low outcome density.", 22500, "Project Phoenix", "demo-phoenix-status-2"],
    ["low_roi", "high", "Q3 Marketing brainstorm shows low output", "High-cost brainstorm session with 8 attendees returned very low decision density.", 28000, "Marketing & Growth Q3", "demo-marketing-brainstorm-1"],
  ] as const;

  const { error: anomalyError } = await supabase.from("anomalies").insert(anomalyRows.map(
    ([anomaly_type, severity, title, detail, potential_saving, projectName, externalId]) => ({
      organization_id: organizationId,
      meeting_id: meetingByExternalId.get(externalId) || null,
      project_id: projectName ? projectByName.get(projectName) : null,
      anomaly_type,
      severity,
      title,
      detail,
      potential_saving,
      status: "open",
    }),
  ));
  if (anomalyError) throw anomalyError;

  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    action: "demo_data_seeded",
    entity_type: "organization",
    entity_id: organizationId,
    metadata: { meetings: meetingSeed.length * 3, projects: projectSeed.length },
  });

  return organization;
}

export async function getAppData(): Promise<AppData> {
  const supabase = createAdminClient();
  const organization = await ensureDemoData();
  const organizationId = organization.id;

  const [projectsResult, meetingsResult, attendeesResult, attributionsResult, outcomesResult, anomaliesResult, bandsResult] = await Promise.all([
    supabase.from("projects").select("*").eq("organization_id", organizationId).order("created_at"),
    supabase.from("meetings").select("*").eq("organization_id", organizationId).order("starts_at", { ascending: false }),
    supabase.from("meeting_attendees").select("*"),
    supabase.from("attributions").select("*"),
    supabase.from("meeting_outcomes").select("*"),
    supabase.from("anomalies").select("*").eq("organization_id", organizationId).order("created_at"),
    supabase.from("cost_bands").select("*").eq("organization_id", organizationId).order("hourly_cost", { ascending: false }),
  ]);

  for (const result of [projectsResult, meetingsResult, attendeesResult, attributionsResult, outcomesResult, anomaliesResult, bandsResult]) {
    if (result.error) throw result.error;
  }

  const projects = projectsResult.data || [];
  const meetings = meetingsResult.data || [];
  const meetingIds = new Set(meetings.map((meeting) => meeting.id));
  const attendees = (attendeesResult.data || []).filter((attendee) => meetingIds.has(attendee.meeting_id));
  const attributions = (attributionsResult.data || []).filter((attribution) => meetingIds.has(attribution.meeting_id));
  const outcomes = (outcomesResult.data || []).filter((outcome) => meetingIds.has(outcome.meeting_id));
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));
  const attributionByMeeting = new Map(attributions.map((attribution) => [attribution.meeting_id, attribution]));
  const outcomeByMeeting = new Map(outcomes.map((outcome) => [outcome.meeting_id, outcome]));
  const attendeesByMeeting = new Map<string, typeof attendees>();

  for (const attendee of attendees) {
    attendeesByMeeting.set(attendee.meeting_id, [...(attendeesByMeeting.get(attendee.meeting_id) || []), attendee]);
  }

  const appMeetings: AppMeeting[] = meetings.map((meeting) => {
    const meetingAttendees = attendeesByMeeting.get(meeting.id) || [];
    const attribution = attributionByMeeting.get(meeting.id);
    const outcome = outcomeByMeeting.get(meeting.id);
    const duration = Math.max(1, Math.round((new Date(meeting.ends_at).getTime() - new Date(meeting.starts_at).getTime()) / 60000));
    const cost = meetingAttendees.reduce((sum, attendee) => sum + asNumber(attendee.hourly_cost_snapshot) * duration / 60, 0);
    const evidence = (attribution?.evidence || {}) as Record<string, number | string>;
    const evidenceScores = {
      titleMatch: asNumber(evidence.titleMatch),
      descriptionMatch: asNumber(evidence.descriptionMatch),
      attendeeMatch: asNumber(evidence.attendeeMatch),
      projectHintMatch: asNumber(evidence.projectHintMatch),
    };
    const hasComparableEvidence = Object.values(evidenceScores).some((score) => score > 0);
    const calibratedConfidence = evidence.source === "human_correction"
      ? 100
      : hasComparableEvidence
        ? Math.round(
          evidenceScores.titleMatch * 0.35
          + evidenceScores.descriptionMatch * 0.25
          + evidenceScores.attendeeMatch * 0.15
          + evidenceScores.projectHintMatch * 0.25,
        )
        : attribution?.confidence || 0;
    const roleGroups = new Map<string, { count: number; hourlyCost: number; totalCost: number }>();
    for (const attendee of meetingAttendees) {
      const role = attendee.role_name || "Unknown";
      const hourlyCost = asNumber(attendee.hourly_cost_snapshot);
      const current = roleGroups.get(role) || { count: 0, hourlyCost, totalCost: 0 };
      current.count += 1;
      current.totalCost += hourlyCost * duration / 60;
      roleGroups.set(role, current);
    }

    return {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description || "",
      projectId: attribution?.project_id || null,
      project: attribution?.project_id ? projectNameById.get(attribution.project_id) || "Unattributed" : "Unattributed",
      team: meeting.department || "Cross-team",
      startsAt: meeting.starts_at,
      date: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(meeting.starts_at)),
      duration,
      attendees: meetingAttendees.length,
      cost: Math.round(cost),
      confidence: calibratedConfidence,
      roi: outcome?.roi_score || 0,
      recurring: meeting.recurring,
      status: meeting.risk,
      evidence: {
        ...evidenceScores,
      },
      reason: attribution?.reason || "No attribution has been recorded.",
      attendeeBreakdown: [...roleGroups.entries()]
        .map(([role, values]) => ({ role, count: values.count, hourlyCost: Math.round(values.hourlyCost), totalCost: Math.round(values.totalCost) }))
        .sort((a, b) => b.totalCost - a.totalCost),
    };
  });

  const usedByProject = new Map<string, number>();
  let unattributedCost = 0;
  for (const meeting of appMeetings) {
    if (meeting.projectId) usedByProject.set(meeting.projectId, (usedByProject.get(meeting.projectId) || 0) + meeting.cost);
    else unattributedCost += meeting.cost;
  }

  const appProjects: AppProject[] = projects.map((project) => {
    const used = Math.round(usedByProject.get(project.id) || 0);
    const budget = asNumber(project.monthly_budget);
    const projectMeetings = appMeetings.filter((meeting) => meeting.projectId === project.id);
    const expenseByRole = new Map<string, number>();
    for (const meeting of projectMeetings) {
      for (const item of meeting.attendeeBreakdown) {
        expenseByRole.set(item.role, (expenseByRole.get(item.role) || 0) + item.totalCost);
      }
    }
    return {
      id: project.id,
      name: project.name,
      owner: project.owner_name || "Unassigned",
      team: project.team || "Cross-team",
      priority: project.priority,
      budget,
      used,
      projected: Math.round(used * 1.24),
      status: project.status,
      keywords: project.keywords || [],
      trend: budget ? Math.round((used / budget - 0.65) * 100) : 0,
      meetingCount: projectMeetings.length,
      averageMeetingCost: projectMeetings.length ? Math.round(used / projectMeetings.length) : 0,
      expenseBreakdown: [...expenseByRole.entries()]
        .map(([label, amount]) => ({ label, amount: Math.round(amount), percentage: used ? Math.round(amount / used * 100) : 0 }))
        .sort((a, b) => b.amount - a.amount),
      topMeetings: [...projectMeetings]
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
        .map((meeting) => ({ id: meeting.id, title: meeting.title, cost: meeting.cost, duration: meeting.duration, attendees: meeting.attendees })),
    };
  });

  const appAnomalies: AppAnomaly[] = (anomaliesResult.data || []).map((anomaly) => ({
    id: anomaly.id,
    type: anomaly.anomaly_type,
    title: anomaly.title,
    detail: anomaly.detail || "",
    severity: anomaly.severity,
    saving: asNumber(anomaly.potential_saving),
    status: anomaly.status,
    projectId: anomaly.project_id,
    meetingId: anomaly.meeting_id,
  }));

  const totalCost = appMeetings.reduce((sum, meeting) => sum + meeting.cost, 0);
  const activeAnomalies = appAnomalies.filter((anomaly) => anomaly.status === "open");

  return {
    persistence: "supabase",
    organization,
    metrics: {
      totalCost,
      potentialSavings: activeAnomalies.reduce((sum, anomaly) => sum + anomaly.saving, 0),
      unattributedCost,
      averageRoi: appMeetings.length ? Math.round(appMeetings.reduce((sum, meeting) => sum + meeting.roi, 0) / appMeetings.length) : 0,
      activeAnomalies: activeAnomalies.length,
      meetingCount: appMeetings.length,
    },
    projects: appProjects,
    meetings: appMeetings,
    anomalies: appAnomalies,
    costBands: (bandsResult.data || []).map((band) => ({
      id: band.id,
      roleName: band.role_name,
      hourlyCost: asNumber(band.hourly_cost),
    })),
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function writeAuditLog(organizationId: string, action: string, entityType: string, entityId: string, metadata: Record<string, unknown> = {}) {
  const { error } = await createAdminClient().from("audit_logs").insert({
    organization_id: organizationId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  });
  if (error) throw error;
}
