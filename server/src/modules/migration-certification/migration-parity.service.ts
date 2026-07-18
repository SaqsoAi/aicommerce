import sharp from "sharp";

type SnapshotNode = { selector: string; rect?: Record<string, number>; styles?: Record<string, string>; text?: string };

function decodeImage(value: unknown): Buffer {
  const input = String(value ?? "");
  const payload = input.includes(",") ? input.slice(input.indexOf(",") + 1) : input;
  const buffer = Buffer.from(payload, "base64");
  if (!buffer.length || buffer.length > 20 * 1024 * 1024) throw new Error("A base64 screenshot up to 20MB is required");
  return buffer;
}

export async function compareScreenshots(source: unknown, target: unknown) {
  const left = sharp(decodeImage(source)).removeAlpha().raw();
  const metadata = await left.metadata();
  if (!metadata.width || !metadata.height) throw new Error("Source screenshot dimensions are invalid");
  const [a, b] = await Promise.all([
    left.toBuffer(),
    sharp(decodeImage(target)).resize(metadata.width, metadata.height, { fit: "fill" }).removeAlpha().raw().toBuffer(),
  ]);
  if (a.length !== b.length) throw new Error("Screenshot channel layout mismatch");
  let delta = 0;
  let changed = 0;
  for (let i = 0; i < a.length; i += 3) {
    const pixelDelta = (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])) / 765;
    delta += pixelDelta;
    if (pixelDelta > 0.04) changed += 1;
  }
  const pixels = a.length / 3;
  const difference = delta / pixels;
  return { width: metadata.width, height: metadata.height, pixelDifference: Number(difference.toFixed(6)), changedPixelRatio: Number((changed / pixels).toFixed(6)), score: Number(((1 - difference) * 100).toFixed(3)), pass: difference <= 0.01 };
}

export function compareDomSnapshots(source: SnapshotNode[], target: SnapshotNode[]) {
  const right = new Map(target.map((node) => [node.selector, node]));
  const missing: string[] = [];
  const geometry: Array<{ selector: string; field: string; source: number; target: number }> = [];
  const styles: Array<{ selector: string; property: string; source: string; target: string }> = [];
  for (const node of source) {
    const match = right.get(node.selector);
    if (!match) { missing.push(node.selector); continue; }
    for (const [field, value] of Object.entries(node.rect ?? {})) {
      const actual = Number(match.rect?.[field] ?? 0);
      if (Math.abs(value - actual) > 1) geometry.push({ selector: node.selector, field, source: value, target: actual });
    }
    for (const [property, value] of Object.entries(node.styles ?? {})) {
      const actual = String(match.styles?.[property] ?? "");
      if (value !== actual) styles.push({ selector: node.selector, property, source: value, target: actual });
    }
  }
  const unexpected = target.filter((node) => !source.some((item) => item.selector === node.selector)).map((node) => node.selector);
  const total = Math.max(1, source.length + Object.values(source).length);
  const defects = missing.length + unexpected.length + geometry.length + styles.length;
  return { missing, unexpected, geometry, computedStyle: styles, score: Number((Math.max(0, 1 - defects / total) * 100).toFixed(3)), pass: defects === 0 };
}

export function mapLaravelSource(input: { blade?: string; routes?: string; controller?: string; model?: string }) {
  const blade = String(input.blade ?? "");
  const routes = String(input.routes ?? "");
  const controller = String(input.controller ?? "");
  const props = [...blade.matchAll(/\{\{\s*\$([A-Za-z_]\w*)/g)].map((match) => match[1]);
  const routeMap = [...routes.matchAll(/Route::(get|post|put|patch|delete)\(['"]([^'"]+)['"]\s*,\s*\[([^\]]+)\]/gi)].map((match) => ({ method: match[1].toUpperCase(), path: match[2], handler: match[3].replace(/::class/g, "").replace(/['"\s]/g, "") }));
  const actions = [...controller.matchAll(/public\s+function\s+(\w+)\s*\(([^)]*)\)/g)].map((match) => ({ name: match[1], parameters: match[2].split(",").map((value) => value.trim()).filter(Boolean) }));
  const fills = [...String(input.model ?? "").matchAll(/['"]([A-Za-z_]\w*)['"]/g)].map((match) => match[1]);
  const jsx = blade
    .replace(/@extends\([^)]*\)|@section\([^)]*\)|@endsection|@csrf/g, "")
    .replace(/\{\{\s*\$([A-Za-z_]\w*)\s*\}\}/g, "{$1}")
    .replace(/class=/g, "className=");
  return { framework: "LARAVEL", props: [...new Set(props)], routes: routeMap, controllerActions: actions, modelFields: [...new Set(fills)], tsxFoundation: `export default function MigratedPage(props: Record<string, unknown>) {\n  const { ${[...new Set(props)].join(", ")} } = props as any;\n  return (<>${jsx}</>);\n}`, requiresHumanReview: true, policy: "Reuse existing Express/Prisma APIs; database proposals must be delivered through PS1." };
}
