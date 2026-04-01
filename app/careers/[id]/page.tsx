"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
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

function Section({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  // Render markdown-like bullet points
  const lines = content.split("\n").filter(Boolean);
  const hasBullets = lines.some((l) => l.match(/^[-•*]\s/));

  return (
    <div className="print-section">
      <h3 className="text-white font-semibold text-base mb-3 print:text-black">{title}</h3>
      {hasBullets ? (
        <ul className="space-y-1.5">
          {lines.map((line, i) => {
            const text = line.replace(/^[-•*]\s+/, "");
            return (
              <li key={i} className="flex items-start gap-2 text-[#8B949E] text-sm print:text-gray-700">
                <span className="text-[#4A9EFF] mt-1 flex-shrink-0 print:text-blue-600">·</span>
                {text}
              </li>
            );
          })}
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
    if (btn) {
      btn.textContent = "Copied!";
      setTimeout(() => { btn.textContent = "Copy link"; }, 2000);
    }
  };
  return (
    <button
      id="copy-btn"
      onClick={copy}
      className="flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 text-[#8B949E] hover:text-[#4A9EFF] text-sm rounded-xl transition-all print:hidden"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Copy link
    </button>
  );
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: job, isLoading, isError } = useQuery<JobPost>({
    queryKey: ["public-job", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/jobs/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handlePrint = () => {
    window.print();
  };

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
      {/* ── Print styles injected via style tag ── */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-700 { color: #374151 !important; }
          .print\\:text-blue-600 { color: #2563eb !important; }
          #print-area {
            padding: 0 !important;
            max-width: 100% !important;
          }
          #print-area * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          @page {
            margin: 1.5cm 2cm;
            size: A4;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#0D1117] print:bg-white">

        {/* ── Nav (hidden on print) ── */}
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
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">HireFlow</span>
            </Link>
          </div>
        </header>

        {/* ── Content ── */}
        <div id="print-area" ref={printRef} className="max-w-4xl mx-auto px-6 py-10 print:py-0">

          {/* Print header (only shows on print) */}
          <div className="hidden print:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-black">HireFlow</span>
            </div>
            <span className="text-gray-500 text-xs">{shareUrl}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3">

            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title block */}
              <div>
                <h1 className="text-3xl font-bold text-white print:text-black tracking-tight mb-3">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-[#8B949E] print:text-gray-600">
                  {job.department && (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2"/>
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                      </svg>
                      {job.department}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {job.location}
                    </span>
                  )}
                  {job.employment_type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border print:border-gray-300 print:text-gray-700 ${TYPE_COLORS[job.employment_type]}`}>
                      {TYPE_LABELS[job.employment_type]}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1.5 text-[#3FB950] print:text-green-700 font-medium">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1E2A3A] print:bg-gray-200" />

              {/* Sections */}
              <div className="space-y-8">
                {job.description && <Section title="About the role" content={job.description} />}
                {job.responsibilities && <Section title="Responsibilities" content={job.responsibilities} />}
                {job.requirements && <Section title="Requirements" content={job.requirements} />}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-4 print:space-y-3">

              {/* Apply card */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:bg-white print:border-gray-200 print:rounded-lg">
                <h3 className="text-white print:text-black font-semibold mb-1">Interested?</h3>
                <p className="text-[#8B949E] print:text-gray-600 text-xs mb-4 leading-relaxed">
                  Send your CV and cover letter to apply for this position.
                </p>
                <div className="space-y-2 print:hidden">
                  <a
                    href={`mailto:careers@hireflow.app?subject=Application: ${job.title}&body=Hi,%0A%0AI am interested in the ${job.title} role.%0A%0APlease find my CV attached.`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#4A9EFF] hover:bg-[#58A6FF] text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Apply now
                  </a>
                </div>
                <p className="hidden print:block text-gray-600 text-xs">
                  Visit: {shareUrl}
                </p>
              </div>

              {/* Job details card */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:bg-white print:border-gray-200 print:rounded-lg space-y-3">
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

              {/* Share card */}
              <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-5 print:hidden space-y-3">
                <h3 className="text-white font-semibold text-sm">Share this role</h3>
                <div className="space-y-2">
                  <CopyLinkButton url={shareUrl} />
                  <button
                    onClick={handlePrint}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 text-[#8B949E] hover:text-[#4A9EFF] text-sm rounded-xl transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9"/>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                      <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Export as PDF
                  </button>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#0A66C2]/40 text-[#8B949E] hover:text-[#0A66C2] text-sm rounded-xl transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                      <rect x="2" y="9" width="4" height="12"/>
                      <circle cx="4" cy="4" r="2"/>
                    </svg>
                    Share on LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`We're hiring a ${job.title}!`)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#161B22] border border-[#1E2A3A] hover:border-[#1DA1F2]/40 text-[#8B949E] hover:text-[#1DA1F2] text-sm rounded-xl transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1E2A3A] py-8 text-center text-[#484F58] text-xs print:hidden">
          © 2026 HireFlow · Powered by AI recruitment
        </div>
      </div>
    </>
  );
}
