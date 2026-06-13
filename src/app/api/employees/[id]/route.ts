import { ensureDemoData } from "@/lib/meetcost-data";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return Response.json({ error: "Employee ID is required." }, { status: 400 });
  }

  try {
    const organization = await ensureDemoData();
    const { error } = await createAdminClient()
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("organization_id", organization.id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to remove employee." },
      { status: 500 },
    );
  }
}
