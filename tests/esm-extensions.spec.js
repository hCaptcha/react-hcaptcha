import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { afterAll, describe, expect, it } from "@jest/globals";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_ESM_DIST_DIR = path.join(PROJECT_ROOT, "dist", "esm");
let tempDirToCleanup = null;

function buildEsmToTempDir() {
  const tmpRoot = fs.mkdtempSync(
    path.join(PROJECT_ROOT, ".tmp-react-hcaptcha-esm-")
  );
  const outDir = path.join(tmpRoot, "esm");
  tempDirToCleanup = tmpRoot;

  const babelCliPath = require.resolve("@babel/cli/bin/babel.js");
  const result = spawnSync(
    process.execPath,
    [babelCliPath, "src", "-d", outDir, "--copy-files"],
    {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        BABEL_ENV: "esm",
      },
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `Failed to build ESM via Babel.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
  }

  fs.writeFileSync(
    path.join(outDir, "package.json"),
    JSON.stringify({ type: "module" }),
    "utf8"
  );

  return outDir;
}

function getEsmDistDir() {
  if (
    fs.existsSync(DEFAULT_ESM_DIST_DIR) &&
    fs.existsSync(path.join(DEFAULT_ESM_DIST_DIR, "index.js"))
  ) {
    return DEFAULT_ESM_DIST_DIR;
  }

  return buildEsmToTempDir();
}

function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function getRelativeSpecifiers(sourceText) {
  const specifiers = [];

  const patterns = [
    /\bimport\s+[^'"]*\sfrom\s+["'](\.{1,2}\/[^"']+)["']/g,
    /\bexport\s+(?:\*|\{[^}]*\})\sfrom\s+["'](\.{1,2}\/[^"']+)["']/g,
    /\bimport\s+["'](\.{1,2}\/[^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    for (const match of sourceText.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }

  return specifiers;
}

describe("ESM build emits fully-specified relative imports", () => {
  const ESM_DIST_DIR = getEsmDistDir();

  afterAll(() => {
    if (!tempDirToCleanup) return;
    try {
      fs.rmSync(tempDirToCleanup, { recursive: true, force: true });
    } finally {
      tempDirToCleanup = null;
    }
  });

  it("sets dist/esm/package.json type=module", () => {
    const packageJsonPath = path.join(ESM_DIST_DIR, "package.json");
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    expect(pkg.type).toBe("module");
  });

  it("uses .js extensions for all relative ESM specifiers", () => {
    expect(fs.existsSync(ESM_DIST_DIR)).toBe(true);

    const esmJsFiles = listFilesRecursive(ESM_DIST_DIR).filter((filePath) =>
      filePath.endsWith(".js")
    );
    expect(esmJsFiles.length).toBeGreaterThan(0);

    const offenders = [];
    for (const filePath of esmJsFiles) {
      const sourceText = fs.readFileSync(filePath, "utf8");
      const specifiers = getRelativeSpecifiers(sourceText);

      for (const specifier of specifiers) {
        if (!specifier.endsWith(".js")) {
          offenders.push({
            filePath: path.relative(PROJECT_ROOT, filePath),
            specifier,
          });
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("exports hooks with .js extensions", () => {
    const hooksIndexPath = path.join(ESM_DIST_DIR, "hooks", "index.js");
    expect(fs.existsSync(hooksIndexPath)).toBe(true);

    const sourceText = fs.readFileSync(hooksIndexPath, "utf8");
    expect(sourceText).toContain('export { useHCaptcha } from "./useHCaptcha.js";');
    expect(sourceText).toContain('export { HCaptchaProvider } from "./Provider.js";');
  });

  // Intentionally avoids executing the built output, since ESM runtime imports
  // may fail in CI if peer deps (e.g. react) are not installed.
});
