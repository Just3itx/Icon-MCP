import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.resolve(root, "dist");

const assets = ["explorer"];

for (const asset of assets) {
  const src = path.resolve(root, asset);
  const dest = path.resolve(distDir, asset);

  if (!fs.existsSync(src)) continue;

  fs.cpSync(src, dest, { recursive: true });
}
