import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/providers/ThemeProvider";
import { BrandProvider } from "@/providers/BrandProvider";
import AuthProvider from "@/providers/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { Toaster } from "react-hot-toast";
import SaqsoHeader from "@/templates/saqsobuild/components/SaqsoHeader";
import PwaLifecycle from "@/components/pwa/PwaLifecycle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Commerce",
  description: "Modern AI Ecommerce Platform",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem("theme") || "light";
                document.documentElement.classList.remove("light","dark");
                document.documentElement.classList.add(theme);
              } catch {}

              try {
                const normalizeKey = (key) => String(key || "").toLowerCase().replace(/[\s_-]/g, "");
                const applyBrandMeta = (items) => {
                  const raw = {};
                  (Array.isArray(items) ? items : []).forEach((item) => {
                    const key = item.key || item.name || item.label || item.id;
                    if (key) raw[normalizeKey(key)] = item.value;
                  });

                  const storeName = raw.storename || raw.brandname || raw.name || "AI Commerce";
                  const description = raw.storedescription || raw.description || raw.metadescription || "Modern AI Ecommerce Platform";
                  const favicon = raw.favicon || raw.faviconurl || raw.pwaicon || raw.pwaiconurl || "";
                  const appleIcon = raw.appletouchicon || raw.appleicon || raw.pwaicon || "";
                  const themeColor = raw.themecolor || raw.primarycolor || raw.primary || "#c74b21";

                  document.title = storeName;

                  const upsert = (selector, attrs) => {
                    let el = document.head.querySelector(selector);
                    if (!el) {
                      el = document.createElement("meta");
                      document.head.appendChild(el);
                    }
                    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
                  };

                  upsert('meta[name="description"]', { name: "description", content: description });
                  upsert('meta[name="theme-color"]', { name: "theme-color", content: themeColor });

                  const upsertLink = (selector, attrs) => {
                    let el = document.head.querySelector(selector);
                    if (!el) {
                      el = document.createElement("link");
                      document.head.appendChild(el);
                    }
                    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
                  };

                  if (favicon) {
                    upsertLink('link[rel="icon"]', { rel: "icon", href: favicon });
                    upsertLink('link[rel="shortcut icon"]', { rel: "shortcut icon", href: favicon });
                  }

                  if (appleIcon) {
                    upsertLink('link[rel="apple-touch-icon"]', { rel: "apple-touch-icon", href: appleIcon });
                  }
                };

                const loadBrandMeta = async () => {
                  try {
                    const res = await fetch("/api/enterprise-settings", { cache: "no-store" });
                    const json = await res.json();
                    const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
                    applyBrandMeta(list);
                  } catch {}
                };

                loadBrandMeta();
                window.addEventListener("ai-commerce-brand-refresh", loadBrandMeta);
                window.addEventListener("ai-commerce-settings-refresh", loadBrandMeta);
                window.addEventListener("storage", loadBrandMeta);
              } catch {}
            `,
          }}
        />
      </head>

      <body className="min-h-full bg-zinc-50 text-zinc-950 transition-colors dark:bg-black dark:text-white">
        <ThemeProvider>
          <BrandProvider>
            <AuthProvider>
              <Toaster position="top-right" reverseOrder={false} />

              <SaqsoHeader />
              <PwaLifecycle />

              <main className="min-h-[100dvh] overflow-x-hidden pb-[calc(4.25rem+env(safe-area-inset-bottom))] pt-[56px] sm:pt-[64px] md:pb-0 lg:pt-[72px]">
                {children}
              </main>
            </AuthProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#c74b21"
};


