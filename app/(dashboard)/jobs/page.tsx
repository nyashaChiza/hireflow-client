"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsAPI } from "../../../lib/store/useAuthStore";
import { JobPost, JobStatus, EmploymentType, AIGenerateJobPayload } from "../../../types";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-[#8B949E]/10 text-[#8B949E] border-[#8B949E]/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  closed: "bg-[#484F58]/20 text-[#484F58] border-[#484F58]/20",
};

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Create/Edit Job Modal ──────────────────────────────────
function JobModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<"manual" | "ai">("manual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Manual form
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full_time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [salaryRange, setSalaryRange] = useState("");

  // AI form
  const [aiTitle, setAiTitle] = useState("");
  const [aiDept, setAiDept] = useState("");
  const [bulletPoints, setBulletPoints] = useState("");

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await jobsAPI.create({ title, department, location, employment_type: employmentType, description, requirements, responsibilities, salary_range: salaryRange });
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create job");
    } finally {
      setBusy(false);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTitle) return;
    setBusy(true); setError("");
    try {
      const points = bulletPoints.split("\n").map(s => s.trim()).filter(Boolean);
      const payload: AIGenerateJobPayload = { title: aiTitle, department: aiDept || undefined, bullet_points: points };
      await jobsAPI.aiGenerate(payload);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "AI generation failed");
    } finally {
      setBusy(false);
    }
  };

  const inputClass = "w-full bg-[#0D1117] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all";
  const labelClass = "block text-[#8B949E] text-xs font-medium uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161B22] border border-[#1E2A3A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2A3A]">
          <h2 className="text-white font-semibold">New Job Post</h2>
          <button onClick={onClose} className="text-[#484F58] hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1E2A3A] px-6">
          {(["manual", "ai"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-[#4A9EFF] text-[#4A9EFF]" : "border-transparent text-[#8B949E] hover:text-white"}`}
            >
              {t === "manual" ? "Manual" : "✦ AI Generate"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {tab === "manual" ? (
            <form id="manual-form" onSubmit={handleManualSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Job title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Senior Software Engineer" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Harare, Zimbabwe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Employment type</label>
                  <select value={employmentType} onChange={e => setEmploymentType(e.target.value as EmploymentType)} className={inputClass}>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Salary range</label>
                  <input value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. $2,000–$3,000/month" className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Role overview..." className={`${inputClass} resize-none`} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Responsibilities</label>
                  <textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} rows={3} placeholder="Key responsibilities..." className={`${inputClass} resize-none`} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Requirements</label>
                  <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={3} placeholder="Skills and qualifications..." className={`${inputClass} resize-none`} />
                </div>
              </div>
            </form>
          ) : (
            <form id="ai-form" onSubmit={handleAIGenerate} className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#4A9EFF]/5 border border-[#4A9EFF]/15 rounded-xl mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <p className="text-[#8B949E] text-xs leading-relaxed">AI will generate a full job description, responsibilities, and requirements from your bullet points. The job will be saved as a draft for you to review.</p>
              </div>
              <div>
                <label className={labelClass}>Job title *</label>
                <input value={aiTitle} onChange={e => setAiTitle(e.target.value)} required placeholder="e.g. Product Manager" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input value={aiDept} onChange={e => setAiDept(e.target.value)} placeholder="e.g. Product" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Key bullet points</label>
                <textarea
                  value={bulletPoints}
                  onChange={e => setBulletPoints(e.target.value)}
                  rows={6}
                  placeholder={"5+ years product experience\nAgile/Scrum methodology\nStakeholder management\nData-driven decision making"}
                  className={`${inputClass} resize-none font-mono`}
                />
                <p className="text-[#484F58] text-xs mt-1">One point per line</p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E2A3A]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#8B949E] hover:text-white transition-colors">Cancel</button>
          <button
            type="submit"
            form={tab === "manual" ? "manual-form" : "ai-form"}
            disabled={busy}
            className="px-5 py-2 bg-[#4A9EFF] hover:bg-[#58A6FF] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {busy && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
            {tab === "ai" ? "Generate with AI" : "Save as draft"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "paused", label: "Paused" },
  { key: "closed", label: "Closed" },
];

export default function JobsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", tab],
    queryFn: () => jobsAPI.list(tab === "all" ? undefined : tab),
  });

  const filtered = jobs as JobPost[];

  const doAction = async (action: "publish" | "close" | "delete", job: JobPost) => {
    setActionBusy(job.id);
    try {
      if (action === "publish") await jobsAPI.publish(job.id);
      else if (action === "close") await jobsAPI.close(job.id);
      else if (action === "delete") await jobsAPI.delete(job.id);
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["dashboard-active-jobs"] });
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl">
      {showModal && (
        <JobModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries({ queryKey: ["jobs"] }); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Jobs</h1>
          <p className="text-[#8B949E] text-sm mt-1">Manage your job postings</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4A9EFF] hover:bg-[#58A6FF] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Post a job
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-0.5 bg-[#161B22] border border-[#1E2A3A] rounded-xl p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-[#4A9EFF]/10 text-[#4A9EFF]" : "text-[#8B949E] hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E2A3A]">
              {["Job title", "Department", "Location", "Type", "Status", "Posted", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-[#484F58] uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2A3A]">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-[#1E2A3A] rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-[#484F58] text-sm">
                  No jobs found. Post your first job above.
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <tr key={job.id} className="hover:bg-[#1C2128] transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-white text-sm font-medium">{job.title}</span>
                  </td>
                  <td className="px-5 py-4 text-[#8B949E] text-sm">{job.department || "—"}</td>
                  <td className="px-5 py-4 text-[#8B949E] text-sm">{job.location || "—"}</td>
                  <td className="px-5 py-4 text-[#8B949E] text-sm">
                    {job.employment_type ? TYPE_LABELS[job.employment_type] : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[job.status]}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#8B949E] text-sm">{formatDate(job.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {job.status === "draft" && (
                        <button
                          onClick={() => doAction("publish", job)}
                          disabled={actionBusy === job.id}
                          className="text-xs px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                      {job.status === "active" && (
                        <button
                          onClick={() => doAction("close", job)}
                          disabled={actionBusy === job.id}
                          className="text-xs px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${job.title}"?`)) doAction("delete", job);
                        }}
                        disabled={actionBusy === job.id}
                        className="text-xs px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
