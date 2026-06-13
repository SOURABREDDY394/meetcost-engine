import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  title?: string;
  description?: string;
  projectId?: string;
  department?: string;
  duration?: number;
  attendeeCount?: number;
  roleName?: string;
  hourlyCost?: number;
  recurring?: boolean;
  roi?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.title?.trim()) return Response.json({ error: "Meeting title is required." }, { status: 400 });
  const duration = Math.max(5, Number(body.duration) || 30);
  const attendeeCount = Math.max(1, Math.min(100, Number(body.attendeeCount) || 1));
  const hourlyCost = Math.max(0, Number(body.hourlyCost) || 1200);

  try {
    const supabase = createAdminClient();
    const organization = await ensureDemoData();
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + duration * 60000);
    let projectName: string | null = null;
    if (body.projectId) {
      const { data } = await supabase.from("projects").select("name").eq("id", body.projectId).eq("organization_id", organization.id).maybeSingle();
      projectName = data?.name || null;
    }

    const { data: meeting, error } = await supabase.from("meetings").insert({
      organization_id: organization.id,
      external_id: `manual-${crypto.randomUUID()}`,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      department: body.department?.trim() || "Unassigned",
      project_hint: projectName,
      recurring: Boolean(body.recurring),
      recurrence_key: body.recurring ? body.title.trim().toLowerCase().replace(/\W+/g, "-") : null,
      risk: body.projectId ? "clear" : "review",
    }).select("id").single();
    if (error) throw error;

    const attendees = Array.from({ length: attendeeCount }, (_, index) => ({
      meeting_id: meeting.id,
      attendee_email: `manual-${meeting.id}-${index}@meetcost.local`,
      role_name: body.roleName?.trim() || "Engineer",
      hourly_cost_snapshot: hourlyCost,
    }));
    const { error: attendeeError } = await supabase.from("meeting_attendees").insert(attendees);
    if (attendeeError) throw attendeeError;
    const { error: attributionError } = await supabase.from("attributions").insert({
      meeting_id: meeting.id,
      project_id: body.projectId || null,
      confidence: body.projectId ? 100 : 0,
      evidence: body.projectId
        ? { titleMatch: 0, descriptionMatch: 0, attendeeMatch: 0, projectHintMatch: 100, source: "manual" }
        : { source: "manual_unattributed" },
      reason: body.projectId ? "Manually assigned while recording the expense." : "Added without a project and queued for AI review.",
    });
    if (attributionError) throw attributionError;
    await supabase.from("meeting_outcomes").insert({
      meeting_id: meeting.id,
      outcome_type: "manual",
      roi_score: Math.max(0, Math.min(100, Number(body.roi) || 50)),
      summary: "Manually recorded meeting expense.",
    });
    await writeAuditLog(organization.id, "meeting_created", "meeting", meeting.id, {
      estimatedCost: Math.round(attendeeCount * hourlyCost * duration / 60),
    });
    return Response.json({ id: meeting.id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to add meeting." }, { status: 500 });
  }
}
