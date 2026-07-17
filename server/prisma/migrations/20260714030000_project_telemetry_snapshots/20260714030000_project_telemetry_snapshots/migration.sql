CREATE TABLE "ProjectTelemetrySnapshot" (
  "id" TEXT NOT NULL,
  "projectKey" TEXT NOT NULL DEFAULT 'default',
  "kind" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "branch" TEXT,
  "commitSha" TEXT,
  "payload" JSONB NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectTelemetrySnapshot_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectTelemetrySnapshot_projectKey_kind_capturedAt_idx"
  ON "ProjectTelemetrySnapshot"("projectKey", "kind", "capturedAt");

CREATE INDEX "ProjectTelemetrySnapshot_capturedAt_idx"
  ON "ProjectTelemetrySnapshot"("capturedAt");
