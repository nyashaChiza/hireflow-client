import apiClient from "./client";
import {
  AuthResponse, LoginPayload, RegisterPayload,
  JobPost, CreateJobPayload, AIGenerateJobPayload, AIGenerateJobResponse,
  Criterion, CreateCriterionPayload, CriteriaSummary,
  Application, ApplicationStatus,
  RankedApplication, ScoreOverridePayload,
  Interview, InterviewCriterion, ScorecardScore, ScheduleInterviewPayload,
  CompositeCandidate, FinalSelectionPayload,
  DashboardOverview, PipelineSummary, AIPerformanceReport,
} from "../../types";

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export const authAPI = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};

// ─────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────

export const jobsAPI = {
  list: async (status?: string): Promise<JobPost[]> => {
    const { data } = await apiClient.get("/jobs", { params: { status } });
    return data;
  },

  get: async (jobId: string): Promise<JobPost> => {
    const { data } = await apiClient.get(`/jobs/${jobId}`);
    return data;
  },

  create: async (payload: CreateJobPayload): Promise<JobPost> => {
    const { data } = await apiClient.post("/jobs", payload);
    return data;
  },

  update: async (jobId: string, payload: Partial<CreateJobPayload>): Promise<JobPost> => {
    const { data } = await apiClient.patch(`/jobs/${jobId}`, payload);
    return data;
  },

  publish: async (jobId: string): Promise<JobPost> => {
    const { data } = await apiClient.post(`/jobs/${jobId}/publish`);
    return data;
  },

  close: async (jobId: string): Promise<JobPost> => {
    const { data } = await apiClient.post(`/jobs/${jobId}/close`);
    return data;
  },

  delete: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}`);
  },

  aiGenerate: async (payload: AIGenerateJobPayload): Promise<AIGenerateJobResponse> => {
    const { data } = await apiClient.post("/jobs/ai/generate", payload);
    return data;
  },

  aiImprove: async (jobPostId: string, currentText: string) => {
    const { data } = await apiClient.post("/jobs/ai/improve", {
      job_post_id: jobPostId,
      current_text: currentText,
    });
    return data;
  },

  publicListings: async (): Promise<Partial<JobPost>[]> => {
    const { data } = await apiClient.get("/jobs/public/listings");
    return data;
  },
};

// ─────────────────────────────────────────
// CRITERIA
// ─────────────────────────────────────────

export const criteriaAPI = {
  getForJob: async (jobId: string): Promise<Criterion[]> => {
    const { data } = await apiClient.get(`/criteria/job/${jobId}`);
    return data;
  },

  getSummary: async (jobId: string): Promise<CriteriaSummary> => {
    const { data } = await apiClient.get(`/criteria/job/${jobId}/summary`);
    return data;
  },

  create: async (payload: CreateCriterionPayload): Promise<Criterion> => {
    const { data } = await apiClient.post("/criteria", payload);
    return data;
  },

  bulkCreate: async (jobId: string, criteria: CreateCriterionPayload[]) => {
    const { data } = await apiClient.post(`/criteria/bulk?job_post_id=${jobId}`, criteria);
    return data;
  },

  update: async (criterionId: string, updates: Partial<CreateCriterionPayload>): Promise<Criterion> => {
    const { data } = await apiClient.patch(`/criteria/${criterionId}`, updates);
    return data;
  },

  delete: async (criterionId: string): Promise<void> => {
    await apiClient.delete(`/criteria/${criterionId}`);
  },

  aiSuggest: async (jobId: string) => {
    const { data } = await apiClient.post("/criteria/ai/suggest", { job_post_id: jobId });
    return data;
  },

  aiSuggestAndSave: async (jobId: string) => {
    const { data } = await apiClient.post("/criteria/ai/suggest-and-save", { job_post_id: jobId });
    return data;
  },
};

// ─────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────

export const applicationsAPI = {
  listForJob: async (jobId: string, status?: ApplicationStatus, orderBy?: string) => {
    const { data } = await apiClient.get(`/applications/job/${jobId}`, {
      params: { status, order_by: orderBy },
    });
    return data;
  },

  get: async (applicationId: string): Promise<Application> => {
    const { data } = await apiClient.get(`/applications/${applicationId}`);
    return data;
  },

  getPipeline: async (jobId: string) => {
    const { data } = await apiClient.get(`/applications/job/${jobId}/pipeline`);
    return data;
  },

  updateStatus: async (applicationId: string, status: ApplicationStatus, rejectionReason?: string) => {
    const { data } = await apiClient.patch(`/applications/${applicationId}/status`, {
      status,
      rejection_reason: rejectionReason,
    });
    return data;
  },

  updateNotes: async (applicationId: string, notes: string) => {
    const { data } = await apiClient.patch(
      `/applications/${applicationId}/notes`,
      null,
      { params: { notes } }
    );
    return data;
  },

  getCandidateProfile: async (candidateId: string) => {
    const { data } = await apiClient.get(`/applications/candidate/${candidateId}`);
    return data;
  },

  bulkUpdateStatus: async (
    jobId: string,
    applicationIds: string[],
    newStatus: ApplicationStatus,
    rejectionReason?: string
  ) => {
    const { data } = await apiClient.patch(
      `/applications/job/${jobId}/bulk-status`,
      applicationIds,
      { params: { new_status: newStatus, rejection_reason: rejectionReason } }
    );
    return data;
  },
};

// ─────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────

export const scoringAPI = {
  scoreOne: async (applicationId: string) => {
    const { data } = await apiClient.post(`/scoring/score/${applicationId}`);
    return data;
  },

  scoreAll: async (jobId: string) => {
    const { data } = await apiClient.post(`/scoring/score-all/${jobId}`);
    return data;
  },

  rescoreAll: async (jobId: string) => {
    const { data } = await apiClient.post(`/scoring/rescore/${jobId}`);
    return data;
  },

  getRanked: async (jobId: string, limit?: number): Promise<{ ranked_applications: RankedApplication[]; total_scored: number; total_unscored: number }> => {
    const { data } = await apiClient.get(`/scoring/ranked/${jobId}`, {
      params: { limit },
    });
    return data;
  },

  getBreakdown: async (applicationId: string) => {
    const { data } = await apiClient.get(`/scoring/breakdown/${applicationId}`);
    return data;
  },

  override: async (payload: ScoreOverridePayload) => {
    const { data } = await apiClient.post("/scoring/override", payload);
    return data;
  },

  getOverrides: async (jobId: string) => {
    const { data } = await apiClient.get(`/scoring/overrides/${jobId}`);
    return data;
  },
};

// ─────────────────────────────────────────
// SHORTLIST
// ─────────────────────────────────────────

export const shortlistAPI = {
  suggest: async (jobId: string, shortlistSize?: number) => {
    const { data } = await apiClient.post(
      `/shortlist/suggest/${jobId}`,
      null,
      { params: { shortlist_size: shortlistSize } }
    );
    return data;
  },

  confirm: async (jobId: string, applicationIds: string[]) => {
    const { data } = await apiClient.post(`/shortlist/confirm/${jobId}`, applicationIds);
    return data;
  },

  get: async (jobId: string) => {
    const { data } = await apiClient.get(`/shortlist/${jobId}`);
    return data;
  },

  addCandidate: async (applicationId: string, reason: string) => {
    const { data } = await apiClient.post(
      `/shortlist/add/${applicationId}`,
      null,
      { params: { reason } }
    );
    return data;
  },

  removeCandidate: async (applicationId: string, reason: string) => {
    const { data } = await apiClient.delete(
      `/shortlist/remove/${applicationId}`,
      { params: { reason } }
    );
    return data;
  },

  compare: async (applicationIds: string[]) => {
    const { data } = await apiClient.post("/shortlist/compare", applicationIds);
    return data;
  },
};

// ─────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────

export const interviewsAPI = {
  schedule: async (payload: ScheduleInterviewPayload): Promise<Interview> => {
    const { data } = await apiClient.post("/interviews", payload);
    return data;
  },

  getForJob: async (jobId: string, round?: number) => {
    const { data } = await apiClient.get(`/interviews/job/${jobId}`, {
      params: { round },
    });
    return data;
  },

  getMyInterviews: async () => {
    const { data } = await apiClient.get("/interviews/my-interviews");
    return data;
  },

  get: async (interviewId: string) => {
    const { data } = await apiClient.get(`/interviews/${interviewId}`);
    return data;
  },

  updateStatus: async (interviewId: string, status: string) => {
    const { data } = await apiClient.patch(
      `/interviews/${interviewId}/status`,
      null,
      { params: { status } }
    );
    return data;
  },

  reschedule: async (interviewId: string, newScheduledAt: string, newLocation?: string) => {
    const { data } = await apiClient.patch(
      `/interviews/${interviewId}/reschedule`,
      null,
      { params: { new_scheduled_at: newScheduledAt, new_location: newLocation } }
    );
    return data;
  },

  getCriteria: async (jobId: string, round?: number): Promise<{ criteria: InterviewCriterion[] }> => {
    const { data } = await apiClient.get(`/interviews/criteria/${jobId}`, {
      params: { round },
    });
    return data;
  },

  aiSuggestCriteria: async (jobId: string, round?: number, roundName?: string) => {
    const { data } = await apiClient.post("/interviews/criteria/ai/suggest", {
      job_post_id: jobId,
      round: round || 1,
      round_name: roundName || "First Interview",
    });
    return data;
  },

  aiSuggestAndSaveCriteria: async (jobId: string, round?: number, roundName?: string) => {
    const { data } = await apiClient.post("/interviews/criteria/ai/suggest-and-save", {
      job_post_id: jobId,
      round: round || 1,
      round_name: roundName || "First Interview",
    });
    return data;
  },

  submitScorecard: async (interviewId: string, scores: ScorecardScore[]) => {
    const { data } = await apiClient.post("/interviews/scorecard/submit", {
      interview_id: interviewId,
      scores,
    });
    return data;
  },

  getScorecard: async (interviewId: string) => {
    const { data } = await apiClient.get(`/interviews/scorecard/${interviewId}`);
    return data;
  },

  getInterviewSummary: async (applicationId: string) => {
    const { data } = await apiClient.get(`/interviews/summary/${applicationId}`);
    return data;
  },
};

// ─────────────────────────────────────────
// FINAL SELECTION
// ─────────────────────────────────────────

export const selectionAPI = {
  getCompositeScores: async (
    jobId: string,
    appWeight?: number,
    interviewWeight?: number
  ): Promise<{ ranked_candidates: CompositeCandidate[] }> => {
    const { data } = await apiClient.get(`/selection/composite/${jobId}`, {
      params: { app_weight: appWeight, interview_weight: interviewWeight },
    });
    return data;
  },

  aiRecommend: async (jobId: string) => {
    const { data } = await apiClient.post(`/selection/ai/recommend/${jobId}`);
    return data;
  },

  decide: async (jobId: string, payload: FinalSelectionPayload) => {
    const { data } = await apiClient.post(`/selection/decide/${jobId}`, payload);
    return data;
  },

  get: async (jobId: string) => {
    const { data } = await apiClient.get(`/selection/${jobId}`);
    return data;
  },
};

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────

export const dashboardAPI = {
  getOverview: async (): Promise<DashboardOverview> => {
    const { data } = await apiClient.get("/dashboard/overview");
    return data;
  },

  getJobPipeline: async (jobId: string): Promise<PipelineSummary> => {
    const { data } = await apiClient.get(`/dashboard/pipeline/${jobId}`);
    return data;
  },

  getActiveJobs: async () => {
    const { data } = await apiClient.get("/dashboard/jobs/active");
    return data;
  },

  getAIPerformance: async (): Promise<AIPerformanceReport> => {
    const { data } = await apiClient.get("/dashboard/ai-performance");
    return data;
  },

  getUpcomingInterviews: async () => {
    const { data } = await apiClient.get("/dashboard/interviews/upcoming");
    return data;
  },
};