"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dashboardAPI } from "../../../lib/store/useAuthStore";
import { useAuthStore } from "../../../lib/store/useAuthStore";
import { JobPost } from "../../../types";

function StatCard({ label, value, sub, color = "#4A9EFF" }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-5">
      <div className="text-[#8B949E] text-xs font-medium uppercase tracking-wide mb-2">{label}</div>
      <div className="text-3xl font-bold text-white" style={{ color }}>{value}</div>
      {sub && <div className="text-[#484F58] text-xs mt-1">{sub}</div>}
    </div>
  );
}

const STATUS_BG: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-[#8B949E]/10 text-[#8B949E] border-[#8B949E]/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-[#484F58]/20 text-[#484F58] border-[#484F58]/20",
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(str: string) {
  return new Date(str).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardAPI.getOverview,
  });

  const { data: activeJobsRaw, isLoading: loadingJobs } = useQuery({
    queryKey: ["dashboard-active-jobs"],
    queryFn: dashboardAPI.getActiveJobs,
  });
  // API may return an array or an object with a nested array
  const activeJobs: JobPost[] = Array.isArray(activeJobsRaw)
    ? activeJobsRaw
    : (activeJobsRaw as any)?.jobs ?? (activeJobsRaw as any)?.items ?? [];

  const { data: upcomingInterviewsRaw, isLoading: loadingInterviews } = useQuery({
    queryKey: ["dashboard-upcoming-interviews"],
    queryFn: dashboardAPI.getUpcomingInterviews,
  });
  const upcomingInterviews: any[] = Array.isArray(upcomingInterviewsRaw)
    ? upcomingInterviewsRaw
    : (upcomingInterviewsRaw as any)?.interviews ?? (upcomingInterviewsRaw as any)?.items ?? [];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {greeting()}, {user?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-[#8B949E] text-sm mt-1">Here&apos;s what&apos;s happening across your pipeline today.</p>
      </div>

      {/* Stat cards */}
      {loadingOverview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-[#1E2A3A] rounded w-20 mb-3" />
              <div className="h-8 bg-[#1E2A3A] rounded w-12" />
            </div>
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total jobs" value={overview.total_jobs} sub={`${overview.jobs.active || 0} active`} />
          <StatCard label="Applications" value={overview.total_applications} sub={`${overview.applications.new || 0} new`} color="#58A6FF" />
          <StatCard label="Interviews today" value={overview.interviews_today} color="#D29922" />
          <StatCard label="Candidates" value={overview.total_candidates} color="#3FB950" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Jobs */}
        <div className="lg:col-span-2 bg-[#161B22] border border-[#1E2A3A] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3A]">
            <h2 className="text-white font-semibold text-sm">Active Jobs</h2>
            <Link href="/jobs" className="text-[#4A9EFF] text-xs hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-[#1E2A3A]">
            {loadingJobs ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="h-4 bg-[#1E2A3A] rounded w-40 mb-2" />
                  <div className="h-3 bg-[#1E2A3A] rounded w-24" />
                </div>
              ))
            ) : activeJobs?.length === 0 ? (
              <div className="px-5 py-8 text-center text-[#484F58] text-sm">No active jobs yet</div>
            ) : (
              activeJobs?.slice(0, 5).map((job: JobPost) => (
                <div key={job.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#1C2128] transition-colors">
                  <div className="min-w-0">
                    <Link href={`/jobs/${job.id}`} className="text-white text-sm font-medium hover:text-[#4A9EFF] transition-colors truncate block">
                      {job.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {job.department && <span className="text-[#484F58] text-xs">{job.department}</span>}
                      {job.location && <span className="text-[#484F58] text-xs">· {job.location}</span>}
                    </div>
                  </div>
                  <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${STATUS_BG[job.status]}`}>
                    {job.status}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="px-5 py-4 border-t border-[#1E2A3A]">
            <Link
              href="/jobs"
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-[#1E2A3A] rounded-lg text-[#484F58] hover:text-[#4A9EFF] hover:border-[#4A9EFF]/30 text-xs transition-all"
            >
              + Post a new job
            </Link>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3A]">
            <h2 className="text-white font-semibold text-sm">Upcoming Interviews</h2>
            <Link href="/interviews" className="text-[#4A9EFF] text-xs hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-[#1E2A3A]">
            {loadingInterviews ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse">
                  <div className="h-4 bg-[#1E2A3A] rounded w-32 mb-2" />
                  <div className="h-3 bg-[#1E2A3A] rounded w-20" />
                </div>
              ))
            ) : upcomingInterviews?.length === 0 ? (
              <div className="px-5 py-8 text-center text-[#484F58] text-sm">No upcoming interviews</div>
            ) : (
              upcomingInterviews?.slice(0, 6).map((interview: any) => (
                <div key={interview.id} className="px-5 py-3.5">
                  <div className="text-white text-xs font-medium truncate">
                    {interview.applications?.candidates?.full_name || "Candidate"}
                  </div>
                  <div className="text-[#8B949E] text-xs mt-0.5 truncate">
                    {interview.job_posts?.title || ""}
                  </div>
                  {interview.scheduled_at && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#484F58" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-[#484F58] text-xs">
                        {formatDate(interview.scheduled_at)} · {formatTime(interview.scheduled_at)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pipeline summary */}
      {overview && (
        <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Application Pipeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "New", value: overview.applications.new || 0, color: "#8B949E" },
              { label: "Under Review", value: overview.applications.under_review || 0, color: "#4A9EFF" },
              { label: "Shortlisted", value: overview.applications.shortlisted || 0, color: "#58A6FF" },
              { label: "Rejected", value: overview.applications.rejected || 0, color: "#F85149" },
              { label: "Hired", value: overview.applications.hired || 0, color: "#3FB950" },
              { label: "AI Overrides", value: overview.total_ai_overrides || 0, color: "#D29922" },
            ].map((item) => (
              <div key={item.label} className="bg-[#0D1117] border border-[#1E2A3A] rounded-lg p-3 text-center">
                <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                <div className="text-[#484F58] text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
