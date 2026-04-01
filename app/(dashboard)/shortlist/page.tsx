"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { jobsAPI, shortlistAPI, scoringAPI } from "../../../lib/store/useAuthStore";
import { JobPost } from "../../../types";

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#3FB950" : score >= 50 ? "#4A9EFF" : score >= 25 ? "#D29922" : "#F85149";
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2"
      style={{ borderColor: color, color }}
    >
      {score.toFixed(0)}
    </div>
  );
}

export default function ShortlistPage() {
  const qc = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const { data: jobs = [] } = useQuery<JobPost[]>({
    queryKey: ["jobs-all"],
    queryFn: () => jobsAPI.list(),
  });

  const { data: shortlist, isLoading, refetch } = useQuery({
    queryKey: ["shortlist", selectedJobId],
    queryFn: () => shortlistAPI.get(selectedJobId),
    enabled: !!selectedJobId,
  });

  const { data: ranked } = useQuery({
    queryKey: ["ranked", selectedJobId],
    queryFn: () => scoringAPI.getRanked(selectedJobId),
    enabled: !!selectedJobId,
  });

  const suggestShortlist = async () => {
    if (!selectedJobId) return;
    setSuggesting(true); setError("");
    try {
      await shortlistAPI.suggest(selectedJobId);
      refetch();
      qc.invalidateQueries({ queryKey: ["applications", selectedJobId] });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to generate shortlist suggestions");
    } finally {
      setSuggesting(false);
    }
  };

  const confirmShortlist = async (applicationIds: string[]) => {
    if (!selectedJobId || applicationIds.length === 0) return;
    setConfirming(true); setError("");
    try {
      await shortlistAPI.confirm(selectedJobId, applicationIds);
      refetch();
      qc.invalidateQueries({ queryKey: ["applications", selectedJobId] });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to confirm shortlist");
    } finally {
      setConfirming(false);
    }
  };

  const removeFromShortlist = async (applicationId: string) => {
    try {
      await shortlistAPI.removeCandidate(applicationId, "Removed by recruiter");
      refetch();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to remove candidate");
    }
  };

  const shortlistedApps: any[] = shortlist?.shortlisted_applications || shortlist || [];
  const shortlistedIds = shortlistedApps.map((a: any) => a.id || a.application_id);

  // AI suggested but not yet confirmed
  const suggested = (ranked?.ranked_applications || []).filter(
    (a: any) => a.ai_shortlist_suggested && !shortlistedIds.includes(a.id)
  );

  return (
    <div className="p-8 space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Shortlist</h1>
          <p className="text-[#8B949E] text-sm mt-1">AI-assisted candidate shortlisting</p>
        </div>
      </div>

      {/* Job selector + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="bg-[#161B22] border border-[#1E2A3A] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all min-w-56"
        >
          <option value="">Select a job...</option>
          {(jobs as JobPost[]).map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>

        {selectedJobId && (
          <button
            onClick={suggestShortlist}
            disabled={suggesting}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4A9EFF]/10 border border-[#4A9EFF]/20 hover:bg-[#4A9EFF]/20 text-[#4A9EFF] text-sm font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {suggesting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            )}
            {suggesting ? "Analysing..." : "✦ AI Suggest shortlist"}
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {!selectedJobId ? (
        <div className="bg-[#161B22] border border-[#1E2A3A] border-dashed rounded-xl py-16 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484F58" strokeWidth="1.5" className="mx-auto mb-3">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p className="text-[#484F58] text-sm">Select a job to view its shortlist</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Confirmed Shortlist */}
          <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3A]">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-sm">Confirmed Shortlist</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {shortlistedApps.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#1E2A3A]">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#1E2A3A]" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#1E2A3A] rounded w-32 mb-2" />
                      <div className="h-3 bg-[#1E2A3A] rounded w-24" />
                    </div>
                  </div>
                ))
              ) : shortlistedApps.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#484F58] text-sm">
                  No candidates shortlisted yet.<br />
                  <span className="text-xs mt-1 block">Use AI Suggest or confirm from the ranked list.</span>
                </div>
              ) : (
                shortlistedApps.map((app: any, idx: number) => {
                  const candidate = app.candidates || app.candidate;
                  const score = app.total_score ?? app.app_score ?? null;
                  return (
                    <div key={app.id || idx} className="px-5 py-4 flex items-center gap-4 hover:bg-[#1C2128] transition-colors">
                      {score != null && <ScoreRing score={score} />}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {candidate?.full_name || "Candidate"}
                        </div>
                        <div className="text-[#484F58] text-xs mt-0.5 truncate">{candidate?.email}</div>
                        {app.ai_shortlist_suggested && (
                          <span className="text-[#4A9EFF] text-xs">✦ AI suggested</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromShortlist(app.id)}
                        className="flex-shrink-0 text-[#484F58] hover:text-red-400 transition-colors p-1"
                        title="Remove from shortlist"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AI Suggestions / Ranked */}
          <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2A3A]">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-semibold text-sm">AI Ranked Candidates</h2>
                {suggested.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A9EFF]/10 text-[#4A9EFF] border border-[#4A9EFF]/20">
                    {suggested.length} suggested
                  </span>
                )}
              </div>
              {suggested.length > 0 && (
                <button
                  onClick={() => confirmShortlist(suggested.map((a: any) => a.id))}
                  disabled={confirming}
                  className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  {confirming ? "Confirming..." : "Confirm all"}
                </button>
              )}
            </div>

            <div className="divide-y divide-[#1E2A3A]">
              {!ranked ? (
                <div className="px-5 py-10 text-center text-[#484F58] text-sm">
                  Run &ldquo;AI Suggest&rdquo; to see ranked candidates
                </div>
              ) : ranked.ranked_applications?.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#484F58] text-sm">
                  No scored candidates yet.<br />
                  <span className="text-xs mt-1 block">Score applications first from the Applications page.</span>
                </div>
              ) : (
                ranked.ranked_applications?.slice(0, 10).map((app: any) => {
                  const candidate = app.candidates;
                  const isShortlisted = shortlistedIds.includes(app.id);
                  return (
                    <div key={app.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-[#1C2128] transition-colors ${isShortlisted ? "opacity-40" : ""}`}>
                      <div className="w-6 text-center text-[#484F58] text-xs font-medium flex-shrink-0">
                        #{app.rank}
                      </div>
                      {app.total_score != null && <ScoreRing score={app.total_score} />}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {candidate?.full_name || "Candidate"}
                        </div>
                        <div className="text-[#484F58] text-xs mt-0.5 truncate">{candidate?.email}</div>
                        {app.ai_shortlist_suggested && (
                          <span className="text-[#4A9EFF] text-xs">✦ AI suggested</span>
                        )}
                      </div>
                      {!isShortlisted ? (
                        <button
                          onClick={() => confirmShortlist([app.id])}
                          disabled={confirming}
                          className="flex-shrink-0 text-xs px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          + Add
                        </button>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-[#3FB950]">✓ Added</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
