import { getAppData } from "@/lib/meetcost-data";
import { isMissingSchema, readLocalData } from "@/lib/local-store";

export async function GET() {
  try {
    return Response.json(await getAppData());
  } catch (error) {
    if (isMissingSchema(error)) return Response.json(await readLocalData());
    const message = error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "Unable to load MeetCost data.";
    return Response.json({ error: message }, { status: 500 });
  }
}
