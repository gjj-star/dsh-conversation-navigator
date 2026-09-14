// 图表自检：把 traffic-trend.svg 里的几何坐标与 traffic-archive.json 逐项比对。
// 注意：本文件镜像了 traffic-archive.mjs 的绘图规则（niceMax、面板边界、柱子底部对齐、
// 最小柱高 1.5px），改动图表逻辑时必须同步更新本文件，否则会误报。
// 用法：node docs/traffic/validate-chart.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(HERE, "traffic-trend.svg"), "utf8");
const a = JSON.parse(readFileSync(join(HERE, "traffic-archive.json"), "utf8"));

let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) fail++; };
const niceMax = (max) => {
  if (max <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (max <= m * pow) return m * pow;
  return 10 * pow;
};

const W = 1120, H = 560;
const panelA = svg.match(/<rect class="panel" x="68" y="104" width="1028" height="(\d+)"/);
const panelB = svg.match(/<rect class="panel" x="68" y="404" width="1028" height="(\d+)"/);
check(!!panelA && !!panelB, `面板存在 A(高 ${panelA?.[1]}) B(高 ${panelB?.[1]})`);
if (!panelA || !panelB) process.exit(1);
const gA = { y0: 104, y1: 104 + +panelA[1] };
const gB = { y0: 404, y1: 404 + +panelB[1] };

// 1) 顶层坐标（排除 <g transform> 组内的相对坐标）必须有限且在画布内
const topLevel = svg.replace(/<g[^>]*transform="[^"]*"[\s\S]*?<\/g>/g, "");
const attrs = [...topLevel.matchAll(/\s(x|y|x1|y1|x2|y2|cx|cy)="([^"]*)"/g)];
const bad = attrs.filter(([, , v]) => !/^-?\d+(\.\d+)?$/.test(v) || !Number.isFinite(Number(v)));
check(bad.length === 0, `顶层坐标属性共 ${attrs.length} 个，非法/NaN ${bad.length} 个`);
const oob = attrs.filter(([, n, v]) => ["x", "x1", "x2", "cx"].includes(n) && (Number(v) < -5 || Number(v) > W + 5))
  .concat(attrs.filter(([, n, v]) => ["y", "y1", "y2", "cy"].includes(n) && (Number(v) < 20 || Number(v) > H)));
check(oob.length === 0, `越界坐标 ${oob.length} 个${oob.length ? " 例:" + JSON.stringify(oob.slice(0, 3)) : ""}`);

// 2) npm 柱子：数量、数值、几何比例
const bars = [...svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="#f59e0b"[^>]*><title>([^<]+)<\/title>/g)]
  .map((m) => ({ x: +m[1], y: +m[2], w: +m[3], h: +m[4], title: m[5] }));
check(bars.length === Object.values(a.npmDaily).filter((v) => v > 0).length, `npm 柱子 ${bars.length} 根 = 归档非零天数`);
const npmMax = niceMax(Math.max(5, ...Object.values(a.npmDaily)));
let mismatch = 0, barErr = 0;
for (const b of bars) {
  const [date, valStr] = b.title.split(" · npm ");
  const v = Number(valStr);
  if (a.npmDaily[date] !== v) mismatch++;
  const expectedH = Math.max(1.5, (v / npmMax) * (gB.y1 - gB.y0));
  const expectedY = gB.y1 - expectedH; // 底部对齐
  if (Math.abs(b.y - expectedY) > 0.6 || Math.abs(b.h - expectedH) > 0.6) { barErr++; console.log(`      异常柱: ${b.title} y=${b.y} h=${b.h} 期望 y=${expectedY.toFixed(1)} h=${expectedH.toFixed(1)}`); }
  if (b.y < gB.y0 - 0.6 || b.y + b.h > gB.y1 + 0.6) { barErr++; console.log(`      越界柱: ${b.title}`); }
}
check(mismatch === 0, `柱子数值与归档一致（不一致 ${mismatch}）`);
check(barErr === 0, `柱子几何符合线性比例且在面板内（异常 ${barErr}）`);
const tallest = bars.reduce((m, b) => (b.h > m.h ? b : m), bars[0]);
check(/^\d{4}-\d{2}-\d{2}$/.test(tallest.title.split(" · ")[0]), `最高柱 = ${tallest.title}`);

// 3) 折线点坐标与归档一致
const days = [...new Set([...Object.keys(a.npmDaily), ...Object.keys(a.viewsDaily), ...Object.keys(a.clonesDaily)])].sort();
const ghMax = niceMax(Math.max(5, ...days.flatMap((d) => [a.viewsDaily[d]?.uniques ?? 0, a.clonesDaily[d]?.uniques ?? 0])));
const L = 68, plotW = W - 68 - 24, n = days.length;
const X = (i) => L + (i * plotW) / (n - 1);
const YA = (v) => gA.y1 - (v / ghMax) * (gA.y1 - gA.y0);
const parsePath = (color) => {
  const m = svg.match(new RegExp(`<path d="([^"]+)" fill="none" stroke="${color}"`));
  return m ? [...m[1].matchAll(/([ML])([\d.]+),([\d.]+)/g)].map(([, , x, y]) => ({ x: +x, y: +y })) : null;
};
for (const [name, color, pick] of [
  ["views", "#2563eb", (d) => a.viewsDaily[d]?.uniques ?? null],
  ["clones", "#10b981", (d) => a.clonesDaily[d]?.uniques ?? null]
]) {
  const pts = parsePath(color);
  check(!!pts && pts.length > 0, `${name} 折线存在（${pts?.length ?? 0} 点）`);
  if (!pts) continue;
  const expected = days.map((d, i) => ({ i, v: pick(d) })).filter((p) => p.v !== null);
  let err = pts.length === expected.length ? 0 : 1;
  for (let k = 0; k < Math.min(pts.length, expected.length); k++) {
    const e = expected[k];
    if (Math.abs(pts[k].x - X(e.i)) > 0.6 || Math.abs(pts[k].y - YA(e.v)) > 0.6) err++;
  }
  check(err === 0, `${name} 折线 ${pts.length} 点坐标与归档一致（异常 ${err}）`);
}

// 4) KPI 文本与归档汇总一致
const fmt = (x) => x.toLocaleString("en-US");
const sum = (o, k) => Object.values(o).reduce((s, v) => s + (k ? (v?.[k] ?? 0) : v), 0);
for (const [label, val] of [
  ["npm 累计", fmt(sum(a.npmDaily))],
  ["views 独立访客", fmt(sum(a.viewsDaily, "uniques"))],
  ["独立克隆者", fmt(sum(a.clonesDaily, "uniques"))],
  ["stars", fmt(a.stats?.stars ?? 0)]
]) check(svg.includes(`>${val}</text>`), `KPI ${label} = ${val} 出现在图中`);

// 5) 发版标注、图例、面板标题
const relCount = [...svg.matchAll(/class="rel"/g)].length;
const relDays = new Set((a.releases ?? []).map((r) => r.at.slice(0, 10)).filter((d) => days.includes(d)));
check(relCount === relDays.size, `发版竖线 ${relCount} 条 = 有发版的日期数 ${relDays.size}`);
check(svg.includes("views 独立") && svg.includes("clones 独立"), "图例文字存在");
check(/npm 每日下载（上限 \d+）/.test(svg) && /GitHub 独立访客 \/ 独立克隆者（上限 \d+）/.test(svg), "两个面板标题带正确上限");
const last = (a.releases ?? []).at(-1);
check(last ? svg.includes(`最近发版 ${last.version}`) : true, `最近发版信息正确（${last?.version}）`);

console.log(fail === 0 ? "\n全部几何校验通过 ✓" : `\n${fail} 项校验失败 ✗`);
process.exit(fail === 0 ? 0 : 1);
