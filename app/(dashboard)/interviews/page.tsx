"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { interviewsAPI, jobsAPI } from "../../../lib/store/useAuthStore";
import { Interview, InterviewStatus, JobPost } from "../../../types";

const STATUS_BADGE: Record<InterviewStatus, string> = {
  scheduled: "bg-[#4A9EFF]/10 text-[#4A9EFF] border-[#4A9EFF]/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  no_show: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const STATUS_OPTIONS: InterviewStatus[] = ["scheduled", "completed", "cancelled", "no_show"];

function formatDateTime(str: string) {
  const d = new Date(str);
  return {
    date: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isToday(str: string) {
  const d = new Date(str);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isUpcoming(str: string) {
  return new Date(str) > new Date();
}

export default function InterviewsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"mine" | "job">("mine");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: myInterviewsRaw, isLoading: loadingMine } = useQuery({
    queryKey: ["my-interviews"],
    queryFn: interviewsAPI.getMyInterviews,
    enabled: view === "mine",
  });

  const { data: jobInterviewsRaw, isLoading: loadingJob } = useQuery({
    queryKey: ["job-interviews", selectedJobId],
    queryFn: () => interviewsAPI.getForJob(selectedJobId),
    enabled: view === "job" && !!selectedJobId,
  });

  const toArray = (raw: any): Interview[] =>
    Array.isArray(raw) ? raw : raw?.interviews ?? raw?.items ?? raw?.data ?? [];

  const myInterviews = toArray(myInterviewsRaw);
  const jobInterviews = toArray(jobInterviewsRaw);

  const { data: jobs = [] } = useQuery<JobPost[]>({
    queryKey: ["jobs-all"],
    queryFn: () => jobsAPI.list(),
  });

  const interviews = (view === "mine" ? myInterviews : jobInterviews) as Interview[];
  const isLoading = view === "mine" ? loadingMine : loadingJob;

  const filtered = statusFilter === "all"
    ? interviews
    : interviews.filter((i) => i.status === statusFilter);

  const updateStatus = async (interviewId: string, status: string) => {
    setUpdatingId(interviewId);
    try {
      await interviewsAPI.updateStatus(interviewId, status);
      qc.invalidateQueries({ queryKey: ["my-interviews"] });
      qc.invalidateQueries({ queryKey: ["job-interviews", selectedJobId] });
      qc.invalidateQueries({ queryKey: ["dashboard-upcoming-interviews"] });
    } finally {
      setUpdatingId(null);
    }
  };

  // Group interviews by date
  const grouped: Record<string, Interview[]> = {};
  filtered.forEach((iv) => {
    const key = iv.scheduled_at
      ? new Date(iv.scheduled_at).toDateString()
      : "Unscheduled";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(iv);
  });

  const today = interviews.filter(
    (i) => i.scheduled_at && isToday(i.scheduled_at) && i.status === "scheduled"
  ).length;

  return (
    <div className="p-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Interviews</h1>
          <p className="text-[#8B949E] text-sm mt-1">
            {today > 0 ? (
              <span><span className="text-[#D29922] font-medium">{today} interview{today > 1 ? "s" : ""}</span> scheduled for today</span>
            ) : "Track and manage candidate interviews"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex gap-0.5 bg-[#161B22] border border-[#1E2A3A] rounded-xl p-1">
          <button
            onClick={() => setView("mine")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "mine" ? "bg-[#4A9EFF]/10 text-[#4A9EFF]" : "text-[#8B949E] hover:text-white"}`}
          >
            My interviews
          </button>
          <button
            onClick={() => setView("job")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "job" ? "bg-[#4A9EFF]/10 text-[#4A9EFF]" : "text-[#8B949E] hover:text-white"}`}
          >
            By job
          </button>
        </div>

        {/* Job selector */}
        {view === "job" && (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-[#161B22] border border-[#1E2A3A] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all min-w-48"
          >
            <option value="">Select a job...</option>
            {(jobs as JobPost[]).map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        )}

        {/* Status filter */}
        <div className="flex gap-0.5 bg-[#161B22] border border-[#1E2A3A] rounded-xl p-1">
          {["all", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-[#4A9EFF]/10 text-[#4A9EFF]" : "text-[#8B949E] hover:text-white"}`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-[#1E2A3A] rounded w-48 mb-2" />
              <div className="h-3 bg-[#1E2A3A] rounded w-32" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#161B22] border border-[#1E2A3A] border-dashed rounded-xl py-16 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484F58" strokeWidth="1.5" className="mx-auto mb-3">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="text-[#484F58] text-sm">No interviews found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, ivs]) => {
            const firstScheduled = ivs[0]?.scheduled_at;
            const isGroup = firstScheduled ? isToday(firstScheduled) : false;
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[#484F58] text-xs font-medium uppercase tracking-wide">{dateKey}</span>
                  {isGroup && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20">Today</span>
                  )}
                  <div className="flex-1 h-px bg-[#1E2A3A]" />
                </div>

                <div className="space-y-2.5">
                  {ivs.map((iv) => {
                    const candidate = iv.applications?.candidates;
                    const dt = iv.scheduled_at ? formatDateTime(iv.scheduled_at) : null;
                    const upcoming = iv.scheduled_at ? isUpcoming(iv.scheduled_at) : false;

                    return (
                      <div
                        key={iv.id}
                        className={`bg-[#161B22] border rounded-xl p-5 transition-colors ${upcoming && iv.status === "scheduled" ? "border-[#4A9EFF]/20" : "border-[#1E2A3A]"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-white font-medium text-sm">
                                {candidate?.full_name || "Candidate"}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[iv.status]}`}>
                                {iv.status.replace("_", " ")}
                              </span>
                              {upcoming && iv.status === "scheduled" && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A9EFF]/10 text-[#4A9EFF] border border-[#4A9EFF]/20">
                                  Upcoming
                                </span>
                              )}
                            </div>
                            <div className="text-[#484F58] text-xs mt-1">
                              {candidate?.email}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[#8B949E]">
                              {iv.job_posts?.title && (
                                <span className="flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                                  {iv.job_posts.title}
                                </span>
                              )}
                              <span>Round {iv.round}{iv.round_name ? ` · ${iv.round_name}` : ""}</span>
                              {dt && (
                                <span className="flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {dt.date} at {dt.time}
                                </span>
                              )}
                              {iv.duration_minutes && (
                                <span>{iv.duration_minutes} min</span>
                              )}
                              {iv.location && (
                                <span className="flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {iv.location}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status updater */}
                          <select
                            value={iv.status}
                            disabled={updatingId === iv.id}
                            onChange={(e) => updateStatus(iv.id, e.target.value)}
                            className="flex-shrink-0 bg-[#0D1117] border border-[#1E2A3A] text-[#8B949E] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#4A9EFF] transition-all disabled:opacity-50"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.replace("_", " ")}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
