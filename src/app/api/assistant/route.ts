import { getGroqClient, getGroqModel } from "@/lib/groq";
import { getAppData } from "@/lib/meetcost-data";

type Body = { question?: string; projectId?: string | null };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  if (!body.question?.trim()) return Response.json({ error: "Ask a question first." }, { status: 400 });

  try {
    const data = await getAppData();
    const project = body.projectId ? data.projects.find((item) => item.id === body.projectId) : null;
    const context = {
      metrics: data.metrics,
      selectedProject: project || null,
      projects: data.projects.map((item) => ({
        id: item.id, name: item.name, budget: item.budget, used: item.used, projected: item.projected,
        meetingCount: item.meetingCount, averageMeetingCost: item.averageMeetingCost,
        expenseBreakdown: item.expenseBreakdown, topMeetings: item.topMeetings,
      })),
      reviewMeetings: data.meetings.filter((meeting) => meeting.status !== "clear").slice(0, 8),
      openAnomalies: data.anomalies.filter((anomaly) => anomaly.status === "open"),
    };

    const systemPrompt = `You are MeetCost Strategist, a friendly and intelligent AI assistant embedded in the MeetCost corporate cost intelligence platform.

Your personality:
- Warm, concise, and helpful
- Handle ANY message naturally — greetings, casual chat, general questions, jokes — like a real assistant would
- Never refuse a message or say "I can only answer about meetings"

Your expertise (use the workspace data below when relevant):
- Meeting cost analysis, project budget health, ROI calculations
- Identifying expensive or low-value meetings
- Actionable cost-saving recommendations
- Explaining INR amounts, burn rates, and anomalies

Rules when answering cost/budget questions:
- Cite specific projects, meetings, and INR amounts from the live workspace data
- Distinguish facts from recommendations
- Say clearly when data is missing rather than inventing numbers

For casual messages (greetings, general chat, off-topic questions):
- Respond naturally and helpfully
- You can briefly mention your specialty if relevant, but never refuse to engage
- Keep it friendly and short

Live workspace data (use when relevant):
${JSON.stringify(context, null, 2)}`;

    const completion = await getGroqClient().chat.completions.create({
      model: getGroqModel(),
      temperature: 0.5,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: body.question! },
      ],
    });
    return Response.json({ answer: completion.choices[0]?.message?.content || "I could not produce an answer." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Assistant failed." }, { status: 502 });
  }
}

