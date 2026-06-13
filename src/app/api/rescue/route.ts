import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { isMissingSchema, updateLocalAnomaly } from "@/lib/local-store";

type Body = { anomalyId?: string; applied?: boolean };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.anomalyId) return Response.json({ error: "An anomaly is required." }, { status: 400 });

  try {
    const organization = await ensureDemoData();
    const status = body.applied === false ? "open" : "resolved";
    const { data, error } = await createAdminClient()
      .from("anomalies")
      .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
      .eq("id", body.anomalyId)
      .eq("organization_id", organization.id)
      .select("id,potential_saving,status")
      .single();
    if (error) throw error;
    await writeAuditLog(organization.id, body.applied === false ? "rescue_undone" : "rescue_applied", "anomaly", body.anomalyId, {
      potentialSaving: data.potential_saving,
    });
    return Response.json(data);
  } catch (error) {
    if (isMissingSchema(error)) return Response.json(await updateLocalAnomaly(body.anomalyId, body.applied === false ? "open" : "resolved"));
    return Response.json({ error: error instanceof Error ? error.message : "Unable to apply recommendation." }, { status: 500 });
  }
}
