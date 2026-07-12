import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./plugin-enterprise-dashboard.css";
import AdminShellRouter from "@/components/layout/AdminShellRouter";

export const metadata: Metadata = {
  title: "AI-Commerce Admin",
  description: "AI-Commerce Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
<script
  id="admin-theme-bootstrap"
  dangerouslySetInnerHTML={{
    __html: `
      (function () {
        try {
          var theme =
            localStorage.getItem("admin-theme") ||
            localStorage.getItem("theme") ||
            localStorage.getItem("saqso-theme") ||
            "dark";

          if (theme !== "light" && theme !== "dark") theme = "dark";

          localStorage.setItem("admin-theme", theme);
          localStorage.setItem("theme", theme);
          localStorage.setItem("saqso-theme", theme);

          document.documentElement.classList.toggle("dark", theme === "dark");
          document.documentElement.dataset.theme = theme;
          if (document.body) document.body.dataset.theme = theme;
        } catch (e) {}
      })();
    `,
  }}
/><AdminShellRouter>{children}</AdminShellRouter></body>
    </html>
  );
}


