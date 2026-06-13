import { ensureDemoData } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const organization = await ensureDemoData();
    const { data, error } = await createAdminClient()
      .from("employees")
      .select("id,external_id,display_name,email,role_name,department,team,created_at")
      .eq("organization_id", organization.id)
      .order("display_name");
    if (error) throw error;
    return Response.json(data ?? []);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load employees." },
      { status: 500 },
    );
  }
}

type Body = {
  displayName?: string;
  email?: string;
  roleName?: string;
  department?: string;
  team?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.displayName?.trim()) {
    return Response.json({ error: "Employee name is required." }, { status: 400 });
  }
  if (!body.roleName?.trim()) {
    return Response.json({ error: "Role is required." }, { status: 400 });
  }

  try {
    const organization = await ensureDemoData();
    const { data, error } = await createAdminClient()
      .from("employees")
      .insert({
        organization_id: organization.id,
        display_name: body.displayName.trim(),
        email: body.email?.trim() || null,
        role_name: body.roleName.trim(),
        department: body.department?.trim() || null,
        team: body.team?.trim() || null,
      })
      .select("id,external_id,display_name,email,role_name,department,team,created_at")
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to add employee." },
      { status: 500 },
    );
  }
}
