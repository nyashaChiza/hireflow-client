// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export type UserRole = "admin" | "recruiter" | "hiring_manager";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

// ─────────────────────────────────────────
// JOB POSTS
// ─────────────────────────────────────────

export type JobStatus = "draft" | "active" | "paused" | "closed";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

export interface JobPost {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: EmploymentType | null;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  salary_range: string | null;
  status: JobStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJobPayload {
  title: string;
  department?: string;
  location?: string;
  employment_type?: EmploymentType;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
}

export interface AIGenerateJobPayload {
  title: string;
  department?: string;
  bullet_points: string[];
}

export interface AIGenerateJobResponse {
  job_post: JobPost;
  ai_output: {
    description: string;
    responsibilities: string;
    requirements: string;
    nice_to_have: string;
  };
  message: string;
}

// ─────────────────────────────────────────
// CRITERIA
// ─────────────────────────────────────────

export interface Criterion {
  id: string;
  job_post_id: string;
  criterion: string;
  description: string | null;
  weight: number;
  is_mandatory: boolean;
  created_at: string;
}

export interface CreateCriterionPayload {
  job_post_id: string;
  criterion: string;
  description?: string;
  weight: number;
  is_mandatory: boolean;
}

export interface CriteriaSummary {
  job_post_id: string;
  total_criteria: number;
  mandatory_count: number;
  total_weight: number;
  ready_to_score: boolean;
  criteria: Criterion[];
  message: string;
}

// ─────────────────────────────────────────
// CANDIDATES & APPLICATIONS
// ─────────────────────────────────────────

export type ApplicationStatus =
  | "new"
  | "under_review"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface ParsedCV {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  total_years_experience: number;
  current_role: string | null;
  current_employer: string | null;
  work_history: WorkHistoryItem[];
  education: EducationItem[];
  skills: string[];
  certifications: string[];
  languages: string[];
  linkedin: string | null;
  portfolio: string | null;
}

export interface WorkHistoryItem {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  responsibilities: string[];
}

export interface EducationItem {
  institution: string;
  qualification: string;
  start_year: string;
  end_year: string;
  grade: string | null;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  cv_url: string | null;
  cv_parsed_data: ParsedCV | null;
  created_at: string;
}

export interface Application {
  id: string;
  job_post_id: string;
  candidate_id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  rejection_reason: string | null;
  total_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  ai_shortlist_suggested: boolean;
  recruiter_notes: string | null;
  applied_at: string;
  updated_at: string;
  candidates?: Candidate;
  job_posts?: Pick<JobPost, "id" | "title" | "status">;
  rank?: number;
}

// ─────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────

export interface CriterionScore {
  criterion: string;
  score: number;
  reasoning: string;
  evidence: string;
  manually_overridden?: boolean;
}

export interface ScoreBreakdown {
  scores: CriterionScore[];
  ai_total: number;
  weighted_total: number;
  summary: string;
  strengths: string[];
  red_flags: string[];
}

export interface RankedApplication extends Application {
  rank: number;
}

export interface ScoreOverridePayload {
  application_id: string;
  criterion_id: string;
  overridden_score: number;
  override_reason: string;
}

// ─────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────

export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Interview {
  id: string;
  application_id: string;
  job_post_id: string;
  round: number;
  round_name: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  location: string | null;
  status: InterviewStatus;
  interviewer_id: string | null;
  created_at: string;
  applications?: {
    id: string;
    candidates: Pick<Candidate, "full_name" | "email">;
  };
  job_posts?: Pick<JobPost, "title">;
}

export interface InterviewCriterion {
  id: string;
  job_post_id: string;
  round: number;
  competency: string;
  question: string;
  guidance: string | null;
  weight: number;
  created_at: string;
}

export interface ScorecardScore {
  interview_criterion_id: string;
  score: number; // 1-5
  notes?: string;
}

export interface ScheduleInterviewPayload {
  application_id: string;
  job_post_id: string;
  round?: number;
  round_name?: string;
  scheduled_at: string;
  duration_minutes?: number;
  location?: string;
  interviewer_id: string;
}

// ─────────────────────────────────────────
// FINAL SELECTION
// ─────────────────────────────────────────

export type SelectionDecision = "hired" | "runner_up" | "rejected";

export interface CompositeCandidate {
  application_id: string;
  candidate: Pick<Candidate, "id" | "full_name" | "email"> | null;
  app_score: number;
  interview_score: number | null;
  composite_score: number | null;
  interviews_completed: number;
  ready_for_selection: boolean;
  rank: number;
}

export interface FinalSelectionPayload {
  job_post_id: string;
  application_id: string;
  decision: SelectionDecision;
  decision_notes?: string;
}

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────

export interface DashboardOverview {
  jobs: Record<JobStatus, number>;
  total_jobs: number;
  applications: Record<ApplicationStatus, number>;
  total_applications: number;
  interviews_today: number;
  total_candidates: number;
  total_ai_overrides: number;
}

export interface PipelineSummary {
  job: Pick<JobPost, "id" | "title" | "status" | "created_at">;
  pipeline: {
    applied: number;
    under_review: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
  };
  score_stats: {
    average_score: number;
    highest_score: number;
    lowest_score: number;
    scored_count: number;
  };
  time_to_hire_days: number | null;
  total_interviews: number;
  ai_overrides: number;
}

export interface AIPerformanceReport {
  scoring: {
    total_applications_scored: number;
    total_score_overrides: number;
    override_rate_percent: number;
    average_score_delta: number;
    most_overridden_criteria: [string, number][];
    override_reasons: string[];
  };
  shortlisting: {
    ai_suggestions_made: number;
    ai_suggested_candidates_hired: number;
    ai_shortlist_accuracy_percent: number | null;
  };
}

// ─────────────────────────────────────────
// API RESPONSE WRAPPERS
// ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

export interface APIError {
  detail: string;
}