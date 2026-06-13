export type MeetingRisk = "clear" | "review" | "risk";
export type AnomalyStatus = "open" | "resolved";

export type AppProject = {
  id: string;
  name: string;
  owner: string;
  team: string;
  priority: "low" | "medium" | "high";
  budget: number;
  used: number;
  projected: number;
  status: "active" | "paused" | "completed";
  keywords: string[];
  trend: number;
  meetingCount: number;
  averageMeetingCost: number;
  expenseBreakdown: Array<{
    label: string;
    amount: number;
    percentage: number;
  }>;
  topMeetings: Array<{
    id: string;
    title: string;
    cost: number;
    duration: number;
    attendees: number;
  }>;
};

export type AppMeeting = {
  id: string;
  title: string;
  description: string;
  projectId: string | null;
  project: string;
  team: string;
  startsAt: string;
  date: string;
  duration: number;
  attendees: number;
  cost: number;
  confidence: number;
  roi: number;
  recurring: boolean;
  status: MeetingRisk;
  evidence: {
    titleMatch: number;
    descriptionMatch: number;
    attendeeMatch: number;
    projectHintMatch: number;
  };
  reason: string;
  attendeeBreakdown: Array<{
    role: string;
    count: number;
    hourlyCost: number;
    totalCost: number;
  }>;
};

export type AppAnomaly = {
  id: string;
  type: string;
  title: string;
  detail: string;
  severity: string;
  saving: number;
  status: AnomalyStatus;
  projectId: string | null;
  meetingId: string | null;
};

export type AppMetrics = {
  totalCost: number;
  potentialSavings: number;
  unattributedCost: number;
  averageRoi: number;
  activeAnomalies: number;
  meetingCount: number;
};

export type AppData = {
  persistence: "supabase" | "local";
  organization: {
    id: string;
    name: string;
    currency: string;
  };
  metrics: AppMetrics;
  projects: AppProject[];
  meetings: AppMeeting[];
  anomalies: AppAnomaly[];
  costBands: Array<{ id: string; roleName: string; hourlyCost: number }>;
  lastSyncedAt: string;
};

export type ImportSummary = {
  imported: number;
  recurring: number;
  missingProjects: number;
  needsReview: number;
  estimatedCost: number;
  errors: string[];
};
