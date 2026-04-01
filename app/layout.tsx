import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "HireFlow",
  description: "AI-Powered Recruitment Platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0D1117] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
