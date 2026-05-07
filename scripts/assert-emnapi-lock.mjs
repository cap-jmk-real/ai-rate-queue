import fs from "node:fs";

const lockPath = new URL("../package-lock.json", import.meta.url);
const pkgPath = new URL("../package.json", import.meta.url);

const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const coreVersion = "1.10.0";
const runtimeVersion = "1.10.0";

const lockPackages = lock?.packages ?? {};
const root = lockPackages[""] ?? {};
const rootDevDeps = root.devDependencies ?? {};
const pkgDevDeps = pkg.devDependencies ?? {};

const hasCoreNode = Boolean(lockPackages["node_modules/@emnapi/core"]);
const hasRuntimeNode = Boolean(lockPackages["node_modules/@emnapi/runtime"]);
const hasRootCore = rootDevDeps["@emnapi/core"] === coreVersion;
const hasRootRuntime = rootDevDeps["@emnapi/runtime"] === runtimeVersion;
const hasPkgCore = pkgDevDeps["@emnapi/core"] === coreVersion;
const hasPkgRuntime = pkgDevDeps["@emnapi/runtime"] === runtimeVersion;

if (
  !hasCoreNode ||
  !hasRuntimeNode ||
  !hasRootCore ||
  !hasRootRuntime ||
  !hasPkgCore ||
  !hasPkgRuntime
) {
  console.error(
    [
      "Lockfile guard failed: @emnapi/core and @emnapi/runtime must be pinned to 1.10.0",
      "in both package.json and package-lock.json.",
      "Run `npm install` at repo root and commit package.json/package-lock.json.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Lockfile guard passed: emnapi entries are stable.");

