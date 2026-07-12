export const saqsoBuildClientTokens = {
  mode: "dark",
  radius: { sm: "12px", md: "18px", lg: "28px", xl: "36px" },
  spacing: { mobileX: "16px", desktopX: "32px" },
  motion: { fast: "160ms", normal: "260ms", slow: "420ms" },
  typography: { display: "clamp(2.6rem, 6vw, 6.8rem)", title: "clamp(1.6rem, 3vw, 3rem)", body: "15px" },
} as const;

export type SaqsoBuildClientTokens = typeof saqsoBuildClientTokens;