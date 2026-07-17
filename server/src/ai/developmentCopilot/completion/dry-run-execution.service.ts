export function dryRunExecution(input: {
  operations?: Array<{
    type: string;
    target: string;
    destructive?: boolean;
  }>;
}) {
  const operations = Array.isArray(input.operations) ? input.operations : [];
  const blockers = operations
    .filter((operation) => operation.destructive)
    .map((operation) => `Destructive operation requires explicit approval: ${operation.type} ${operation.target}`);

  return {
    status: blockers.length ? "BLOCKED" : "READY_FOR_APPROVAL",
    executed: false,
    operations: operations.map((operation, index) => ({
      step: index + 1,
      ...operation,
      mode: "DRY_RUN",
    })),
    blockers,
    approvalRequired: true,
  };
}
