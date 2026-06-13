import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGroqClient } from "@/lib/groq";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { connected: false, reason: "Supabase environment variables are missing." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
    });

    let database: "ready" | "schema-missing" | "unavailable" = "unavailable";
    let ai = false;

    if (response.ok && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error } = await createAdminClient()
        .from("organizations")
        .select("id")
        .limit(1);

      database = error?.code === "PGRST205" || error?.code === "42P01" || error?.message?.includes("schema cache")
        ? "schema-missing"
        : error
          ? "unavailable"
          : "ready";
    }

    if (process.env.GROQ_API_KEY) {
      try {
        await getGroqClient().models.list();
        ai = true;
      } catch {
        ai = false;
      }
    }

    return NextResponse.json({
      connected: response.ok,
      service: "supabase",
      mode: "publishable-key",
      database,
      persistence: database === "ready" ? "supabase" : "local-fallback",
      ai,
      aiProvider: "groq",
    });
  } catch {
    return NextResponse.json(
      { connected: false, reason: "Supabase could not be reached." },
      { status: 503 },
    );
  }
}
