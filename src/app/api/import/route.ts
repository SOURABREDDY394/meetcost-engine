import Papa from "papaparse";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import type { ImportSummary } from "@/lib/app-types";
import { importLocalMeetings, isMissingSchema } from "@/lib/local-store";

type CsvRow = {
  title?: string;
  start?: string;
  end?: string;
  duration_minutes?: string;
  attendees?: string;
  attendee_roles?: string;
  project?: string;
  department?: string;
  recurring?: string;
  description?: string;
};

function parseBoolean(value?: string) {
  return ["true", "yes", "1", "recurring"].includes((value || "").trim().toLowerCase());
}

function parseDate(value: string | undefined, fallback: Date) {
  const parsed = value ? new Date(value) : fallback;
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let csv = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (file instanceof File) csv = await file.text();
  } else {
    const body = (await request.json()) as { csv?: string };
    csv = body.csv || "";
  }

  if (!csv.trim()) return Response.json({ error: "Upload a non-empty CSV file." }, { status: 400 });

  const parsed = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (parsed.errors.length && !parsed.data.length) {
    return Response.json({ error: parsed.errors[0].message }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const organization = await ensureDemoData();
    const [{ data: projects, error: projectError }, { data: bands, error: bandError }] = await Promise.all([
      supabase.from("projects").select("id,name").eq("organization_id", organization.id),
      supabase.from("cost_bands").select("role_name,hourly_cost").eq("organization_id", organization.id),
    ]);
    if (projectError) throw projectError;
    if (bandError) throw bandError;

    const projectByName = new Map((projects || []).map((project) => [project.name.toLowerCase(), project.id]));
    const bandByRole = new Map((bands || []).map((band) => [band.role_name.toLowerCase(), Number(band.hourly_cost)]));
    const summary: ImportSummary = {
      imported: 0,
      recurring: 0,
      missingProjects: 0,
      needsReview: 0,
      estimatedCost: 0,
      errors: parsed.errors.map((error) => `Row ${error.row ?? "?"}: ${error.message}`).slice(0, 5),
    };

    for (let index = 0; index < parsed.data.length; index += 1) {
      const row = parsed.data[index];
      if (!row.title?.trim()) {
        summary.errors.push(`Row ${index + 2}: title is required.`);
        continue;
      }

      const fallbackStart = new Date(Date.now() + index * 3600000);
      const startsAt = parseDate(row.start, fallbackStart);
      const duration = Math.max(5, Number(row.duration_minutes) || 30);
      const endsAt = parseDate(row.end, new Date(startsAt.getTime() + duration * 60000));
      const projectId = row.project ? projectByName.get(row.project.trim().toLowerCase()) || null : null;
      const recurring = parseBoolean(row.recurring);
      const attendeeValues = (row.attendees || "Imported attendee")
        .split(/[;,]/)
        .map((value) => value.trim())
        .filter(Boolean);
      const roleValues = (row.attendee_roles || "Engineer")
        .split(/[;,]/)
        .map((value) => value.trim())
        .filter(Boolean);
      const externalId = `csv-${Date.now()}-${index}`;

      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .insert({
          organization_id: organization.id,
          external_id: externalId,
          title: row.title.trim(),
          description: row.description || "",
          starts_at: startsAt.toISOString(),
          ends_at: endsAt > startsAt ? endsAt.toISOString() : new Date(startsAt.getTime() + duration * 60000).toISOString(),
          department: row.department || "Imported",
          project_hint: row.project || null,
          recurring,
          recurrence_key: recurring ? row.title.trim().toLowerCase().replace(/\W+/g, "-") : null,
          risk: projectId ? "clear" : "review",
        })
        .select("id")
        .single();
      if (meetingError) {
        summary.errors.push(`Row ${index + 2}: ${meetingError.message}`);
        continue;
      }

      const attendeeRows = attendeeValues.map((value, attendeeIndex) => {
        const isEmail = value.includes("@");
        const role = roleValues[attendeeIndex] || roleValues[0] || "Engineer";
        return {
          meeting_id: meeting.id,
          attendee_email: isEmail ? value : `imported-${index}-${attendeeIndex}@meetcost.local`,
          role_name: role,
          hourly_cost_snapshot: bandByRole.get(role.toLowerCase()) || 1200,
        };
      });
      const { error: attendeeError } = await supabase.from("meeting_attendees").insert(attendeeRows);
      if (attendeeError) throw attendeeError;

      const confidence = projectId ? 82 : 34;
      const { error: attributionError } = await supabase.from("attributions").insert({
        meeting_id: meeting.id,
        project_id: projectId,
        confidence,
        evidence: {
          titleMatch: projectId ? 76 : 25,
          descriptionMatch: row.description ? 62 : 18,
          attendeeMatch: 55,
          projectHintMatch: projectId ? 98 : 10,
        },
        reason: projectId ? "Imported project hint matched an existing project." : "No known project matched the imported row.",
      });
      if (attributionError) throw attributionError;

      const { error: outcomeError } = await supabase.from("meeting_outcomes").insert({
        meeting_id: meeting.id,
        outcome_type: "imported",
        roi_score: 50,
        summary: "Awaiting outcome review after calendar import.",
      });
      if (outcomeError) throw outcomeError;

      const estimatedCost = attendeeRows.reduce((sum, attendee) => sum + Number(attendee.hourly_cost_snapshot) * duration / 60, 0);
      summary.imported += 1;
      summary.recurring += recurring ? 1 : 0;
      summary.missingProjects += projectId ? 0 : 1;
      summary.needsReview += confidence < 60 ? 1 : 0;
      summary.estimatedCost += Math.round(estimatedCost);
    }

    await writeAuditLog(organization.id, "calendar_csv_imported", "meeting", "batch", summary);
    return Response.json(summary);
  } catch (error) {
    if (isMissingSchema(error)) {
      return Response.json(await importLocalMeetings(parsed.data as Array<Record<string, string | undefined>>));
    }
    return Response.json({ error: error instanceof Error ? error.message : "Calendar import failed." }, { status: 500 });
  }
}
