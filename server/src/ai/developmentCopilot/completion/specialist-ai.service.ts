export type SpecialistName =
  | "ARCHITECTURE"
  | "SECURITY"
  | "PERFORMANCE"
  | "DATABASE"
  | "FRONTEND"
  | "BACKEND"
  | "DEVOPS"
  | "UX";

const SPECIALISTS: Record<SpecialistName, string[]> = {
  ARCHITECTURE: ["module boundaries", "ownership", "dependencies"],
  SECURITY: ["authentication", "authorization", "tenant isolation"],
  PERFORMANCE: ["query efficiency", "rendering", "caching"],
  DATABASE: ["schema", "indexes", "migration safety"],
  FRONTEND: ["accessibility", "state", "responsive design"],
  BACKEND: ["contracts", "validation", "error handling"],
  DEVOPS: ["build", "deployment", "rollback"],
  UX: ["flows", "clarity", "interaction feedback"],
};

export function specialistReview(input: {
  specialist?: SpecialistName;
  context?: unknown;
}) {
  const specialist = input.specialist ?? "ARCHITECTURE";
  return {
    specialist,
    reviewAreas: SPECIALISTS[specialist],
    context: input.context ?? {},
    status: "ANALYSIS_READY",
    approvalRequiredForChanges: true,
  };
}

export function specialistCouncil(input: {context?: unknown}) {
  return Object.keys(SPECIALISTS).map((name) =>
    specialistReview({
      specialist: name as SpecialistName,
      context: input.context,
    }),
  );
}
