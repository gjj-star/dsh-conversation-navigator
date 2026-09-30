// 宿主导出契约检查：确认 lib/client.js 从 DSH 宿主包里取用的导出，在给定版本里仍然存在。
//
// 背景：DSH 0.1.7 起把图标导出从「尺寸后缀」(IconXxxOutline16) 静默改成「字重后缀」
// (IconXxxOutlineRegular / Medium)，旧名直接移除——插件解构出 undefined 后交给 React
// 渲染会抛 minified error #130，且安装阶段毫无提示。本脚本把这类"静默移除"变成 CI 可见的失败。
//
// 用法：
//   node scripts/check-host-exports.mjs <宿主包目录> [更多宿主包目录...]
//   宿主包目录 = 解包后的 npm tarball 目录（内含 package.json 与 lib/index.js）
//
// 说明：宿主包是 ESM 且 import 了 *.module.css，Node 无法直接 import，
// 因此这里只静态解析其 lib/index.js 的 re-export 清单（export { ... }）。
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BUNDLE = new URL("../lib/client.js", import.meta.url);
const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error("用法: node scripts/check-host-exports.mjs <宿主包目录> [...]");
  process.exit(2);
}

/* ---------- 1) 从插件 bundle 里提取"用到了宿主包的哪些导出" ---------- */
const src = readFileSync(BUNDLE, "utf8");
/** @type {Map<string, { direct: Set<string>, groups: string[][] }>} */
const usage = new Map();
const requireAll = [...src.matchAll(/const\s+(\w+)\s*=\s*require\(\s*"(@deepseek-ai\/[^"]+)"\s*\)/g)];
for (const [, varName, pkgName] of requireAll) {
  if (!usage.has(pkgName)) usage.set(pkgName, { direct: new Set(), groups: [] });
  const entry = usage.get(pkgName);
  for (const m of src.matchAll(new RegExp(`\\b${varName}\\.(\\w+)`, "g"))) entry.direct.add(m[1]);
}
/* 候选组：pickHostExport(["A","B","C"], 兜底) —— 至少命中一个即可 */
for (const m of src.matchAll(/pickHostExport\(\s*\[([^\]]*)\]/g)) {
  const names = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  if (names.length > 0) usage.get([...usage.keys()][0])?.groups.push(names);
}
if (usage.size === 0) {
  console.error("未在 lib/client.js 里找到 require(\"@deepseek-ai/...\") 的取用点");
  process.exit(2);
}

/* ---------- 2) 静态解析宿主包的 re-export 清单 ---------- */
const exportedNames = (pkgDir) => {
  const idx = join(pkgDir, "lib", "index.js");
  const text = readFileSync(idx, "utf8");
  const names = new Set();
  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of m[1].split(",")) {
      const part = raw.trim();
      if (part === "") continue;
      const asMatch = part.match(/\s+as\s+(\w+)$/);
      names.add(asMatch ? asMatch[1] : part.replace(/^type\s+/, ""));
    }
  }
  return names;
};

/* ---------- 3) 逐版本比对 ---------- */
let failed = 0;
for (const dir of dirs) {
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  const names = exportedNames(dir);
  const regular = [...names].filter((n) => /^Icon\w+Outline(Regular|Medium)$/.test(n)).length;
  const sized = [...names].filter((n) => /^Icon\w+Outline\d+$/.test(n)).length;
  console.log(`\n=== ${pkg.name}@${pkg.version} ===`);
  console.log(`  图标命名：字重后缀 ${regular} 个 / 数字后缀 ${sized} 个（导出总数 ${names.size}）`);

  for (const [pkgName, entry] of usage) {
    if (pkgName !== pkg.name) continue;
    for (const name of entry.direct) {
      const ok = names.has(name);
      if (!ok) failed++;
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${pkgName} → ${name}`);
    }
    for (const group of entry.groups) {
      const hit = group.find((n) => names.has(n));
      if (hit === undefined) failed++;
      console.log(`  ${hit !== undefined ? "PASS" : "FAIL"}  ${pkgName} → ${group.join(" | ")}${hit ? `  （命中 ${hit}）` : "  （全部缺失）"}`);
    }
  }
}

console.log(failed === 0 ? "\n宿主导出契约检查通过 ✓" : `\n${failed} 项缺失 ✗`);
process.exit(failed === 0 ? 0 : 1);
