import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { describe, expect, it } from "@jest/globals";

const PROJECT_ROOT = path.resolve(__dirname, "..");

function exists(filePath) {
  return fs.existsSync(filePath);
}

function findTsc() {
  const localTsc = path.join(PROJECT_ROOT, "node_modules", ".bin", "tsc");
  if (exists(localTsc)) return localTsc;

  const which = spawnSync("which", ["tsc"], { encoding: "utf8" });
  if (which.status === 0) return (which.stdout || "").trim() || null;

  return null;
}

describe("TypeScript types are present and consumable", () => {
  it("package.json points to existing .d.ts files for exports", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8")
    );

    expect(exists(path.join(PROJECT_ROOT, pkg.types))).toBe(true);

    const rootTypes = pkg.exports?.["."]?.types;
    const hooksTypes = pkg.exports?.["./hooks"]?.types;

    expect(typeof rootTypes).toBe("string");
    expect(typeof hooksTypes).toBe("string");

    expect(exists(path.join(PROJECT_ROOT, rootTypes))).toBe(true);
    expect(exists(path.join(PROJECT_ROOT, hooksTypes))).toBe(true);
  });

  it("types/hooks/index.d.ts exports the hook APIs", () => {
    const dtsPath = path.join(PROJECT_ROOT, "types", "hooks", "index.d.ts");
    expect(exists(dtsPath)).toBe(true);

    const text = fs.readFileSync(dtsPath, "utf8");
    expect(text).toContain("export function useHCaptcha");
    expect(text).toContain("export function HCaptchaProvider");
  });

  it("can typecheck a minimal TS consumer project (if tsc is available)", () => {
    const tsc = findTsc();
    if (!tsc) {
      return;
    }

    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "react-hcaptcha-ts-"));
    const srcDir = path.join(tmpRoot, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(tmpRoot, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            target: "ES2020",
            module: "ESNext",
            moduleResolution: "NodeNext",
            strict: true,
            noEmit: true,
            jsx: "react-jsx",
            types: [],
            skipLibCheck: true,
          },
          include: ["src/**/*.ts"],
        },
        null,
        2
      ),
      "utf8"
    );

    fs.writeFileSync(
      path.join(srcDir, "index.ts"),
      [
        'import HCaptcha from "@hcaptcha/react-hcaptcha";',
        'import { HCaptchaProvider, useHCaptcha } from "@hcaptcha/react-hcaptcha/hooks";',
        "",
        "void HCaptcha;",
        "void HCaptchaProvider;",
        "void useHCaptcha;",
      ].join("\n"),
      "utf8"
    );

    const result = spawnSync(tsc, ["-p", tmpRoot], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
  });
});

