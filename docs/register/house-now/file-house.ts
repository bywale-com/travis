/**
 * Labor: PUT house-now files into travis.os_node.
 * Not migrate. Not a second store.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { writeOsAsTravis } from "../../../src/server/os-house";

const ROOT = new URL(".", import.meta.url).pathname.replace(/\/$/, "");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "file-house.ts") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

async function main() {
  const files = [
    ...walk(join(ROOT, "protocols")),
    ...walk(join(ROOT, "templates")),
  ];
  for (const full of files) {
    const rel = relative(ROOT, full).split("/").join("/");
    const path = `/${rel}`;
    const body = readFileSync(full, "utf8");
    await writeOsAsTravis(path, body);
    console.log("filed", path);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
