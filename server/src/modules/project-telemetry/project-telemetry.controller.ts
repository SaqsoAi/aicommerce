import type { Response } from "express";
import type { Prisma } from "@prisma/client";
import type { AuthRequest } from "../auth/auth.middleware";
import { createTelemetrySnapshot, latestTelemetrySnapshots } from "./project-telemetry.service";
import { telemetryEnvelopeSchema, telemetryKinds, telemetryPayloadSchemas, type TelemetryKind } from "./project-telemetry.validation";

function parseKind(value: unknown): TelemetryKind | null {
  const normalized = String(value || "").toUpperCase();
  return telemetryKinds.includes(normalized as TelemetryKind) ? normalized as TelemetryKind : null;
}

export async function ingestTelemetry(req: AuthRequest, res: Response) {
  const kind = parseKind(req.params.kind);
  if (!kind) return res.status(400).json({ success: false, message: "Unsupported telemetry kind" });

  const envelope = telemetryEnvelopeSchema.safeParse(req.body);
  if (!envelope.success) {
    return res.status(400).json({ success: false, message: "Invalid telemetry envelope", issues: envelope.error.flatten() });
  }

  const payload = telemetryPayloadSchemas[kind].safeParse(envelope.data.payload);
  if (!payload.success) {
    return res.status(400).json({ success: false, message: `Invalid ${kind} payload`, issues: payload.error.flatten() });
  }

  try {
    const snapshot = await createTelemetrySnapshot({
      projectKey: envelope.data.projectKey,
      kind,
      source: envelope.data.source,
      branch: envelope.data.branch,
      commitSha: envelope.data.commitSha,
      capturedAt: envelope.data.capturedAt ? new Date(envelope.data.capturedAt) : new Date(),
      payload: payload.data as Prisma.InputJsonValue,
      actorId: req.user?.id || req.user?.userId,
    });
    return res.status(201).json({ success: true, data: snapshot });
  } catch (error) {
    console.error("telemetry ingest failed", { kind, source: envelope.data.source, error });
    return res.status(500).json({ success: false, message: "Telemetry ingest failed" });
  }
}

export async function getLatestTelemetry(req: AuthRequest, res: Response) {
  const projectKey = typeof req.query.projectKey === "string" && req.query.projectKey.trim() ? req.query.projectKey.trim() : "default";
  try {
    const data = await latestTelemetrySnapshots(projectKey);
    return res.json({ success: true, data });
  } catch (error) {
    console.error("latest telemetry read failed", { projectKey, error });
    return res.status(500).json({ success: false, message: "Telemetry unavailable" });
  }
}
