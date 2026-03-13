import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>Dashboard topbar</header>
      <main>{children}</main>
    </div>
  );
}
