#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "article-image-manifest.json");
const targetDir = path.join(projectRoot, "public", "articles");

async function loadManifest() {
  const raw = await fs.readFile(manifestPath, "utf8");
  return JSON.parse(raw);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function tryCurl(url, outputPath) {
  const args = [
    "-fL",
    "--retry", "3",
    "--retry-delay", "1",
    "--connect-timeout", "20",
    "--max-time", "120",
    "--http1.1",
    "-k",
    "-A",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
    "-e",
    "https://almu3dl.com/",
    "-o",
    outputPath,
    url,
  ];

  execFileSync("curl", args, { stdio: "ignore" });
}

function buildFallbackUrls(sourceUrl) {
  const urls = [sourceUrl];

  if (sourceUrl.startsWith("https://")) {
    urls.push(sourceUrl.replace(/^https:\/\//, "http://"));
  }

  return [...new Set(urls)];
}

async function downloadOne(item) {
  const filePath = path.join(targetDir, item.fileName);

  if (await fileExists(filePath)) {
    return { status: "skipped", file: item.fileName };
  }

  const candidateUrls = buildFallbackUrls(item.sourceUrl);
  let lastError = null;

  for (const url of candidateUrls) {
    try {
      tryCurl(url, filePath);
      return { status: "downloaded", file: item.fileName, url };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Failed to download ${item.sourceUrl}`);
}

async function main() {
  await ensureDir(targetDir);
  const manifest = await loadManifest();

  let downloaded = 0;
  let skipped = 0;
  const failed = [];

  for (const item of manifest) {
    try {
      const result = await downloadOne(item);
      if (result.status === "downloaded") downloaded += 1;
      if (result.status === "skipped") skipped += 1;
      console.log(`[${result.status.toUpperCase()}] ${result.file}`);
    } catch (error) {
      failed.push({
        file: item.fileName,
        sourceUrl: item.sourceUrl,
        error: String(error),
      });
      console.error(`[FAILED] ${item.fileName} -> ${item.sourceUrl}`);
      console.error(String(error));
    }
  }

  console.log("");
  console.log(
    `Done. Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed.length}`
  );

  if (failed.length > 0) {
    const failedPath = path.join(projectRoot, "article-image-failures.json");
    await fs.writeFile(failedPath, JSON.stringify(failed, null, 2), "utf8");
    console.log(`Failure report saved to ${failedPath}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
