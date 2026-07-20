#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [sourceUrl, migratedUrl, output = "./migration-visual-output"] =
  process.argv.slice(2);

if (!sourceUrl || !migratedUrl) {
  console.error("Usage: node capture.mjs <sourceUrl> <migratedUrl> [output]");
  process.exit(2);
}

const viewports = [
  [320, 900], [360, 900], [390, 900], [414, 900],
  [768, 1024], [1024, 900], [1366, 900], [1440, 1000], [1920, 1080],
];

const chrome =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9400 + Math.floor(Math.random() * 300);
const child = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${path.resolve(output, ".profile")}`,
], { stdio: "ignore" });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ws(url) {
  return await new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => resolve(socket));
    socket.addEventListener("error", reject);
  });
}

async function browserEndpoint() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return (await response.json()).webSocketDebuggerUrl;
    } catch {}
    await wait(250);
  }
  throw new Error("Chrome DevTools endpoint unavailable.");
}

async function capture(browserUrl, url, label, width, height) {
  const socket = await ws(browserUrl);
  let requestId = 0;
  const pending = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      const done = pending.get(message.id);
      pending.delete(message.id);
      done(message);
    }
  });

  function call(method, params = {}, sessionId) {
    const id = ++requestId;
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => {
      pending.set(id, (message) =>
        message.error ? reject(new Error(message.error.message)) : resolve(message.result || {}),
      );
    });
  }

  const target = await call("Target.createTarget", { url: "about:blank" });
  const attached = await call("Target.attachToTarget", {
    targetId: target.targetId,
    flatten: true,
  });
  const sessionId = attached.sessionId;
  await call("Page.enable", {}, sessionId);
  await call("Runtime.enable", {}, sessionId);
  await call("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width <= 768,
  }, sessionId);
  await call("Page.navigate", { url }, sessionId);
  await wait(2500);

  const expression = `(() => {
    const keys = [
      "display","position","visibility","opacity","color","backgroundColor",
      "fontFamily","fontSize","fontWeight","lineHeight","letterSpacing",
      "marginTop","marginRight","marginBottom","marginLeft",
      "paddingTop","paddingRight","paddingBottom","paddingLeft",
      "borderRadius","width","height","maxWidth","minWidth","overflow",
      "gridTemplateColumns","gap","alignItems","justifyContent","transform","boxShadow"
    ];
    const nodes = Array.from(document.querySelectorAll("body *"))
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return rect.width > 0 && rect.height > 0 &&
          style.display !== "none" && style.visibility !== "hidden";
      })
      .slice(0, 5000)
      .map((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          index,
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: typeof el.className === "string" ? el.className : "",
          text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 180),
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          styles: Object.fromEntries(keys.map((key) => [key, style[key]])),
        };
      });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
      },
      nodes,
    };
  })()`;

  const snapshot = await call("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  }, sessionId);
  const screenshot = await call("Page.captureScreenshot", {
    format: "png", captureBeyondViewport: true, fromSurface: true,
  }, sessionId);

  await mkdir(output, { recursive: true });
  const prefix = path.join(output, `${label}-${width}x${height}`);
  await writeFile(`${prefix}.json`, JSON.stringify(snapshot.result.value, null, 2));
  await writeFile(`${prefix}.png`, Buffer.from(screenshot.data, "base64"));

  await call("Target.closeTarget", { targetId: target.targetId });
  socket.close();
}

try {
  const endpoint = await browserEndpoint();
  for (const [width, height] of viewports) {
    await capture(endpoint, sourceUrl, "source", width, height);
    await capture(endpoint, migratedUrl, "migrated", width, height);
  }
} finally {
  child.kill();
}
