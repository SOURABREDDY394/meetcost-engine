import { NextResponse } from "next/server";
import { getGroqClient, getGroqModel } from "@/lib/groq";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureDemoData, writeAuditLog } from "@/lib/meetcost-data";
import { isMissingSchema, updateLocalAttribution } from "@/lib/local-store";

type AttributionRequest = {
  title?: string;
  description?: string;
  attendees?: string[];
  projectHint?: string;
  projects?: Array<{
    id: string;
    name: string;
    keywords?: string[];
    team?: string;
  }>;
  meetingId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as AttributionRequest;

  if (!body.title || !body.projects?.length) {
    return NextResponse.json(
      { error: "A meeting title and at least one project are required." },
      { status: 400 },
    );
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: getGroqModel(),
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You compare a corporate meeting against every candidate project. Return JSON only with projectId, projectName, reason, and evidence containing titleMatch, descriptionMatch, attendeeMatch, projectHintMatch as honest 0-100 integers, plus secondBestScore as a 0-100 integer. Do not return confidence. Project hints are only one signal and must not guarantee a match. Use null projectId and projectName 'Unattributed' when evidence is weak or candidates are ambiguous.",
        },
        {
          role: "user",
          content: JSON.stringify(body),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("The model returned an empty response.");

    const result = JSON.parse(content) as {
      projectId: string | null;
      projectName: string;
      reason: string;
      evidence: Record<string, number> & { secondBestScore?: number };
    };
    const evidence = {
      titleMatch: Math.max(0, Math.min(100, Number(result.evidence.titleMatch || 0))),
      descriptionMatch: Math.max(0, Math.min(100, Number(result.evidence.descriptionMatch || 0))),
      attendeeMatch: Math.max(0, Math.min(100, Number(result.evidence.attendeeMatch || 0))),
      projectHintMatch: Math.max(0, Math.min(100, Number(result.evidence.projectHintMatch || 0))),
    };
    const rawScore = evidence.titleMatch * 0.35
      + evidence.descriptionMatch * 0.25
      + evidence.attendeeMatch * 0.15
      + evidence.projectHintMatch * 0.25;
    const ambiguityPenalty = Math.max(0, Number(result.evidence.secondBestScore || 0) - 35) * 0.22;
    const confidence = Math.max(8, Math.min(97, Math.round(rawScore - ambiguityPenalty)));
    const selectedProject = body.projects.find((project) => project.id === result.projectId);
    const validProjectId = selectedProject && confidence >= 58 ? selectedProject.id : null;
    const calibratedResult = {
      projectId: validProjectId,
      projectName: validProjectId ? selectedProject?.name || "Unattributed" : "Unattributed",
      confidence,
      needsReview: confidence < 72,
      reason: `${result.reason} Calibrated from weighted evidence${ambiguityPenalty ? " with an ambiguity penalty" : ""}.`,
      evidence,
    };

    if (body.meetingId) {
      try {
        const organization = await ensureDemoData();
        const { error } = await createAdminClient()
          .from("attributions")
          .upsert({
            meeting_id: body.meetingId,
            project_id: validProjectId,
            confidence,
            evidence,
            reason: calibratedResult.reason,
            corrected_at: null,
          }, { onConflict: "meeting_id" });
        if (error) throw error;

        await createAdminClient()
          .from("meetings")
          .update({ risk: confidence < 72 ? "review" : "clear" })
          .eq("id", body.meetingId)
          .eq("organization_id", organization.id);
        await writeAuditLog(organization.id, "ai_attribution_recorded", "meeting", body.meetingId, {
          projectId: validProjectId,
          confidence,
        });
      } catch (persistenceError) {
        if (!isMissingSchema(persistenceError)) throw persistenceError;
        await updateLocalAttribution(body.meetingId, {
          projectId: validProjectId,
          projectName: calibratedResult.projectName,
          confidence,
          reason: calibratedResult.reason,
          evidence,
        });
      }
    }

    return NextResponse.json(calibratedResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI attribution failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
