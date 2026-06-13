import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = createAdminClient();
    const organization = await ensureDemoData();
    const [{ data: meetings, error: meetingError }, { data: projects, error: projectError }, { data: attributions, error: attributionError }] = await Promise.all([
      supabase.from("meetings").select("id,title,description,project_hint,risk").eq("organization_id", organization.id),
      supabase.from("projects").select("id,name,keywords").eq("organization_id", organization.id),
      supabase.from("attributions").select("meeting_id,project_id,confidence"),
    ]);
    if (meetingError) throw meetingError;
    if (projectError) throw projectError;
    if (attributionError) throw attributionError;

    const attributionByMeeting = new Map((attributions || []).map((item) => [item.meeting_id, item]));
    let assigned = 0;
    let queued = 0;
    for (const meeting of meetings || []) {
      const text = `${meeting.title} ${meeting.description || ""} ${meeting.project_hint || ""}`.toLowerCase();
      const scored = (projects || []).map((project) => {
        const terms = [project.name, ...(project.keywords || [])].map((term) => term.toLowerCase());
        const matches = terms.filter((term) => text.includes(term)).length;
        return { project, score: terms.length ? matches / terms.length : 0 };
      }).sort((a, b) => b.score - a.score);
      const best = scored[0];
      const second = scored[1];
      const existing = attributionByMeeting.get(meeting.id);
      if (best && best.score > 0 && (!existing?.project_id || existing.confidence < 60)) {
        const confidence = Math.round(Math.min(96, 45 + best.score * 42 + Math.max(0, best.score - (second?.score || 0)) * 18));
        await supabase.from("attributions").upsert({
          meeting_id: meeting.id,
          project_id: confidence >= 60 ? best.project.id : null,
          confidence,
          evidence: { lexicalMatch: Math.round(best.score * 100), ambiguityMargin: Math.round((best.score - (second?.score || 0)) * 100), source: "autopilot" },
          reason: confidence >= 60 ? `Autopilot matched project name and keywords with ${Math.round(best.score * 100)}% lexical coverage.` : "Autopilot found competing project signals and kept this for review.",
        }, { onConflict: "meeting_id" });
        await supabase.from("meetings").update({ risk: confidence >= 60 ? "clear" : "review" }).eq("id", meeting.id);
        if (confidence >= 60) assigned += 1; else queued += 1;
      } else if (!existing?.project_id) {
        queued += 1;
      }
    }
    await writeAuditLog(organization.id, "data_autopilot_completed", "organization", organization.id, { assigned, queued });
    return Response.json({ assigned, queued, scanned: meetings?.length || 0 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Autopilot failed." }, { status: 500 });
  }
}
