type Viewport = {
  name: string;
  width: number;
};

const DEFAULT_VIEWPORTS: Viewport[] = [
  { name: "mobile", width: 390 },
  { name: "tablet", width: 768 },
  { name: "desktop", width: 1440 },
];

export function responsiveAudit(input: {
  declaredBreakpoints?: number[];
  viewports?: Viewport[];
  hasHorizontalOverflow?: boolean;
}) {
  const viewports = input.viewports ?? DEFAULT_VIEWPORTS;
  const breakpoints = input.declaredBreakpoints ?? [];

  return {
    viewports: viewports.map((viewport) => ({
      ...viewport,
      covered: breakpoints.some((breakpoint) => breakpoint <= viewport.width),
    })),
    overflowRisk: Boolean(input.hasHorizontalOverflow),
    score: Math.max(
      0,
      100
        - (input.hasHorizontalOverflow ? 35 : 0)
        - (breakpoints.length === 0 ? 30 : 0),
    ),
    recommendations: [
      "Use fluid minmax grid columns.",
      "Keep touch targets at least 44px.",
      "Test 390px, 768px and 1440px widths.",
    ],
  };
}
