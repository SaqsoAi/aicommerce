import type { PluginManifest } from "./plugin-platform.types";

export interface TransactionFilePlan {
  owner: "server" | "admin" | "client";
  sourcePath: string;
  destinationPath: string;
  sha256: string;
  sizeBytes: number;
  operation: "create" | "replace";
}

export interface TransactionExecutionRequest {
  planFingerprint: string;
  archiveBase64: string;
  reason: string;
}

export interface TransactionJournalEntry {
  sequence: number;
  owner: string;
  destinationPath: string;
  destinationAbsolute: string;
  backupAbsolute?: string;
  existedBefore: boolean;
  previousSha256?: string;
  expectedSha256: string;
  appliedSha256?: string;
  status: "PENDING" | "BACKED_UP" | "APPLIED" | "VERIFIED" | "ROLLED_BACK" | "FAILED";
}

export interface ParsedPluginPackage {
  manifest: PluginManifest;
  checksums: Map<string, string>;
  files: Map<string, Buffer>;
  packageSha256: string;
}
