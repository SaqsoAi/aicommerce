import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import prisma from "../../prisma/prisma";
import { parsePluginPackage } from "./plugin-platform.transaction.archive";
import type {
  TransactionExecutionRequest,
  TransactionJournalEntry,
} from "./plugin-platform.transaction.types";

const ACTIVE_TRANSACTION_STATUSES = [
  "QUEUED",
  "VALIDATING",
  "WAITING_DATABASE",
  "MIGRATION_REVIEW_REQUIRED",
  "DATABASE_APPROVED",
  "READY_TO_EXECUTE",
  "BACKING_UP",
  "APPLYING_FILES",
  "VERIFYING",
  "COMMITTING",
  "ROLLING_BACK",
] as const;

const TERMINAL_TRANSACTION_STATUSES = [
  "SUCCEEDED",
  "FAILED",
  "ROLLED_BACK",
  "CANCELLED",
] as const;

function isTerminalTransactionStatus(status: unknown): boolean {
  return TERMINAL_TRANSACTION_STATUSES.includes(
    String(status || "") as (typeof TERMINAL_TRANSACTION_STATUSES)[number],
  );
}

const ROOTS: Record<string, string> = {
  server: path.resolve(process.env.PLUGIN_SERVER_ROOT || "D:\\AI-ECOMMERCE\\server"),
  admin: path.resolve(process.env.PLUGIN_ADMIN_ROOT || "D:\\AI-ECOMMERCE\\admin"),
  client: path.resolve(process.env.PLUGIN_CLIENT_ROOT || "D:\\AI-ECOMMERCE\\client"),
};

const TRANSACTION_ROOT = path.resolve(
  process.env.PLUGIN_TRANSACTION_ROOT ||
    "D:\\AI-ECOMMERCE\\NEW_SAAS_GOVERNACE\\PLUGIN_TRANSACTIONS"
);

function fail(code: string, message: string, statusCode = 409): never {
  throw Object.assign(new Error(message), { code, statusCode });
}

function requireReason(value: unknown): string {
  const reason = String(value || "").trim();
  if (reason.length < 5) fail("PKG_REASON_REQUIRED", "A reason of at least 5 characters is required", 422);
  return reason.slice(0, 500);
}

function hash(content: Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

async function hashFile(filePath: string): Promise<string> {
  return hash(await fs.readFile(filePath));
}

function destinationFor(owner: string, relative: string): string {
  const root = ROOTS[owner];
  if (!root) fail("PKG_OWNER_INVALID", `Unsupported file owner: ${owner}`, 422);
  const destination = path.resolve(root, ...relative.replace(/\\/g, "/").split("/"));
  const rootPrefix = root.endsWith(path.sep) ? root : root + path.sep;
  if (!destination.startsWith(rootPrefix)) fail("PKG_DESTINATION_ESCAPE", `Destination escaped ${owner} root`, 422);
  return destination;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export class PluginTransactionService {
  async list(pluginKey?: string) {
    return (prisma as any).pluginInstallTransaction.findMany({
      where: pluginKey ? { plugin: { pluginKey } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { plugin: true, installation: true, fileOperations: { orderBy: { sequence: "asc" } }, logs: true },
    });
  }

  async get(transactionId: string) {
    return (prisma as any).pluginInstallTransaction.findUnique({
      where: { id: transactionId },
      include: {
        plugin: true,
        installation: true,
        fileOperations: { orderBy: { sequence: "asc" } },
        logs: { orderBy: { createdAt: "asc" } },
      },
    });
  }

  private async log(transactionId: string, event: string, message: string, metadata?: unknown, level = "INFO") {
    await (prisma as any).pluginTransactionLog.create({
      data: { transactionId, level, event, message, metadata: metadata as any },
    });
  }

  async execute(request: TransactionExecutionRequest, actorId: string) {
    const reason = requireReason(request.reason);
    const installation = await (prisma as any).pluginInstallation.findUnique({
      where: { planFingerprint: request.planFingerprint },
      include: { plugin: true, pluginVersion: true },
    });
    if (!installation) fail("PKG_PLAN_NOT_FOUND", "Approved installation plan not found", 404);
    if (installation.status !== "APPROVED") fail("PKG_PLAN_NOT_APPROVED", "Installation plan is not approved");
    if (installation.startedAt) fail("PKG_PLAN_ALREADY_STARTED", "Installation plan has already been started");

    const parsed = parsePluginPackage(request.archiveBase64);
    if (parsed.packageSha256 !== installation.pluginVersion.packageSha256) {
      fail("PKG_PACKAGE_HASH_MISMATCH", "Uploaded archive does not match the approved package hash", 422);
    }
    if (parsed.manifest.pluginKey !== installation.plugin.pluginKey ||
        parsed.manifest.version !== installation.pluginVersion.version) {
      fail("PKG_PLAN_PACKAGE_MISMATCH", "Package identity does not match the approved plan", 422);
    }

    const plan = installation.plan as any;
    if (plan.fingerprint !== request.planFingerprint) fail("PKG_PLAN_STALE", "Plan fingerprint is stale");
    const transactionDir = path.join(TRANSACTION_ROOT, installation.id);
    const stagingDir = path.join(transactionDir, "staging");
    const backupDir = path.join(transactionDir, "backup");

    const transaction = await (prisma as any).pluginInstallTransaction.create({
      data: {
        pluginId: installation.pluginId,
        installationId: installation.id,
        status: "VALIDATING",
        planFingerprint: request.planFingerprint,
        packageSha256: parsed.packageSha256,
        stagingPath: stagingDir,
        backupPath: backupDir,
        requestedBy: actorId,
      },
    });

    const journal: TransactionJournalEntry[] = [];
    try {
      await fs.mkdir(stagingDir, { recursive: true });
      await fs.mkdir(backupDir, { recursive: true });
      await fs.writeFile(
        path.join(transactionDir, "package.base64"),
        request.archiveBase64,
        "utf8",
      );
      await this.log(transaction.id, "TRANSACTION_CREATED", "Installation transaction created");

      if (parsed.manifest.databaseChanges?.hasChanges) {
        await (prisma as any).pluginInstallTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "WAITING_DATABASE",
            migrationGate: {
              declared: true,
              migrationPlanPath: parsed.manifest.databaseChanges.migrationPlanPath,
              rollbackPlanPath: parsed.manifest.databaseChanges.rollbackPlanPath,
              deployExecuted: false,
            },
          },
        });
        await this.log(transaction.id, "MIGRATION_GATE", "Database changes require separate explicit approval");
        return this.get(transaction.id);
      }

      await (prisma as any).pluginInstallation.update({
        where: { id: installation.id },
        data: { status: "INSTALLING", startedAt: new Date() },
      });
      await (prisma as any).pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: { status: "BACKING_UP" },
      });

      let sequence = 0;
      for (const declaration of parsed.manifest.files) {
        sequence += 1;
        const destination = destinationFor(declaration.owner, declaration.destinationPath);
        const content = parsed.files.get(declaration.sourcePath.toLowerCase());
        if (!content) fail("PKG_FILE_MISSING", `Missing package file ${declaration.sourcePath}`, 422);

        const owned = await (prisma as any).pluginFile.findUnique({
          where: { owner_destinationPath: { owner: declaration.owner, destinationPath: declaration.destinationPath } },
        });
        if (owned && owned.pluginId !== installation.pluginId) {
          fail("PKG_FILE_OWNERSHIP_CONFLICT", `${declaration.destinationPath} is owned by another plugin`);
        }

        const existedBefore = await exists(destination);
        const previousSha256 = existedBefore ? await hashFile(destination) : undefined;
        const backupAbsolute = existedBefore
          ? path.join(backupDir, declaration.owner, declaration.destinationPath)
          : undefined;

        if (backupAbsolute) {
          await fs.mkdir(path.dirname(backupAbsolute), { recursive: true });
          await fs.copyFile(destination, backupAbsolute);
          if (await hashFile(backupAbsolute) != previousSha256) {
            fail("PKG_BACKUP_HASH", `Backup verification failed for ${declaration.destinationPath}`);
          }
        }

        const stagingAbsolute = path.join(stagingDir, declaration.owner, declaration.destinationPath);
        await fs.mkdir(path.dirname(stagingAbsolute), { recursive: true });
        await fs.writeFile(stagingAbsolute, content);
        if (await hashFile(stagingAbsolute) !== declaration.sha256) {
          fail("PKG_STAGE_HASH", `Staging verification failed for ${declaration.destinationPath}`);
        }

        const entry: TransactionJournalEntry = {
          sequence,
          owner: declaration.owner,
          destinationPath: declaration.destinationPath,
          destinationAbsolute: destination,
          backupAbsolute,
          existedBefore,
          previousSha256,
          expectedSha256: declaration.sha256,
          status: "BACKED_UP",
        };
        journal.push(entry);
        await (prisma as any).pluginFileOperation.create({
          data: {
            transactionId: transaction.id,
            sequence,
            owner: declaration.owner,
            destinationPath: declaration.destinationPath,
            operation: declaration.operation,
            previousSha256,
            expectedSha256: declaration.sha256,
            status: "BACKED_UP",
          },
        });
      }

      await (prisma as any).pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: { status: "APPLYING_FILES", journal: journal as any },
      });

      for (const entry of journal) {
        const stagingAbsolute = path.join(stagingDir, entry.owner, entry.destinationPath);
        await fs.mkdir(path.dirname(entry.destinationAbsolute), { recursive: true });
        await fs.copyFile(stagingAbsolute, entry.destinationAbsolute);
        entry.appliedSha256 = await hashFile(entry.destinationAbsolute);
        if (entry.appliedSha256 !== entry.expectedSha256) {
          fail("PKG_APPLY_HASH", `Installed hash mismatch for ${entry.destinationPath}`);
        }
        entry.status = "VERIFIED";
        await (prisma as any).pluginFileOperation.update({
          where: { transactionId_sequence: { transactionId: transaction.id, sequence: entry.sequence } },
          data: { appliedSha256: entry.appliedSha256, status: "VERIFIED" },
        });
      }

      await (prisma as any).pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: { status: "COMMITTING", journal: journal as any },
      });

      await prisma.$transaction(async (tx: any) => {
        for (const declaration of parsed.manifest.files) {
          await tx.pluginFile.upsert({
            where: { owner_destinationPath: { owner: declaration.owner, destinationPath: declaration.destinationPath } },
            update: {
              pluginId: installation.pluginId,
              sourcePath: declaration.sourcePath,
              sha256: declaration.sha256,
              sizeBytes: declaration.sizeBytes,
              installedVersion: parsed.manifest.version,
            },
            create: {
              pluginId: installation.pluginId,
              owner: declaration.owner,
              destinationPath: declaration.destinationPath,
              sourcePath: declaration.sourcePath,
              sha256: declaration.sha256,
              sizeBytes: declaration.sizeBytes,
              installedVersion: parsed.manifest.version,
            },
          });
        }

        await tx.pluginInstallation.update({
          where: { id: installation.id },
          data: { status: "SUCCEEDED", completedAt: new Date() },
        });
        await tx.plugin.update({
          where: { id: installation.pluginId },
          data: {
            currentVersion: parsed.manifest.version,
            status: "INSTALLED",
            manifest: parsed.manifest as any,
          },
        });
        await tx.pluginInstallTransaction.update({
          where: { id: transaction.id },
          data: { status: "SUCCEEDED", journal: journal as any, completedAt: new Date() },
        });
        await tx.pluginAuditEvent.create({
          data: {
            pluginId: installation.pluginId,
            actorId,
            action: "PLUGIN_TRANSACTION_COMMITTED",
            outcome: "SUCCESS",
            reason,
            metadata: { transactionId: transaction.id, files: journal.length },
          },
        });
      });

      await this.log(transaction.id, "TRANSACTION_COMMITTED", "Installation transaction committed", { files: journal.length });
      return this.get(transaction.id);
    } catch (error: any) {
      await this.rollbackInternal(transaction.id, journal, actorId, reason, error);
      throw error;
    }
  }

  private async rollbackInternal(
    transactionId: string,
    journal: TransactionJournalEntry[],
    actorId: string,
    reason: string,
    cause: any
  ) {
    await (prisma as any).pluginInstallTransaction.update({
      where: { id: transactionId },
      data: { status: "ROLLING_BACK", errorCode: cause?.code, errorMessage: String(cause?.message || cause) },
    });

    for (const entry of [...journal].reverse()) {
      try {
        if (entry.existedBefore && entry.backupAbsolute) {
          await fs.mkdir(path.dirname(entry.destinationAbsolute), { recursive: true });
          await fs.copyFile(entry.backupAbsolute, entry.destinationAbsolute);
          if (entry.previousSha256 && await hashFile(entry.destinationAbsolute) !== entry.previousSha256) {
            throw new Error("Restored file hash mismatch");
          }
        } else if (await exists(entry.destinationAbsolute)) {
          await fs.unlink(entry.destinationAbsolute);
        }
        entry.status = "ROLLED_BACK";
      } catch (rollbackError: any) {
        entry.status = "FAILED";
        await this.log(transactionId, "ROLLBACK_FILE_FAILED", String(rollbackError?.message || rollbackError), { path: entry.destinationPath }, "ERROR");
      }
    }

    const tx = await (prisma as any).pluginInstallTransaction.findUnique({ where: { id: transactionId } });
    if (tx) {
      await prisma.$transaction(async (db: any) => {
        await db.pluginInstallTransaction.update({
          where: { id: transactionId },
          data: { status: "ROLLED_BACK", journal: journal as any, completedAt: new Date() },
        });
        await db.pluginInstallation.update({
          where: { id: tx.installationId },
          data: { status: "ROLLED_BACK", completedAt: new Date(), errorCode: cause?.code, errorMessage: String(cause?.message || cause) },
        });
        await db.plugin.update({
          where: { id: tx.pluginId },
          data: { status: "ROLLBACK_REQUIRED" },
        });
        await db.pluginAuditEvent.create({
          data: {
            pluginId: tx.pluginId,
            actorId,
            action: "PLUGIN_TRANSACTION_ROLLED_BACK",
            outcome: "FAILED",
            reason,
            metadata: { transactionId, cause: String(cause?.message || cause) },
          },
        });
      });
    }
  }

  async resumeMigrationGate(
    transactionId: string,
    actorId: string,
    reasonValue: unknown,
  ) {
    const reason = requireReason(reasonValue);
    const transaction = await (prisma as any).pluginInstallTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) fail("PKG_TX_NOT_FOUND", "Transaction not found", 404);
    if (!["WAITING_DATABASE", "MIGRATION_REVIEW_REQUIRED"].includes(transaction.status)) {
      fail("PKG_TX_STATE", "Transaction is not awaiting database review");
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "DATABASE_APPROVED",
          migrationGate: {
            ...(transaction.migrationGate || {}),
            acknowledged: true,
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: actorId,
            deployExecuted: true,
          },
        },
      });
      await tx.pluginAuditEvent.create({
        data: {
          pluginId: transaction.pluginId,
          actorId,
          action: "PLUGIN_MIGRATION_REVIEW_ACKNOWLEDGED",
          outcome: "SUCCESS",
          reason,
          metadata: { transactionId, deployExecuted: true },
        },
      });
    });

    await this.log(
      transaction.id,
      "DATABASE_APPROVED",
      "Database review recorded. Installation is ready for explicit execution.",
    );

    return this.get(transaction.id);
  }

  async continueInstallation(
    transactionId: string,
    actorId: string,
    reasonValue: unknown,
  ) {
    const reason = requireReason(reasonValue);
    const transaction = await (prisma as any).pluginInstallTransaction.findUnique({
      where: { id: transactionId },
      include: {
        installation: {
          include: { plugin: true, pluginVersion: true },
        },
      },
    });

    if (!transaction) fail("PKG_TX_NOT_FOUND", "Transaction not found", 404);
    if (!["DATABASE_APPROVED", "READY_TO_EXECUTE"].includes(transaction.status)) {
      fail("PKG_TX_STATE", "Transaction is not ready for execution");
    }

    const transactionDir = path.dirname(transaction.stagingPath);
    const archivePath = path.join(transactionDir, "package.base64");
    if (!(await exists(archivePath))) {
      fail(
        "PKG_MIGRATION_REUPLOAD_REQUIRED",
        "Persisted package archive is unavailable. Re-upload the same plugin package.",
      );
    }

    const archiveBase64 = await fs.readFile(archivePath, "utf8");
    const parsed = parsePluginPackage(archiveBase64);
    const installation = transaction.installation;
    const stagingDir = transaction.stagingPath;
    const backupDir = transaction.backupPath || path.join(transactionDir, "backup");
    const journal: TransactionJournalEntry[] = [];

    if (parsed.packageSha256 !== transaction.packageSha256) {
      fail("PKG_PACKAGE_HASH_MISMATCH", "Persisted package hash does not match transaction");
    }
    if (
      parsed.manifest.pluginKey !== installation.plugin.pluginKey ||
      parsed.manifest.version !== installation.pluginVersion.version
    ) {
      fail("PKG_PLAN_PACKAGE_MISMATCH", "Persisted package identity does not match installation plan");
    }

    await (prisma as any).pluginInstallTransaction.update({
      where: { id: transaction.id },
      data: {
        migrationGate: {
          ...(transaction.migrationGate || {}),
          acknowledged: true,
          acknowledgedAt: new Date().toISOString(),
          acknowledgedBy: actorId,
          deployExecuted: true,
        },
      },
    });
    await this.log(
      transaction.id,
      "MIGRATION_GATE_RESUMED",
      "Database migration review acknowledged; source installation resumed",
    );

    try {
          await (prisma as any).pluginInstallation.update({
            where: { id: installation.id },
            data: { status: "INSTALLING", startedAt: new Date() },
          });
          await (prisma as any).pluginInstallTransaction.update({
            where: { id: transaction.id },
            data: { status: "BACKING_UP" },
          });
    
          let sequence = 0;
          for (const declaration of parsed.manifest.files) {
            sequence += 1;
            const destination = destinationFor(declaration.owner, declaration.destinationPath);
            const content = parsed.files.get(declaration.sourcePath.toLowerCase());
            if (!content) fail("PKG_FILE_MISSING", `Missing package file ${declaration.sourcePath}`, 422);
    
            const owned = await (prisma as any).pluginFile.findUnique({
              where: { owner_destinationPath: { owner: declaration.owner, destinationPath: declaration.destinationPath } },
            });
            if (owned && owned.pluginId !== installation.pluginId) {
              fail("PKG_FILE_OWNERSHIP_CONFLICT", `${declaration.destinationPath} is owned by another plugin`);
            }
    
            const existedBefore = await exists(destination);
            const previousSha256 = existedBefore ? await hashFile(destination) : undefined;
            const backupAbsolute = existedBefore
              ? path.join(backupDir, declaration.owner, declaration.destinationPath)
              : undefined;
    
            if (backupAbsolute) {
              await fs.mkdir(path.dirname(backupAbsolute), { recursive: true });
              await fs.copyFile(destination, backupAbsolute);
              if (await hashFile(backupAbsolute) != previousSha256) {
                fail("PKG_BACKUP_HASH", `Backup verification failed for ${declaration.destinationPath}`);
              }
            }
    
            const stagingAbsolute = path.join(stagingDir, declaration.owner, declaration.destinationPath);
            await fs.mkdir(path.dirname(stagingAbsolute), { recursive: true });
            await fs.writeFile(stagingAbsolute, content);
            if (await hashFile(stagingAbsolute) !== declaration.sha256) {
              fail("PKG_STAGE_HASH", `Staging verification failed for ${declaration.destinationPath}`);
            }
    
            const entry: TransactionJournalEntry = {
              sequence,
              owner: declaration.owner,
              destinationPath: declaration.destinationPath,
              destinationAbsolute: destination,
              backupAbsolute,
              existedBefore,
              previousSha256,
              expectedSha256: declaration.sha256,
              status: "BACKED_UP",
            };
            journal.push(entry);
            await (prisma as any).pluginFileOperation.create({
              data: {
                transactionId: transaction.id,
                sequence,
                owner: declaration.owner,
                destinationPath: declaration.destinationPath,
                operation: declaration.operation,
                previousSha256,
                expectedSha256: declaration.sha256,
                status: "BACKED_UP",
              },
            });
          }
    
          await (prisma as any).pluginInstallTransaction.update({
            where: { id: transaction.id },
            data: { status: "APPLYING_FILES", journal: journal as any },
          });
    
          for (const entry of journal) {
            const stagingAbsolute = path.join(stagingDir, entry.owner, entry.destinationPath);
            await fs.mkdir(path.dirname(entry.destinationAbsolute), { recursive: true });
            await fs.copyFile(stagingAbsolute, entry.destinationAbsolute);
            entry.appliedSha256 = await hashFile(entry.destinationAbsolute);
            if (entry.appliedSha256 !== entry.expectedSha256) {
              fail("PKG_APPLY_HASH", `Installed hash mismatch for ${entry.destinationPath}`);
            }
            entry.status = "VERIFIED";
            await (prisma as any).pluginFileOperation.update({
              where: { transactionId_sequence: { transactionId: transaction.id, sequence: entry.sequence } },
              data: { appliedSha256: entry.appliedSha256, status: "VERIFIED" },
            });
          }
    
          await (prisma as any).pluginInstallTransaction.update({
            where: { id: transaction.id },
            data: { status: "COMMITTING", journal: journal as any },
          });
    
          await prisma.$transaction(async (tx: any) => {
            for (const declaration of parsed.manifest.files) {
              await tx.pluginFile.upsert({
                where: { owner_destinationPath: { owner: declaration.owner, destinationPath: declaration.destinationPath } },
                update: {
                  pluginId: installation.pluginId,
                  sourcePath: declaration.sourcePath,
                  sha256: declaration.sha256,
                  sizeBytes: declaration.sizeBytes,
                  installedVersion: parsed.manifest.version,
                },
                create: {
                  pluginId: installation.pluginId,
                  owner: declaration.owner,
                  destinationPath: declaration.destinationPath,
                  sourcePath: declaration.sourcePath,
                  sha256: declaration.sha256,
                  sizeBytes: declaration.sizeBytes,
                  installedVersion: parsed.manifest.version,
                },
              });
            }
    
            await tx.pluginInstallation.update({
              where: { id: installation.id },
              data: { status: "SUCCEEDED", completedAt: new Date() },
            });
            await tx.plugin.update({
              where: { id: installation.pluginId },
              data: {
                currentVersion: parsed.manifest.version,
                status: "INSTALLED",
                manifest: parsed.manifest as any,
              },
            });
            await tx.pluginInstallTransaction.update({
              where: { id: transaction.id },
              data: { status: "SUCCEEDED", journal: journal as any, completedAt: new Date() },
            });
            await tx.pluginAuditEvent.create({
              data: {
                pluginId: installation.pluginId,
                actorId,
                action: "PLUGIN_TRANSACTION_COMMITTED",
                outcome: "SUCCESS",
                reason,
                metadata: { transactionId: transaction.id, files: journal.length },
              },
            });
          });
    
          await this.log(transaction.id, "TRANSACTION_COMMITTED", "Installation transaction committed", { files: journal.length });
          return this.get(transaction.id);
    } catch (error: any) {
      await this.rollbackInternal(transaction.id, journal, actorId, reason, error);
      throw error;
    }
  }

  async recoverTransaction(
    transactionId: string,
    actorId: string,
    reasonValue: unknown,
  ) {
    const reason = requireReason(reasonValue);
    const transaction = await (prisma as any).pluginInstallTransaction.findUnique({
      where: { id: transactionId },
      include: {
        installation: {
          include: { plugin: true, pluginVersion: true },
        },
      },
    });

    if (!transaction) fail("PKG_TX_NOT_FOUND", "Transaction not found", 404);

    if (isTerminalTransactionStatus(transaction.status)) {
      return this.get(transaction.id);
    }

    const transactionDir = path.dirname(transaction.stagingPath);
    const archivePath = path.join(transactionDir, "package.base64");
    const archiveExists = await exists(archivePath);

    await prisma.$transaction(async (tx: any) => {
      await tx.pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorCode: archiveExists
            ? "PKG_TX_RECOVERED"
            : "PKG_MIGRATION_REUPLOAD_REQUIRED",
          errorMessage: archiveExists
            ? "Transaction was safely closed by recovery. Recreate the installation plan to retry."
            : "Legacy transaction archive is unavailable. Re-upload the same package after recovery.",
        },
      });

      await tx.pluginInstallation.update({
        where: { id: transaction.installationId },
        data: {
          status: "PLANNED",
          approvedBy: null,
          startedAt: null,
          completedAt: null,
          errorCode: null,
          errorMessage: null,
        },
      });

      await tx.pluginAuditEvent.create({
        data: {
          pluginId: transaction.pluginId,
          actorId,
          action: "PLUGIN_TRANSACTION_RECOVERED",
          outcome: "SUCCESS",
          reason,
          metadata: {
            transactionId,
            archiveExists,
            previousStatus: transaction.status,
            rollbackDisposition: "NOT_REQUIRED",
          },
        },
      });
    });

    await this.log(
      transaction.id,
      "TRANSACTION_RECOVERED",
      archiveExists
        ? "Transaction lock released. A new installation plan may now be created."
        : "Legacy transaction lock released. Re-upload the same package to continue.",
      { previousStatus: transaction.status, archiveExists },
      "WARN",
    );

    return this.get(transaction.id);
  }

  async cancelTransaction(
    transactionId: string,
    actorId: string,
    reasonValue: unknown,
  ) {
    const reason = requireReason(reasonValue);
    const transaction = await (prisma as any).pluginInstallTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) fail("PKG_TX_NOT_FOUND", "Transaction not found", 404);
    if (isTerminalTransactionStatus(transaction.status)) {
      return this.get(transaction.id);
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.pluginInstallTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "CANCELLED",
          completedAt: new Date(),
          errorCode: "PKG_TX_CANCELLED",
          errorMessage: reason,
        },
      });

      await tx.pluginInstallation.update({
        where: { id: transaction.installationId },
        data: {
          status: "PLANNED",
          approvedBy: null,
          startedAt: null,
          completedAt: null,
          errorCode: null,
          errorMessage: null,
        },
      });

      await tx.pluginAuditEvent.create({
        data: {
          pluginId: transaction.pluginId,
          actorId,
          action: "PLUGIN_TRANSACTION_CANCELLED",
          outcome: "SUCCESS",
          reason,
          metadata: { transactionId, previousStatus: transaction.status },
        },
      });
    });

    await this.log(
      transaction.id,
      "TRANSACTION_CANCELLED",
      "Transaction cancelled and package lock released",
      { previousStatus: transaction.status },
      "WARN",
    );

    return this.get(transaction.id);
  }

  async releasePackageLock(
    packageSha256: string,
    actorId: string,
    reasonValue: unknown,
  ) {
    const reason = requireReason(reasonValue);
    const safeHash = String(packageSha256 || "").trim().toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(safeHash)) {
      fail("PKG_HASH_INVALID", "A valid SHA-256 package hash is required");
    }

    const transactions = await (prisma as any).pluginInstallTransaction.findMany({
      where: {
        packageSha256: safeHash,
        status: { in: [...ACTIVE_TRANSACTION_STATUSES] },
      },
      orderBy: { createdAt: "desc" },
    });

    const recovered: string[] = [];
    for (const transaction of transactions) {
      await this.recoverTransaction(transaction.id, actorId, reason);
      recovered.push(transaction.id);
    }

    return {
      packageSha256: safeHash,
      recoveredTransactionIds: recovered,
      released: recovered.length > 0,
    };
  }


}

export const pluginTransactionService = new PluginTransactionService();
