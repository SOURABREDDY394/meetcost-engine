import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  name?: string;
  owner?: string;
  team?: string;
  priority?: "low" | "medium" | "high";
  monthlyBudget?: number;
  keywords?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.name?.trim()) return Response.json({ error: "Project name is required." }, { status: 400 });
  if (!Number.isFinite(body.monthlyBudget) || Number(body.monthlyBudget) < 0) {
    return Response.json({ error: "Enter a valid monthly budget." }, { status: 400 });
  }

  try {
    const organization = await ensureDemoData();
    const { data, error } = await createAdminClient().from("projects").insert({
      organization_id: organization.id,
      name: body.name.trim(),
      owner_name: body.owner?.trim() || null,
      team: body.team?.trim() || null,
      priority: body.priority || "medium",
      monthly_budget: Number(body.monthlyBudget),
      keywords: (body.keywords || []).map((keyword) => keyword.trim().toLowerCase()).filter(Boolean),
      status: "active",
    }).select("*").single();
    if (error) throw error;
    await writeAuditLog(organization.id, "project_created", "project", data.id, { name: data.name });
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create project." }, { status: 500 });
  }
}
