import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = { confirmation?: string };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (body.confirmation !== "CLEAR_DEMO") {
    return Response.json({ error: "Explicit confirmation is required." }, { status: 400 });
  }

  try {
    const organization = await ensureDemoData();
    const supabase = createAdminClient();
    const { data: meetings, error: meetingsReadError } = await supabase.from("meetings").select("id").eq("organization_id", organization.id);
    if (meetingsReadError) throw meetingsReadError;
    const meetingIds = (meetings || []).map((meeting) => meeting.id);
    if (meetingIds.length) {
      const { error } = await supabase.from("meetings").delete().in("id", meetingIds);
      if (error) throw error;
    }
    const { error: anomalyError } = await supabase.from("anomalies").delete().eq("organization_id", organization.id);
    if (anomalyError) throw anomalyError;
    const { error: projectError } = await supabase.from("projects").delete().eq("organization_id", organization.id);
    if (projectError) throw projectError;
    const { error: employeeError } = await supabase.from("employees").delete().eq("organization_id", organization.id);
    if (employeeError) throw employeeError;
    await writeAuditLog(organization.id, "workspace_demo_cleared", "organization", organization.id);
    return Response.json({ cleared: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to clear workspace." }, { status: 500 });
  }
}
