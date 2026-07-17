import { createHash, createPublicKey, verify } from "crypto";
import prisma from "../../config/prisma";
import type { MarketplaceTrustEvaluation } from "./plugin-platform.marketplace.types";

function fail(code: string, message: string, statusCode = 422): never {
  throw Object.assign(new Error(message), { code, statusCode });
}

function reasonOf(value: unknown): string {
  const reason = String(value || "").trim();
  if (reason.length < 5) fail("MARKETPLACE_REASON_REQUIRED", "A reason of at least 5 characters is required");
  return reason.slice(0, 500);
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function semverParts(value: string): number[] {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value || "");
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0,0,0];
}

function compareVersion(a: string, b: string): number {
  const left = semverParts(a);
  const right = semverParts(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

export class PluginMarketplaceService {
  async listCatalog(channel?: string) {
    return (prisma as any).pluginMarketplaceEntry.findMany({
      where: channel ? { channel } : undefined,
      orderBy: [{ pluginKey: "asc" }, { publishedAt: "desc" }],
      include: { vendor: true, repository: true, signingKey: true },
    });
  }

  async vendors() {
    return (prisma as any).pluginVendor.findMany({
      orderBy: { name: "asc" },
      include: { signingKeys: true },
    });
  }

  async repositories() {
    return (prisma as any).pluginRepository.findMany({
      orderBy: { name: "asc" },
    });
  }

  async downloads() {
    return (prisma as any).pluginDownloadHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 250,
      include: { marketplaceEntry: true, repository: true },
    });
  }

  async registerVendor(input: any, actorId: string) {
    const vendorKey = String(input.vendorKey || "").trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{2,80}$/.test(vendorKey)) {
      fail("VENDOR_KEY_INVALID", "vendorKey is invalid");
    }
    return (prisma as any).pluginVendor.upsert({
      where: { vendorKey },
      update: {
        name: String(input.name || vendorKey),
        websiteUrl: input.websiteUrl || null,
        contactEmail: input.contactEmail || null,
        status: input.status || "PENDING",
        trustLevel: input.trustLevel || "UNTRUSTED",
        approvedBy: ["TRUSTED"].includes(String(input.status)) ? actorId : null,
        approvedAt: ["TRUSTED"].includes(String(input.status)) ? new Date() : null,
      },
      create: {
        vendorKey,
        name: String(input.name || vendorKey),
        websiteUrl: input.websiteUrl || null,
        contactEmail: input.contactEmail || null,
        status: input.status || "PENDING",
        trustLevel: input.trustLevel || "UNTRUSTED",
        approvedBy: ["TRUSTED"].includes(String(input.status)) ? actorId : null,
        approvedAt: ["TRUSTED"].includes(String(input.status)) ? new Date() : null,
      },
    });
  }

  async registerSigningKey(vendorKey: string, input: any) {
    const vendor = await (prisma as any).pluginVendor.findUnique({ where: { vendorKey } });
    if (!vendor) fail("VENDOR_NOT_FOUND", "Vendor not found", 404);
    const publicKeyPem = String(input.publicKeyPem || "").trim();
    let key;
    try {
      key = createPublicKey(publicKeyPem);
    } catch {
      fail("SIGNING_KEY_INVALID", "Public key PEM is invalid");
    }
    const der = key.export({ type: "spki", format: "der" }) as Buffer;
    const fingerprint = sha256(der);
    return (prisma as any).pluginSigningKey.upsert({
      where: { vendorId_keyId: { vendorId: vendor.id, keyId: String(input.keyId || "") } },
      update: {
        algorithm: String(input.algorithm || "RSA-SHA256"),
        publicKeyPem,
        fingerprint,
        active: input.active !== false,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
      create: {
        vendorId: vendor.id,
        keyId: String(input.keyId || ""),
        algorithm: String(input.algorithm || "RSA-SHA256"),
        publicKeyPem,
        fingerprint,
        active: input.active !== false,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      },
    });
  }

  async registerRepository(input: any, actorId: string) {
    const repositoryKey = String(input.repositoryKey || "").trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{2,80}$/.test(repositoryKey)) {
      fail("REPOSITORY_KEY_INVALID", "repositoryKey is invalid");
    }
    return (prisma as any).pluginRepository.upsert({
      where: { repositoryKey },
      update: {
        name: String(input.name || repositoryKey),
        baseUrl: input.baseUrl || null,
        kind: String(input.kind || "LOCAL"),
        status: input.status || "ACTIVE",
        trusted: Boolean(input.trusted),
        allowedChannels: Array.isArray(input.allowedChannels) ? input.allowedChannels : ["STABLE"],
      },
      create: {
        repositoryKey,
        name: String(input.name || repositoryKey),
        baseUrl: input.baseUrl || null,
        kind: String(input.kind || "LOCAL"),
        status: input.status || "ACTIVE",
        trusted: Boolean(input.trusted),
        allowedChannels: Array.isArray(input.allowedChannels) ? input.allowedChannels : ["STABLE"],
        createdBy: actorId,
      },
    });
  }

  async evaluate(input: any): Promise<MarketplaceTrustEvaluation> {
    const entry = await (prisma as any).pluginMarketplaceEntry.findUnique({
      where: { id: String(input.entryId || "") },
      include: { vendor: true, repository: true, signingKey: true },
    });
    if (!entry) fail("MARKETPLACE_ENTRY_NOT_FOUND", "Marketplace entry not found", 404);

    const reasons: string[] = [];
    const repositoryTrusted = entry.repository.status === "ACTIVE" && entry.repository.trusted === true;
    const vendorTrusted = entry.vendor.status === "TRUSTED" &&
      ["VERIFIED","TRUSTED","PLATFORM"].includes(entry.vendor.trustLevel);
    const key = entry.signingKey;
    const signingKeyTrusted = Boolean(
      key && key.active && !key.revokedAt && (!key.expiresAt || key.expiresAt > new Date())
    );

    const packageBuffer = input.packageBase64
      ? Buffer.from(String(input.packageBase64), "base64")
      : null;
    const calculatedHash = packageBuffer ? sha256(packageBuffer) : entry.packageSha256;
    const packageHashValid = calculatedHash === entry.packageSha256;

    let signatureValid = false;
    if (
      signingKeyTrusted &&
      entry.signatureBase64 &&
      entry.signedDigest &&
      entry.signatureAlgorithm
    ) {
      try {
        const signed = Buffer.from(entry.signedDigest, "utf8");
        signatureValid = verify(
          entry.signatureAlgorithm,
          signed,
          key.publicKeyPem,
          Buffer.from(entry.signatureBase64, "base64")
        );
        if (entry.signedDigest !== entry.packageSha256) signatureValid = false;
      } catch {
        signatureValid = false;
      }
    }

    const platformVersion = String(process.env.PLATFORM_VERSION || "1.0.0");
    const compatible =
      compareVersion(platformVersion, entry.minimumPlatformVersion) >= 0 &&
      compareVersion(platformVersion, entry.maximumPlatformVersion) <= 0;

    if (!repositoryTrusted) reasons.push("Repository is not trusted or active.");
    if (!vendorTrusted) reasons.push("Vendor trust policy is not satisfied.");
    if (!signingKeyTrusted) reasons.push("Signing key is unavailable, expired or revoked.");
    if (!packageHashValid) reasons.push("Package SHA-256 does not match.");
    if (!signatureValid) reasons.push("Package signature verification failed.");
    if (!compatible) reasons.push(`Package is incompatible with platform ${platformVersion}.`);
    if (entry.revokedAt || entry.vendor.status === "REVOKED" || entry.repository.status === "REVOKED") {
      reasons.push("Package, vendor or repository has been revoked.");
    }

    let decision: MarketplaceTrustEvaluation["decision"] = "TRUSTED";
    if (entry.revokedAt || entry.vendor.status === "REVOKED" || entry.repository.status === "REVOKED") {
      decision = "REVOKED";
    } else if (!compatible) {
      decision = "INCOMPATIBLE";
    } else if (!repositoryTrusted || !vendorTrusted || !signingKeyTrusted || !signatureValid || !packageHashValid) {
      decision = "UNTRUSTED";
    } else if (entry.channel !== "STABLE" && entry.channel !== "LTS") {
      decision = "TRUSTED_WITH_WARNING";
      reasons.push(`Release channel ${entry.channel} requires explicit review.`);
    }

    await (prisma as any).pluginMarketplaceEntry.update({
      where: { id: entry.id },
      data: { trustDecision: decision, trustReasons: reasons },
    });

    return {
      decision,
      installAllowed: decision === "TRUSTED" || decision === "TRUSTED_WITH_WARNING",
      signatureValid,
      packageHashValid,
      repositoryTrusted,
      vendorTrusted,
      signingKeyTrusted,
      compatible,
      reasons,
    };
  }

  async publish(input: any) {
    const vendor = await (prisma as any).pluginVendor.findUnique({
      where: { vendorKey: String(input.vendorKey || "") },
    });
    const repository = await (prisma as any).pluginRepository.findUnique({
      where: { repositoryKey: String(input.repositoryKey || "") },
    });
    if (!vendor || !repository) fail("MARKETPLACE_OWNER_MISSING", "Vendor or repository not found", 404);
    const signingKey = input.keyId
      ? await (prisma as any).pluginSigningKey.findUnique({
          where: { vendorId_keyId: { vendorId: vendor.id, keyId: String(input.keyId) } },
        })
      : null;

    const manifest = input.manifest || {};
    return (prisma as any).pluginMarketplaceEntry.upsert({
      where: {
        repositoryId_pluginKey_version_channel: {
          repositoryId: repository.id,
          pluginKey: String(input.pluginKey),
          version: String(input.version),
          channel: String(input.channel || "STABLE"),
        },
      },
      update: {
        name: String(input.name || input.pluginKey),
        description: input.description || null,
        minimumPlatformVersion: String(input.minimumPlatformVersion || "1.0.0"),
        maximumPlatformVersion: String(input.maximumPlatformVersion || "999.999.999"),
        packageSha256: String(input.packageSha256 || ""),
        packageSizeBytes: Number(input.packageSizeBytes || 0),
        signatureAlgorithm: input.signatureAlgorithm || null,
        signatureBase64: input.signatureBase64 || null,
        signedDigest: input.signedDigest || null,
        manifest,
        changelog: input.changelog || null,
        packageLocation: input.packageLocation || null,
        signingKeyId: signingKey?.id || null,
        publishedAt: new Date(),
      },
      create: {
        vendorId: vendor.id,
        repositoryId: repository.id,
        signingKeyId: signingKey?.id || null,
        pluginKey: String(input.pluginKey),
        name: String(input.name || input.pluginKey),
        version: String(input.version),
        channel: String(input.channel || "STABLE"),
        description: input.description || null,
        minimumPlatformVersion: String(input.minimumPlatformVersion || "1.0.0"),
        maximumPlatformVersion: String(input.maximumPlatformVersion || "999.999.999"),
        packageSha256: String(input.packageSha256 || ""),
        packageSizeBytes: Number(input.packageSizeBytes || 0),
        signatureAlgorithm: input.signatureAlgorithm || null,
        signatureBase64: input.signatureBase64 || null,
        signedDigest: input.signedDigest || null,
        manifest,
        changelog: input.changelog || null,
        packageLocation: input.packageLocation || null,
        publishedAt: new Date(),
      },
    });
  }

  async authorizeDownload(entryId: string, actorId: string, reasonValue: unknown) {
    const reason = reasonOf(reasonValue);
    const evaluation = await this.evaluate({ entryId });
    const entry = await (prisma as any).pluginMarketplaceEntry.findUnique({
      where: { id: entryId },
      include: { repository: true },
    });
    if (!entry) fail("MARKETPLACE_ENTRY_NOT_FOUND", "Marketplace entry not found", 404);

    await (prisma as any).pluginDownloadHistory.create({
      data: {
        marketplaceEntryId: entry.id,
        repositoryId: entry.repositoryId,
        actorId,
        purpose: reason,
        outcome: evaluation.installAllowed ? "AUTHORIZED" : "BLOCKED",
        packageSha256: entry.packageSha256,
        trustDecision: evaluation.decision,
        metadata: { packageLocation: entry.packageLocation },
      },
    });

    if (!evaluation.installAllowed) {
      fail("MARKETPLACE_DOWNLOAD_BLOCKED", evaluation.reasons.join(" "));
    }

    return {
      entryId: entry.id,
      packageLocation: entry.packageLocation,
      packageSha256: entry.packageSha256,
      trustDecision: evaluation.decision,
      installationRequired: true,
      automaticInstallation: false,
    };
  }
}

export const pluginMarketplaceService = new PluginMarketplaceService();
