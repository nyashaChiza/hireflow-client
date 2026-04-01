"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI, applicationsAPI, scoringAPI } from "../../../lib/store/useAuthStore";
import { JobPost, Application, ApplicationStatus, ScoreBreakdown } from "../../../types";

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: "bg-[#8B949E]/10 text-[#8B949E] border-[#8B949E]/20",
  under_review: "bg-[#4A9EFF]/10 text-[#4A9EFF] border-[#4A9EFF]/20",
  shortlisted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  hired: "bg-green-500/10 text-green-400 border-green-500/20",
};

const STATUS_OPTIONS: ApplicationStatus[] = ["new", "under_review", "shortlisted", "rejected", "hired"];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "#3FB950" : score >= 50 ? "#4A9EFF" : score >= 25 ? "#D29922" : "#F85149";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium" style={{ color }}>{score.toFixed(0)}</span>
    </div>
  );
}

function ScoreDrawer({ app, onClose }: { app: Application; onClose: () => void }) {
  const { data: breakdown, isLoading } = useQuery({
    queryKey: ["score-breakdown", app.id],
    queryFn: () => scoringAPI.getBreakdown(app.id),
    enabled: !!app.id,
  });

  const candidate = app.candidates;
  const cv = candidate?.cv_parsed_data;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-lg bg-[#161B22] border-l border-[#1E2A3A] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#161B22] border-b border-[#1E2A3A] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-white font-semibold">{candidate?.full_name || "Candidate"}</h3>
            <p className="text-[#8B949E] text-xs mt-0.5">{candidate?.email}</p>
          </div>
          <button onClick={onClose} className="text-[#484F58] hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* CV Summary */}
          {cv && (
            <div className="bg-[#0D1117] border border-[#1E2A3A] rounded-xl p-4 space-y-3">
              <h4 className="text-white text-sm font-medium">CV Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {cv.current_role && (
                  <div>
                    <span className="text-[#484F58]">Current role</span>
                    <p className="text-[#8B949E] mt-0.5">{cv.current_role}</p>
                  </div>
                )}
                {cv.total_years_experience > 0 && (
                  <div>
                    <span className="text-[#484F58]">Experience</span>
                    <p className="text-[#8B949E] mt-0.5">{cv.total_years_experience} yrs</p>
                  </div>
                )}
                {cv.location && (
                  <div>
                    <span className="text-[#484F58]">Location</span>
                    <p className="text-[#8B949E] mt-0.5">{cv.location}</p>
                  </div>
                )}
              </div>
              {cv.skills?.length > 0 && (
                <div>
                  <span className="text-[#484F58] text-xs">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {cv.skills.slice(0, 12).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-[#161B22] border border-[#1E2A3A] text-[#8B949E] rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Score Breakdown */}
          <div>
            <h4 className="text-white text-sm font-medium mb-3">AI Score Breakdown</h4>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-[#0D1117] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : breakdown?.scores ? (
              <div className="space-y-2.5">
                {breakdown.scores.map((s: any) => (
                  <div key={s.criterion} className="bg-[#0D1117] border border-[#1E2A3A] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-medium">{s.criterion}</span>
                      <span className="text-[#4A9EFF] text-xs font-bold">{s.score}/10</span>
                    </div>
                    <div className="w-full bg-[#161B22] rounded-full h-1 mb-2">
                      <div className="h-full rounded-full bg-[#4A9EFF]" style={{ width: `${s.score * 10}%` }} />
                    </div>
                    {s.reasoning && <p className="text-[#484F58] text-xs leading-relaxed">{s.reasoning}</p>}
                  </div>
                ))}
                {breakdown.summary && (
                  <div className="bg-[#4A9EFF]/5 border border-[#4A9EFF]/15 rounded-lg p-3">
                    <p className="text-[#8B949E] text-xs leading-relaxed">{breakdown.summary}</p>
                  </div>
                )}
                {breakdown.strengths?.length > 0 && (
                  <div>
                    <p className="text-[#3FB950] text-xs font-medium mb-1">Strengths</p>
                    <ul className="space-y-0.5">
                      {breakdown.strengths.map((s: string) => (
                        <li key={s} className="text-[#8B949E] text-xs flex gap-1.5"><span className="text-[#3FB950]">·</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {breakdown.red_flags?.length > 0 && (
                  <div>
                    <p className="text-red-400 text-xs font-medium mb-1">Red flags</p>
                    <ul className="space-y-0.5">
                      {breakdown.red_flags.map((s: string) => (
                        <li key={s} className="text-[#8B949E] text-xs flex gap-1.5"><span className="text-red-400">·</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-[#484F58] text-sm">No score breakdown available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [scoringAll, setScoringAll] = useState(false);

  const { data: jobs = [] } = useQuery<JobPost[]>({
    queryKey: ["jobs-all"],
    queryFn: () => jobsAPI.list(),
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications", selectedJobId, statusFilter],
    queryFn: () => applicationsAPI.listForJob(
      selectedJobId,
      statusFilter !== "all" ? statusFilter as ApplicationStatus : undefined,
      "score_desc"
    ),
    enabled: !!selectedJobId,
  });

  const { data: ranked } = useQuery({
    queryKey: ["ranked", selectedJobId],
    queryFn: () => scoringAPI.getRanked(selectedJobId),
    enabled: !!selectedJobId,
  });

  const updateStatus = async (appId: string, status: ApplicationStatus) => {
    await applicationsAPI.updateStatus(appId, status);
    qc.invalidateQueries({ queryKey: ["applications", selectedJobId] });
  };

  const scoreAll = async () => {
    if (!selectedJobId) return;
    setScoringAll(true);
    try {
      await scoringAPI.scoreAll(selectedJobId);
      qc.invalidateQueries({ queryKey: ["applications", selectedJobId] });
      qc.invalidateQueries({ queryKey: ["ranked", selectedJobId] });
    } finally {
      setScoringAll(false);
    }
  };

  const appList = applications as Application[];

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      {selectedApp && <ScoreDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Applications</h1>
          <p className="text-[#8B949E] text-sm mt-1">Review and manage candidate applications</p>
        </div>
        {selectedJobId && (
          <button
            onClick={scoreAll}
            disabled={scoringAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 text-[#8B949E] hover:text-[#4A9EFF] text-sm rounded-lg transition-all disabled:opacity-50"
          >
            {scoringAll ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            )}
            Score all with AI
          </button>
        )}
      </div>

      {/* Job selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-48 max-w-xs">
          <select
            value={selectedJobId}
            onChange={(e) => { setSelectedJobId(e.target.value); setStatusFilter("all"); }}
            className="w-full bg-[#161B22] border border-[#1E2A3A] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all"
          >
            <option value="">Select a job...</option>
            {(jobs as JobPost[]).map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {selectedJobId && (
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
        )}

        {ranked && (
          <div className="text-[#484F58] text-xs">
            {ranked.total_scored} scored · {ranked.total_unscored} unscored
          </div>
        )}
      </div>

      {!selectedJobId ? (
        <div className="bg-[#161B22] border border-[#1E2A3A] border-dashed rounded-xl py-16 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484F58" strokeWidth="1.5" className="mx-auto mb-3">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="text-[#484F58] text-sm">Select a job to view its applications</p>
        </div>
      ) : (
        <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                {["Candidate", "Score", "Status", "AI Suggested", "Applied", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-[#484F58] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2A3A]">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-[#1E2A3A] rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : appList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#484F58] text-sm">No applications found</td>
                </tr>
              ) : (
                appList.map((app) => (
                  <tr key={app.id} className="hover:bg-[#1C2128] transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => setSelectedApp(app)} className="text-left">
                        <div className="text-white text-sm font-medium hover:text-[#4A9EFF] transition-colors">
                          {app.candidates?.full_name || "Unknown"}
                        </div>
                        <div className="text-[#484F58] text-xs mt-0.5">{app.candidates?.email}</div>
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {app.total_score != null ? (
                        <ScoreBar score={app.total_score} />
                      ) : (
                        <span className="text-[#484F58] text-xs">Not scored</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[app.status]}`}>
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {app.ai_shortlist_suggested ? (
                        <span className="text-xs text-[#4A9EFF]">✦ Yes</span>
                      ) : (
                        <span className="text-[#484F58] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#8B949E] text-sm">
                      {new Date(app.applied_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        className="bg-[#0D1117] border border-[#1E2A3A] text-[#8B949E] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#4A9EFF] transition-all"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
