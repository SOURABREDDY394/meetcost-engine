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
    const completion = await getGroqClient().chat.completions.create({
      model: getGroqModel(),
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content: "You are MeetCost Copilot, a concise finance and meeting-operations analyst. Answer only from the supplied live workspace data. Explain calculations in plain language, cite specific projects/meetings and INR amounts, distinguish facts from recommendations, and say when data is missing. Never invent expenses.",
        },
        { role: "user", content: `Workspace data:\n${JSON.stringify(context)}\n\nQuestion: ${body.question}` },
      ],
    });
    return Response.json({ answer: completion.choices[0]?.message?.content || "I could not produce an answer." });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Assistant failed." }, { status: 502 });
  }
}
