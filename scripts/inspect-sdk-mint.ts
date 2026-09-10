import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const pkgPath = resolve("node_modules/@somnia-chain/markets-sdk/dist/index.js");
  const content = readFileSync(pkgPath, "utf-8");
  // Search for mintSet implementation
  const idx = content.indexOf("mintSet");
  console.log("mintSet snippet:");
  console.log(content.slice(Math.max(0, idx - 100), idx + 400));
} catch (e: any) {
  console.error(e.message);
}
