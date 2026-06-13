import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = { projectId?: string | null };

export async function PATCH(request: Request, context: RouteContext<"/api/attributions/[meetingId]">) {
  const { meetingId } = await context.params;
  const body = (await request.json()) as Body;
  try {
    const organization = await ensureDemoData();
    const supabase = createAdminClient();
    const { error } = await supabase.from("attributions").upsert({
      meeting_id: meetingId,
      project_id: body.projectId || null,
      confidence: body.projectId ? 100 : 0,
      evidence: { source: "human_correction" },
      reason: body.projectId ? "Confirmed by a human reviewer." : "A human reviewer kept this meeting unattributed.",
      corrected_at: new Date().toISOString(),
    }, { onConflict: "meeting_id" });
    if (error) throw error;
    await supabase.from("meetings").update({ risk: body.projectId ? "clear" : "review" }).eq("id", meetingId).eq("organization_id", organization.id);
    await writeAuditLog(organization.id, "attribution_corrected", "meeting", meetingId, { projectId: body.projectId || null });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to correct attribution." }, { status: 500 });
  }
}
