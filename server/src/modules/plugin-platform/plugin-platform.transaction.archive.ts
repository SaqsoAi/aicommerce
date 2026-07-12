import { createHash } from "crypto";
import { inflateRawSync } from "zlib";
import type { ParsedPluginPackage } from "./plugin-platform.transaction.types";
import type { PluginManifest } from "./plugin-platform.types";
import { safeRelativePath, validateArchiveEntries, validateManifest } from "./plugin-platform.validation";

const MANIFEST_PATH = "plugin.manifest.json";
const CHECKSUM_PATH = "checksums.sha256";

function failure(code: string, message: string): never {
  throw Object.assign(new Error(message), { statusCode: 422, code });
}

function parseChecksums(raw: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = /^([a-f0-9]{64}) {2}(.+)$/.exec(trimmed);
    if (!match) failure("PKG_HASH_INDEX", `Invalid checksum line: ${trimmed.slice(0, 120)}`);
    const path = match[2].replace(/\\/g, "/");
    if (!safeRelativePath(path)) failure("PKG_ARCHIVE_PATH", `Unsafe checksum path: ${path}`);
    if (result.has(path.toLowerCase())) failure("PKG_HASH_DUPLICATE", `Duplicate checksum path: ${path}`);
    result.set(path.toLowerCase(), match[1]);
  }
  return result;
}

function extractEntry(buffer: Buffer, localOffset: number, compressedSize: number, compressionMethod: number): Buffer {
  if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
    failure("PKG_ARCHIVE_LOCAL_HEADER", "Invalid ZIP local file header");
  }
  const nameLength = buffer.readUInt16LE(localOffset + 26);
  const extraLength = buffer.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const dataEnd = dataStart + compressedSize;
  if (dataStart < 0 || dataEnd > buffer.length) failure("PKG_ARCHIVE_BOUNDS", "ZIP entry exceeds archive bounds");
  const compressed = buffer.subarray(dataStart, dataEnd);
  if (compressionMethod === 0) return Buffer.from(compressed);
  if (compressionMethod === 8) return inflateRawSync(compressed);
  failure("PKG_ARCHIVE_COMPRESSION", `Unsupported ZIP compression method ${compressionMethod}`);
}

export function parsePluginPackage(encoded: string): ParsedPluginPackage {
  const archive = Buffer.from(encoded, "base64");
  if (!archive.length) failure("PKG_ARCHIVE_EMPTY", "Plugin archive is empty");
  if (archive.length > 104_857_600) failure("PKG_ARCHIVE_SIZE", "Archive exceeds 100 MiB");

  const eocdMin = Math.max(0, archive.length - 65_557);
  let eocd = -1;
  for (let offset = archive.length - 22; offset >= eocdMin; offset -= 1) {
    if (archive.readUInt32LE(offset) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) failure("PKG_ARCHIVE_EOCD", "ZIP end-of-central-directory record not found");

  const entryCount = archive.readUInt16LE(eocd + 10);
  const centralOffset = archive.readUInt32LE(eocd + 16);
  const entries: Array<{
    path: string;
    compressedSize: number;
    uncompressedSize: number;
    externalAttributes: number;
    localHeaderOffset: number;
    compressionMethod: number;
  }> = [];

  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > archive.length || archive.readUInt32LE(cursor) !== 0x02014b50) {
      failure("PKG_ARCHIVE_CENTRAL_DIRECTORY", "Invalid ZIP central-directory entry");
    }
    const compressionMethod = archive.readUInt16LE(cursor + 10);
    const compressedSize = archive.readUInt32LE(cursor + 20);
    const uncompressedSize = archive.readUInt32LE(cursor + 24);
    const nameLength = archive.readUInt16LE(cursor + 28);
    const extraLength = archive.readUInt16LE(cursor + 30);
    const commentLength = archive.readUInt16LE(cursor + 32);
    const externalAttributes = archive.readUInt32LE(cursor + 38);
    const localHeaderOffset = archive.readUInt32LE(cursor + 42);
    const next = cursor + 46 + nameLength + extraLength + commentLength;
    if (next > archive.length) failure("PKG_ARCHIVE_BOUNDS", "ZIP central directory exceeds archive bounds");
    const entryPath = archive.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    entries.push({
      path: entryPath,
      compressedSize,
      uncompressedSize,
      externalAttributes,
      localHeaderOffset,
      compressionMethod,
    });
    cursor = next;
  }

  const entryIssues = validateArchiveEntries(entries);
  if (entryIssues.length) {
    const issue = entryIssues[0];
    failure(issue.code, issue.message);
  }

  const files = new Map<string, Buffer>();
  for (const entry of entries) {
    const normalized = String(entry.path).replace(/\\/g, "/");
    if (normalized.endsWith("/")) continue;
    const content = extractEntry(
      archive,
      Number(entry.localHeaderOffset),
      Number(entry.compressedSize),
      Number(entry.compressionMethod)
    );
    if (content.length !== Number(entry.uncompressedSize)) {
      failure("PKG_ARCHIVE_SIZE_MISMATCH", `Expanded size mismatch for ${normalized}`);
    }
    files.set(normalized.toLowerCase(), content);
  }

  const manifestBuffer = files.get(MANIFEST_PATH);
  const checksumBuffer = files.get(CHECKSUM_PATH);
  if (!manifestBuffer) failure("PKG_MANIFEST_MISSING", `${MANIFEST_PATH} is required`);
  if (!checksumBuffer) failure("PKG_HASH_INDEX_MISSING", `${CHECKSUM_PATH} is required`);

  let rawManifest: unknown;
  try {
    rawManifest = JSON.parse(manifestBuffer.toString("utf8"));
  } catch {
    failure("PKG_MANIFEST_JSON", "plugin.manifest.json is invalid JSON");
  }

  const checked = validateManifest(rawManifest);
  if (!checked.manifest || checked.issues.length) {
    const issue = checked.issues[0];
    failure(issue?.code || "PKG_MANIFEST_INVALID", issue?.message || "Manifest validation failed");
  }

  const manifest = checked.manifest as PluginManifest;
  const checksums = parseChecksums(checksumBuffer.toString("utf8"));

  for (const declaration of manifest.files) {
    const source = declaration.sourcePath.toLowerCase();
    const content = files.get(source);
    if (!content) failure("PKG_FILE_MISSING", `Declared file is missing: ${declaration.sourcePath}`);
    const digest = createHash("sha256").update(content).digest("hex");
    if (digest !== declaration.sha256) failure("PKG_HASH_MISMATCH", `Manifest hash mismatch: ${declaration.sourcePath}`);
    if (content.length !== declaration.sizeBytes) failure("PKG_FILE_SIZE", `Manifest size mismatch: ${declaration.sourcePath}`);
    const indexed = checksums.get(source);
    if (!indexed || indexed !== digest) failure("PKG_HASH_INDEX_MISMATCH", `Checksum index mismatch: ${declaration.sourcePath}`);
  }

  for (const [path] of files) {
    if (path === CHECKSUM_PATH) continue;
    if (!checksums.has(path)) failure("PKG_FILE_UNDECLARED_HASH", `Archive file is absent from checksum index: ${path}`);
  }

  return {
    manifest,
    checksums,
    files,
    packageSha256: createHash("sha256").update(archive).digest("hex"),
  };
}
