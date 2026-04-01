"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../lib/store/useAuthStore";
import { UserRole } from "../../../types";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("recruiter");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, role });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-[#1E2A3A] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#4A9EFF 1px, transparent 1px), linear-gradient(90deg, #4A9EFF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#4A9EFF] rounded-full opacity-[0.06] blur-[120px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4A9EFF] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">HireFlow</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4A9EFF]/10 border border-[#4A9EFF]/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-[#4A9EFF] rounded-full animate-pulse" />
              <span className="text-[#4A9EFF] text-xs font-medium tracking-wide uppercase">
                Join the platform
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Start hiring<br />
              <span className="text-[#4A9EFF]">with AI today.</span>
            </h1>
            <p className="text-[#8B949E] text-base leading-relaxed max-w-sm">
              Set up your account in seconds. AI-assisted job posts,
              CV scoring, and smart shortlisting — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "✦", title: "AI Job Generation", desc: "Draft job descriptions from bullet points" },
              { icon: "✦", title: "Automatic CV Scoring", desc: "Every applicant ranked against your criteria" },
              { icon: "✦", title: "Structured Interviews", desc: "AI-suggested scorecards per role" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 bg-[#161B22] border border-[#1E2A3A] rounded-xl p-4">
                <span className="text-[#4A9EFF] text-xs mt-0.5">{f.icon}</span>
                <div>
                  <div className="text-white text-sm font-medium">{f.title}</div>
                  <div className="text-[#8B949E] text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[#484F58] text-xs">
          © 2026 HireFlow · Pilot: Recruitment Matters Zimbabwe
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">

          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4A9EFF] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">HireFlow</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create account</h2>
            <p className="text-[#8B949E] text-sm">Get started with HireFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#F85149" strokeWidth="1.5" />
                  <path d="M7 4v3M7 9.5v.5" stroke="#F85149" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[#8B949E] text-xs font-medium uppercase tracking-wide">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full bg-[#161B22] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#8B949E] text-xs font-medium uppercase tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-[#161B22] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#8B949E] text-xs font-medium uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full bg-[#161B22] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#8B949E] text-xs font-medium uppercase tracking-wide">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-[#161B22] border border-[#1E2A3A] text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all appearance-none"
              >
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A9EFF] hover:bg-[#58A6FF] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-3 text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-[#8B949E] text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#4A9EFF] hover:text-[#58A6FF] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
