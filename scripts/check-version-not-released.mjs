#!/usr/bin/env node
/**
 * CI version guard: fail if package.json version is already published on npm.
 *
 * In local dev, this script exits successfully without checking.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const inCi = process.env.GITHUB_ACTIONS === "true";

if (!inCi) {
  console.log("Version guard: not running in GitHub Actions, skipping.");
  process.exit(0);
}

const pkgPath = join(root, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
const packageName = pkg.name || "ai-rate-queue";
const current = String(pkg.version);

async function getPublishedVersion() {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.version ? String(data.version) : null;
  } catch {
    return null;
  }
}

const published = await getPublishedVersion();

if (!published) {
  console.log(
    `Version guard OK: no published version on npm yet. Current version is ${current}.`,
  );
  process.exit(0);
}

if (current === published) {
  console.error(
    [
      `Version guard: current version ${current} is already published to npm.`,
      "Bump the version before merging to main, e.g.:",
      " npm run version:patch",
      " npm run version:minor",
      " npm run version:major",
      "then commit, push, and merge.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `Version guard OK: current version ${current} differs from published ${published}.`,
);

