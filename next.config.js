/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // These FastAPI routes redirect unless called with a trailing slash
      {
        source: "/api/backend/jobs",
        destination: "http://127.0.0.1:8000/jobs/",
      },
      {
        source: "/api/backend/criteria",
        destination: "http://127.0.0.1:8000/criteria/",
      },
      {
        source: "/api/backend/applications",
        destination: "http://127.0.0.1:8000/applications/",
      },
      {
        source: "/api/backend/interviews",
        destination: "http://127.0.0.1:8000/interviews/",
      },
      {
        source: "/api/backend/shortlist",
        destination: "http://127.0.0.1:8000/shortlist/",
      },
      {
        source: "/api/backend/scoring",
        destination: "http://127.0.0.1:8000/scoring/",
      },
      {
        source: "/api/backend/selection",
        destination: "http://127.0.0.1:8000/selection/",
      },
      {
        source: "/api/backend/dashboard",
        destination: "http://127.0.0.1:8000/dashboard/",
      },
      // Public apply endpoint — no trailing slash needed
      {
        source: "/api/backend/applications/apply/:jobId",
        destination: "http://127.0.0.1:8000/applications/apply/:jobId",
      },
      // All other routes (including /auth/*) — proxy as-is
      {
        source: "/api/backend/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
