"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import apiClient from "../../../lib/api/client";
import { JobPost, EmploymentType } from "../../../types";

const TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const TYPE_COLORS: Record<EmploymentType, string> = {
  full_time: "bg-[#4A9EFF]/10 text-[#4A9EFF] border-[#4A9EFF]/20",
  part_time: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  contract: "bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20",
  internship: "bg-green-500/10 text-green-400 border-green-500/20",
};

// ── Apply Modal ────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: JobPost; onClose: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) { setError("Please attach your CV."); return; }
    setError("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("full_name", fullName);
      form.append("email", email);
      if (phone) form.append("phone", phone);
      if (location) form.append("location", location);
      if (coverLetter) form.append("cover_letter", coverLetter);
      form.append("cv", cvFile);

      await apiClient.post(`/applications/apply/${job.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d: any) => d.msg).join(", ")
          : "Submission failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#0D1117] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/20 transition-all";
  const labelClass = "block text-[#8B949E] text-xs font-medium uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#161B22] border border-[#1E2A3A] rounded-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#1E2A3A]">
          <div>
            <h2 className="text-white font-semibold text-lg">Apply for this role</h2>
            <p className="text-[#8B949E] text-sm mt-0.5">{job.title}</p>
          </div>
          <button onClick={onClose} className="text-[#484F58] hover:text-white transition-colors mt-0.5 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3FB950" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Application submitted!</p>
                <p className="text-[#8B949E] text-sm mt-1 max-w-xs mx-auto">
                  Thank you {fullName.split(" ")[0]}. We&apos;ll review your application and be in touch.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#4A9EFF] hover:bg-[#58A6FF] text-white text-sm font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form id="apply-form" onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0">
                    <circle cx="7" cy="7" r="6" stroke="#F85149" strokeWidth="1.5"/>
                    <path d="M7 4v3M7 9.5v.5" stroke="#F85149" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Full name */}
                <div className="col-span-2">
                  <label className={labelClass}>Full name *</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label className={labelClass}>Email address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@email.com"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                    className={inputClass}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Harare, Zimbabwe"
                    className={inputClass}
                  />
                </div>

                {/* Cover letter */}
                <div className="col-span-2">
                  <label className={labelClass}>Cover letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    placeholder="Tell us why you're a great fit for this role..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* CV upload */}
                <div className="col-span-2">
                  <label className={labelClass}>CV / Resume *</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl px-4 py-5 text-center transition-all ${
                      cvFile
                        ? "border-[#4A9EFF]/40 bg-[#4A9EFF]/5"
                        : "border-[#1E2A3A] hover:border-[#4A9EFF]/30 bg-[#0D1117]"
                    }`}
                  >
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A9EFF" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span className="text-[#4A9EFF] text-sm font-medium">{cvFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCvFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="text-[#484F58] hover:text-red-400 transition-colors ml-1"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#484F58" strokeWidth="1.5" className="mx-auto mb-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <p className="text-[#484F58] text-sm">Click to upload your CV</p>
                        <p className="text-[#484F58] text-xs mt-0.5">PDF, DOC, DOCX</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1E2A3A]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm text-[#8B949E] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="apply-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4A9EFF] hover:bg-[#58A6FF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {loading ? "Submitting..." : "Submit application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────
function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  const lines = content.split("\n").filter(Boolean);
  const hasBullets = lines.some((l) => l.match(/^[-•*]\s/));
  return (
    <div>
      <h3 className="text-white font-semibold text-base mb-3 print:text-black">{title}</h3>
      {hasBullets ? (
        <ul className="space-y-1.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[#8B949E] text-sm print:text-gray-700">
              <span className="text-[#4A9EFF] mt-1 flex-shrink-0 print:text-blue-600">·</span>
              {line.replace(/^[-•*]\s+/, "")}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[#8B949E] text-sm leading-relaxed whitespace-pre-line print:text-gray-700">
          {content}
        </p>
      )}
    </div>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById("copy-btn");
    if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy link"; }, 2000); }
  };
  return (
    <button
      id="copy-btn"
      onClick={copy}
      className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 text-[#8B949E] hover:text-[#4A9EFF] text-sm rounded-xl transition-all print:hidden"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Copy link
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showApply, setShowApply] = useState(false);

  const { data: job, isLoading, isError } = useQuery<JobPost>({
    queryKey: ["public-job", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="space-y-3 w-full max-w-2xl px-6 animate-pulse">
          <div className="h-8 bg-[#161B22] rounded w-64" />
          <div className="h-4 bg-[#161B22] rounded w-40" />
          <div className="h-32 bg-[#161B22] rounded mt-6" />
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-center">
        <div>
          <p className="text-white text-lg font-medium mb-2">Job not found</p>
          <p className="text-[#484F58] text-sm mb-6">This listing may have been closed or removed.</p>
          <Link href="/careers" className="text-[#4A9EFF] hover:underline text-sm">← Back to all jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-700 { color: #374151 !important; }
          .print\\:text-blue-600 { color: #2563eb !important; }
          #print-area { padding: 0 !important; max-width: 100% !important; }
          @page { margin: 1.5cm 2cm; size: A4; }
        }
      `}</style>

      {showApply && job && <ApplyModal job={job} onClose={() => setShowApply(false)} />}

      <div className="min-h-screen bg-[#0D1117] print:bg-white">

        {/* Nav */}
        <header className="border-b border-[#1E2A3A] bg-[#0D1117]/80 backdrop-blur-sm sticky top-0 z-10 print:hidden">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/careers" className="flex items-center gap-2 text-[#8B949E] hover:text-white text-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              All jobs
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#4A9EFF] rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white"/>
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">HireFlow</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div id="print-area" className="max-w-4xl mx-auto px-6 py-10 print:py-0">

          {/* Print header */}
          <div className="hidden print:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-black">HireFlow</span>
            </div>
            <span className="text-gray-500 text-xs">{shareUrl}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3">

            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white print:text-black tracking-tight mb-3">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#8B949E] print:text-gray-600">
                  {job.department && (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      {job.department}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.location}
                    </span>
                  )}
                  {job.employment_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[job.employment_type]}`}>
                      {TYPE_LABELS[job.employment_type]}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1.5 text-[#3FB950] font-medium">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-[#1E2A3A] print:bg-gray-200" />

              <div className="space-y-8">
                {job.description && <Section title="About the role" content={job.description} />}
                {job.responsibilities && <Section title="Responsibilities" content={job.responsibilities} />}
                {job.requirements && <Section title="Requirements" content={job.requirements} />}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Apply CTA */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:bg-white print:border-gray-200 print:rounded-lg">
                <h3 className="text-white print:text-black font-semibold mb-1">Interested?</h3>
                <p className="text-[#8B949E] text-sm mb-4 leading-relaxed print:text-gray-600">
                  Submit your CV and we&apos;ll review your application.
                </p>
                <button
                  onClick={() => setShowApply(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4A9EFF] hover:bg-[#58A6FF] text-white text-sm font-medium rounded-xl transition-colors print:hidden"
                >
                  Apply now
                </button>
                <p className="hidden print:block text-gray-600 text-xs">Apply at: {shareUrl}</p>
              </div>

              {/* Job details */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:bg-white print:border-gray-200 space-y-3">
                <h3 className="text-white print:text-black font-semibold text-sm">Job details</h3>
                <dl className="space-y-2.5">
                  {[
                    { label: "Type", value: job.employment_type ? TYPE_LABELS[job.employment_type] : null },
                    { label: "Department", value: job.department },
                    { label: "Location", value: job.location },
                    { label: "Salary", value: job.salary_range },
                    { label: "Posted", value: new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                  ].filter((d) => d.value).map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-[#484F58] print:text-gray-500 text-xs">{label}</dt>
                      <dd className="text-[#8B949E] print:text-gray-700 text-sm mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Share */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:hidden space-y-2">
                <h3 className="text-white font-semibold text-sm mb-3">Share this role</h3>
                <CopyLinkButton url={shareUrl} />
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 text-[#8B949E] hover:text-[#4A9EFF] text-sm rounded-xl transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Export as PDF
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#0A66C2]/40 text-[#8B949E] hover:text-[#0A66C2] text-sm rounded-xl transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  Share on LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`We're hiring a ${job.title}!`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#1DA1F2]/40 text-[#8B949E] hover:text-[#1DA1F2] text-sm rounded-xl transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1E2A3A] py-8 text-center text-[#484F58] text-xs print:hidden">
          © 2026 HireFlow · Powered by AI recruitment
        </div>
      </div>
    </>
  );
}
