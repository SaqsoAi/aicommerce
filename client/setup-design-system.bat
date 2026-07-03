@echo off

REM =========================
REM CREATE FOLDERS
REM =========================

mkdir src\design\tokens 2>nul
mkdir src\design\themes 2>nul
mkdir src\providers 2>nul
mkdir src\components\ui 2>nul
mkdir src\components\layouts 2>nul
mkdir src\components\shared 2>nul
mkdir src\styles 2>nul

REM =========================
REM COLORS
REM =========================

(
echo export const colors = {
echo   primary: "#2563EB",
echo   secondary: "#7C3AED",
echo.
echo   success: "#10B981",
echo   warning: "#F59E0B",
echo   danger: "#EF4444",
echo.
echo   white: "#FFFFFF",
echo   black: "#111827",
echo.
echo   gray50: "#F9FAFB",
echo   gray100: "#F3F4F6",
echo   gray200: "#E5E7EB",
echo   gray300: "#D1D5DB",
echo   gray500: "#6B7280",
echo   gray700: "#374151",
echo   gray900: "#111827",
echo };
) > src\design\tokens\colors.ts

REM =========================
REM SPACING
REM =========================

(
echo export const spacing = {
echo   xs: "4px",
echo   sm: "8px",
echo   md: "16px",
echo   lg: "24px",
echo   xl: "32px",
echo   "2xl": "48px",
echo   "3xl": "64px",
echo };
) > src\design\tokens\spacing.ts

REM =========================
REM TYPOGRAPHY
REM =========================

(
echo export const typography = {
echo   fontFamily: {
echo     heading: "Inter",
echo     body: "Inter",
echo   },
echo.
echo   fontSize: {
echo     xs: "12px",
echo     sm: "14px",
echo     md: "16px",
echo     lg: "18px",
echo     xl: "24px",
echo     xxl: "32px",
echo     hero: "56px",
echo   },
echo };
) > src\design\tokens\typography.ts

REM =========================
REM RADIUS
REM =========================

(
echo export const radius = {
echo   sm: "6px",
echo   md: "12px",
echo   lg: "20px",
echo   xl: "28px",
echo };
) > src\design\tokens\radius.ts

REM =========================
REM SHADOWS
REM =========================

(
echo export const shadows = {
echo   sm: "0 1px 2px rgba(0,0,0,0.05)",
echo   md: "0 4px 6px rgba(0,0,0,0.1)",
echo   lg: "0 10px 15px rgba(0,0,0,0.15)",
echo };
) > src\design\tokens\shadows.ts

REM =========================
REM LIGHT THEME
REM =========================

(
echo export const lightTheme = {
echo   background: "#FFFFFF",
echo   surface: "#F9FAFB",
echo.
echo   text: "#111827",
echo   textSecondary: "#6B7280",
echo.
echo   primary: "#2563EB",
echo };
) > src\design\themes\light.ts

REM =========================
REM DARK THEME
REM =========================

(
echo export const darkTheme = {
echo   background: "#0F172A",
echo   surface: "#1E293B",
echo.
echo   text: "#FFFFFF",
echo   textSecondary: "#CBD5E1",
echo.
echo   primary: "#60A5FA",
echo };
) > src\design\themes\dark.ts

type nul > src\design\themes\luxury.ts
type nul > src\design\themes\fashion.ts
type nul > src\design\themes\modern.ts

REM =========================
REM THEME CSS
REM =========================

(
echo :root {
echo   --primary: #2563eb;
echo.
echo   --background: #ffffff;
echo   --surface: #f8fafc;
echo.
echo   --text: #111827;
echo }
echo.
echo [data-theme="dark"] {
echo   --background: #0f172a;
echo   --surface: #1e293b;
echo.
echo   --text: #ffffff;
echo }
) > src\styles\theme.css

REM =========================
REM PROVIDER
REM =========================

(
echo "use client";
echo.
echo import { useState } from "react";
echo.
echo export default function ThemeProvider({ children }: any) {
echo   const [theme, setTheme] = useState("light");
echo.
echo   const toggleTheme = () =^> {
echo     setTheme(
echo       theme === "light"
echo         ? "dark"
echo         : "light"
echo     );
echo   };
echo.
echo   return children;
echo }
) > src\providers\ThemeProvider.tsx

REM =========================
REM UI COMPONENTS
REM =========================

type nul > src\components\ui\Button.tsx
type nul > src\components\ui\Input.tsx
type nul > src\components\ui\Textarea.tsx
type nul > src\components\ui\Card.tsx
type nul > src\components\ui\Modal.tsx
type nul > src\components\ui\Badge.tsx
type nul > src\components\ui\Avatar.tsx
type nul > src\components\ui\Dropdown.tsx
type nul > src\components\ui\Select.tsx
type nul > src\components\ui\Switch.tsx
type nul > src\components\ui\Tabs.tsx
type nul > src\components\ui\Table.tsx
type nul > src\components\ui\Pagination.tsx

REM =========================
REM LAYOUTS
REM =========================

type nul > src\components\layouts\StoreLayout.tsx
type nul > src\components\layouts\AdminLayout.tsx
type nul > src\components\layouts\DashboardLayout.tsx
type nul > src\components\layouts\AuthLayout.tsx

echo.
echo =====================================
echo DESIGN SYSTEM CREATED SUCCESSFULLY
echo =====================================
pause