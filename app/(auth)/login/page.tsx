"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../lib/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-[#1E2A3A] relative overflow-hidden">

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#4A9EFF 1px, transparent 1px), linear-gradient(90deg, #4A9EFF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#4A9EFF] rounded-full opacity-[0.06] blur-[120px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4A9EFF] rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">HireFlow</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4A9EFF]/10 border border-[#4A9EFF]/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-[#4A9EFF] rounded-full animate-pulse" />
              <span className="text-[#4A9EFF] text-xs font-medium tracking-wide uppercase">
                AI-Powered Recruitment
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Hire smarter,<br />
              <span className="text-[#4A9EFF]">not harder.</span>
            </h1>
            <p className="text-[#8B949E] text-base leading-relaxed max-w-sm">
              From job post to final hire — every step assisted by AI.
              Built for recruiters who value their time.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "10×", label: "Faster screening" },
              { value: "AI", label: "Ranked candidates" },
              { value: "100%", label: "Audit trail" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-4"
              >
                <div className="text-[#4A9EFF] text-xl font-bold">{stat.value}</div>
                <div className="text-[#8B949E] text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Pipeline preview */}
          <div className="bg-[#161B22] border border-[#1E2A3A] rounded-xl p-4 space-y-3">
            <div className="text-[#8B949E] text-xs font-medium uppercase tracking-wide">
              Live pipeline
            </div>
            {[
              { label: "Applied",     count: 48, color: "#8B949E", pct: "100%" },
              { label: "AI Scored",   count: 48, color: "#4A9EFF", pct: "100%" },
              { label: "Shortlisted", count: 12, color: "#58A6FF", pct: "25%"  },
              { label: "Interviewed", count: 6,  color: "#3FB950", pct: "12%"  },
              { label: "Hired",       count: 1,  color: "#3FB950", pct: "2%"   },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-20 text-[#8B949E] text-xs">{s.label}</div>
                <div className="flex-1 bg-[#0D1117] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: s.pct, backgroundColor: s.color }}
                  />
                </div>
                <div className="w-6 text-right text-[#8B949E] text-xs">{s.count}</div>
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

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-[#4A9EFF] rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">HireFlow</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
            <p className="text-[#8B949E] text-sm">Sign in to your recruiter account</p>
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
                className="w-full bg-[#161B22] border border-[#1E2A3A] text-white placeholder-[#484F58] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4A9EFF] focus:ring-1 focus:ring-[#4A9EFF]/30 transition-all"
              />
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-[#8B949E] text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#4A9EFF] hover:text-[#58A6FF] font-medium transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
