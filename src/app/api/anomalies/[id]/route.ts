import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { isMissingSchema, updateLocalAnomaly } from "@/lib/local-store";

type Body = { status?: "open" | "resolved" };

export async function PATCH(request: Request, context: RouteContext<"/api/anomalies/[id]">) {
  const { id } = await context.params;
  const body = (await request.json()) as Body;
  if (body.status !== "open" && body.status !== "resolved") {
    return Response.json({ error: "A valid anomaly status is required." }, { status: 400 });
  }

  try {
    const organization = await ensureDemoData();
    const { data, error } = await createAdminClient()
      .from("anomalies")
      .update({ status: body.status, resolved_at: body.status === "resolved" ? new Date().toISOString() : null })
      .eq("id", id)
      .eq("organization_id", organization.id)
      .select("id,status")
      .single();
    if (error) throw error;
    await writeAuditLog(organization.id, `anomaly_${body.status}`, "anomaly", id);
    return Response.json(data);
  } catch (error) {
    if (isMissingSchema(error)) return Response.json(await updateLocalAnomaly(id, body.status));
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update anomaly." }, { status: 500 });
  }
}
