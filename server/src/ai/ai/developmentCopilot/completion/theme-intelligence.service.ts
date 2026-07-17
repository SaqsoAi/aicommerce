type ThemeInput = {
  css?: string;
  tokens?: Record<string, string>;
};

export function analyzeTheme(input: ThemeInput) {
  const css = String(input.css ?? "");
  const tokens = input.tokens ?? {};
  const hardCodedColors = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  const importantCount = (css.match(/!important/g) ?? []).length;
  const mediaQueries = (css.match(/@media/g) ?? []).length;

  return {
    score: Math.max(
      0,
      100
        - Math.min(30, hardCodedColors.length * 3)
        - Math.min(25, importantCount * 5)
        - (mediaQueries === 0 ? 20 : 0),
    ),
    findings: [
      ...(hardCodedColors.length
        ? [`${hardCodedColors.length} hard-coded colors detected.`]
        : []),
      ...(importantCount
        ? [`${importantCount} !important declarations detected.`]
        : []),
      ...(mediaQueries === 0
        ? ["No explicit responsive media query detected."]
        : []),
    ],
    tokens,
    recommendations: [
      "Use semantic design tokens.",
      "Keep role accents separate from storefront theme tokens.",
      "Validate contrast and focus-visible states.",
    ],
  };
}
