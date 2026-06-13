import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { isMissingSchema, updateLocalProject } from "@/lib/local-store";

type Body = {
  monthlyBudget?: number;
  priority?: "low" | "medium" | "high";
  status?: "active" | "paused" | "completed";
};

export async function PATCH(request: Request, context: RouteContext<"/api/projects/[id]">) {
  const { id } = await context.params;
  const body = (await request.json()) as Body;
  const updates: Record<string, unknown> = {};
  if (typeof body.monthlyBudget === "number" && body.monthlyBudget >= 0) updates.monthly_budget = body.monthlyBudget;
  if (body.priority) updates.priority = body.priority;
  if (body.status) updates.status = body.status;
  if (!Object.keys(updates).length) return Response.json({ error: "No valid project updates supplied." }, { status: 400 });

  try {
    const organization = await ensureDemoData();
    const { data, error } = await createAdminClient()
      .from("projects")
      .update(updates)
      .eq("id", id)
      .eq("organization_id", organization.id)
      .select("*")
      .single();
    if (error) throw error;
    await writeAuditLog(organization.id, "project_updated", "project", id, updates);
    return Response.json(data);
  } catch (error) {
    if (isMissingSchema(error)) return Response.json(await updateLocalProject(id, body.monthlyBudget));
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update project." }, { status: 500 });
  }
}
