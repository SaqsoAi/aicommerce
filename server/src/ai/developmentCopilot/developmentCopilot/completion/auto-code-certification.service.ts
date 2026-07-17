type CertificationInput = {
  files?: Array<{
    path: string;
    typeErrors?: number;
    securityIssues?: number;
    testCoverage?: number;
  }>;
  buildPassed?: boolean;
};

export function autoCodeCertification(input: CertificationInput) {
  const files = input.files ?? [];
  const typeErrors = files.reduce((sum, file) => sum + Number(file.typeErrors ?? 0), 0);
  const securityIssues = files.reduce((sum, file) => sum + Number(file.securityIssues ?? 0), 0);
  const averageCoverage = files.length
    ? files.reduce((sum, file) => sum + Number(file.testCoverage ?? 0), 0) / files.length
    : 0;

  const blockers = [
    ...(input.buildPassed ? [] : ["Production build has not passed."]),
    ...(typeErrors ? [`${typeErrors} TypeScript errors remain.`] : []),
    ...(securityIssues ? [`${securityIssues} security issues remain.`] : []),
    ...(averageCoverage < 60 ? ["Average test coverage is below 60%."] : []),
  ];

  return {
    status: blockers.length ? "NOT_CERTIFIED" : "CERTIFIED",
    blockers,
    metrics: {
      files: files.length,
      typeErrors,
      securityIssues,
      averageCoverage,
      buildPassed: Boolean(input.buildPassed),
    },
    certificate: blockers.length
      ? undefined
      : {
          standard: "SAQSO-AI-BUILDER-ENTERPRISE",
          issuedAt: new Date().toISOString(),
        },
  };
}
