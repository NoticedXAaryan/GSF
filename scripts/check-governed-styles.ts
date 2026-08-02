import path from "node:path";

import { scanLandingAuthSources } from "../lib/landing/style-governance-node";

async function main() {
  const projectRoot = process.cwd();
  const violations = await scanLandingAuthSources(projectRoot);

  if (violations.length === 0) {
    console.log("Governed style check passed.");
    return;
  }

  for (const violation of violations) {
    const file = path.relative(projectRoot, violation.file);
    console.error(
      `${file}:${violation.line}:${violation.column} ` +
        `[${violation.category}] ${violation.message}`,
    );
  }

  console.error(`Found ${violations.length} governed style violation(s).`);
  process.exitCode = 1;
}

void main();
