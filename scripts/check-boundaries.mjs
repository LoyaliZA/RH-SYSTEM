import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(root, "src");
const banned = [
  /better-sqlite3/,
  /rusqlite/,
  /sql\.js/,
  /from ["']sqlite["']/,
  /require\(["']sqlite["']\)/,
];

const files = await collect(sourceRoot);
const violations = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  for (const pattern of banned) {
    if (pattern.test(text)) {
      violations.push(`${path.relative(root, file)} matches ${pattern}`);
    }
  }
}

if (violations.length > 0) {
  console.error("React must not open SQLite:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} frontend files for SQLite access.`);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(fullPath)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}
