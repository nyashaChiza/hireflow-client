"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import apiClient from "../../lib/api/client";
import { JobPost, EmploymentType } from "../../types";

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

function timeAgo(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const { data: jobs = [], isLoading } = useQuery<JobPost[]>({
    queryKey: ["public-jobs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/jobs/public/listings");
      return Array.isArray(data) ? data : data?.jobs ?? data?.items ?? [];
    },
  });

  // Derived filter options
  const departments = useMemo(() => {
    const set = new Set(jobs.map((j) => j.department).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [jobs]);

  const locations = useMemo(() => {
    const set = new Set(jobs.map((j) => j.location).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        (j.department?.toLowerCase().includes(q) ?? false) ||
        (j.location?.toLowerCase().includes(q) ?? false) ||
        (j.description?.toLowerCase().includes(q) ?? false);
      const matchType = typeFilter === "all" || j.employment_type === typeFilter;
      const matchDept = deptFilter === "all" || j.department === deptFilter;
      const matchLoc = locationFilter === "all" || j.location === locationFilter;
      return matchSearch && matchType && matchDept && matchLoc;
    });
  }, [jobs, search, typeFilter, deptFilter, locationFilter]);

  // Group by employment type
  const grouped = useMemo(() => {
    if (typeFilter !== "all") return { [typeFilter]: filtered };
    return filtered.reduce<Record<string, JobPost[]>>((acc, job) => {
      const key = job.employment_type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {});
  }, [filtered, typeFilter]);

  const hasFilters = search || typeFilter !== "all" || deptFilter !== "all" || locationFilter !== "all";

  return (
    <div className="min-h-screen bg-[#0D1117]">

      {/* ── Header ── */}
      <header className="border-b border-[#1E2A3A] bg-[#0D1117]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#4A9EFF] rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold tracking-tight">HireFlow</span>
          </Link>
          <Link
            href="/login"
            className="text-[#8B949E] hover:text-white text-sm transition-colors"
          >
            Recruiter login →
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#4A9EFF 1px, transparent 1px), linear-gradient(90deg, #4A9EFF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#4A9EFF] rounded-full opacity-[0.06] blur-[80px]" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4A9EFF]/10 border border-[#4A9EFF]/20 rounded-full mb-5">
            <div className="w-1.5 h-1.5 bg-[#3FB950] rounded-full animate-pulse" />
            <span className="text-[#4A9EFF] text-xs font-medium tracking-wide uppercase">
              {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Join our team
          </h1>
          <p className="text-[#8B949E] text-lg max-w-lg mx-auto">
            We&apos;re hiring across multiple roles. Find your fit and apply today.
          </p>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="max-w-5xl mx-auto px-6 pb-6">
        <div className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-4 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#484F58]"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, departments, locations..."
              className="w-full bg-[#0D1117] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all"
            />
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2">
            {/* Employment type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#1E2A3A] text-[#8B949E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all"
            >
              <option value="all">All types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            {/* Department */}
            {departments.length > 0 && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-[#0D1117] border border-[#1E2A3A] text-[#8B949E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all"
              >
                <option value="all">All departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}

            {/* Location */}
            {locations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-[#0D1117] border border-[#1E2A3A] text-[#8B949E] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4A9EFF] transition-all"
              >
                <option value="all">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            )}

            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setDeptFilter("all"); setLocationFilter("all"); }}
                className="px-3 py-2 text-sm text-[#484F58] hover:text-red-400 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Job listings ── */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#161B22] border border-[#1E2A3A] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-[#1E2A3A] rounded w-56 mb-3" />
                <div className="h-3 bg-[#1E2A3A] rounded w-40" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-medium mb-1">No jobs found</p>
            <p className="text-[#484F58] text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([type, groupJobs]) => (
              <div key={type}>
                {/* Section header (only when not filtering by type) */}
                {typeFilter === "all" && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${TYPE_COLORS[type as EmploymentType] || "bg-[#8B949E]/10 text-[#8B949E] border-[#8B949E]/20"}`}>
                      {TYPE_LABELS[type as EmploymentType] || type}
                    </span>
                    <div className="flex-1 h-px bg-[#1E2A3A]" />
                    <span className="text-[#484F58] text-xs">{groupJobs.length} role{groupJobs.length !== 1 ? "s" : ""}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {groupJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/careers/${job.id}`}
                      className="group block bg-[#161B22] border border-[#1E2A3A] hover:border-[#4A9EFF]/40 rounded-2xl p-6 transition-all hover:bg-[#1C2128]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-semibold text-lg group-hover:text-[#4A9EFF] transition-colors">
                            {job.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[#8B949E]">
                            {job.department && (
                              <span className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                                </svg>
                                {job.department}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                {job.location}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                </svg>
                                {job.salary_range}
                              </span>
                            )}
                            <span className="text-[#484F58]">{timeAgo(job.created_at)}</span>
                          </div>
                          {job.description && (
                            <p className="text-[#8B949E] text-sm mt-3 line-clamp-2 leading-relaxed">
                              {job.description.replace(/[#*_]/g, "")}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-3">
                          {job.employment_type && (
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${TYPE_COLORS[job.employment_type]}`}>
                              {TYPE_LABELS[job.employment_type]}
                            </span>
                          )}
                          <span className="text-[#4A9EFF] text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                            View →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#1E2A3A] py-8 text-center text-[#484F58] text-xs">
        © 2026 HireFlow · Powered by AI recruitment
      </div>
    </div>
  );
}
