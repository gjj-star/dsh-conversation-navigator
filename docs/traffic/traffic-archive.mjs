#!/usr/bin/env node
/**
 * traffic-archive.mjs — 插件流量归档 + 趋势图生成
 *
 * 为什么需要它：GitHub 的 traffic API 只保留滚动 14 天，过期即永久丢失；
 * npm 的逐日下载虽然可回溯，但最近 1–2 天有结算延迟。本脚本把每次抓取的
 * 结果合并进一份本地归档（新数据覆盖同日旧值，历史天数永不删除），并在
 * 归档之上重新生成趋势图与报告。
 *
 * 数据源：
 *   - npm   : api.npmjs.org downloads/range（全量逐日）+ registry（版本发布时间）
 *   - GitHub: traffic/views、traffic/clones、popular/referrers、popular/paths、仓库概况
 *   - Star  : stargazers?starred_at（全量，不受 14 天限制，用于长期趋势）
 *
 * 用法（需要 GitHub token，推荐用同目录的 refresh-traffic.ps1）：
 *   PowerShell:  $env:GH_TOKEN = (gh auth token); node docs/traffic/traffic-archive.mjs
 *   Bash:        GH_TOKEN=$(gh auth token) node docs/traffic/traffic-archive.mjs
 * 可选环境变量：NPM_PKG、GH_REPO、OUT_DIR
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.OUT_DIR ?? HERE;
const NPM_PKG = process.env.NPM_PKG ?? "dsh-conversation-navigator";
const GH_REPO = process.env.GH_REPO ?? "gjj-star/dsh-conversation-navigator";
const TOKEN = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "";
const ARCHIVE = join(OUT_DIR, "traffic-archive.json");
const SVG = join(OUT_DIR, "traffic-trend.svg");
const REPORT = join(OUT_DIR, "traffic-report.md");

/** traffic API 403 时的可执行提示（Actions 的 GITHUB_TOKEN 无法访问 /traffic/*）。 */
const TRAFFIC_HINT = [
  "GitHub 的 /traffic/* 接口要求\"具备 push 权限的用户令牌\"；Actions 自带的 GITHUB_TOKEN 是安装令牌，",
  "无法授予该接口需要的权限（Administration），因此通常返回 403。",
  "解决：生成 classic PAT（scope: repo，或 fine-grained 勾选 Administration: read）并保存为仓库 secret `TRAFFIC_TOKEN`，",
  "工作流会自动优先使用它。添加之前，CI 仍会采集 npm 下载与 star 历史；views/clones 可由本地 `refresh-traffic.ps1` 补齐（14 天窗口内都来得及）。"
].join("");

/**
 * 从会话日志中抢救回来的历史快照（GitHub 已不再提供，见 README 说明）。
 * 仅在归档首次创建时作为种子写入，之后由真实抓取覆盖。
 */
const RECOVERED_SEED = {
  note: "recovered from DSH session logs (queries at 2026-08-25 and 2026-09-07); GitHub traffic API keeps only a rolling 14-day window",
  views: {
    "2026-08-17": [24, 5], "2026-08-18": [7, 5], "2026-08-19": [2, 1], "2026-08-20": [2, 1],
    "2026-08-21": [15, 9], "2026-08-22": [3, 2], "2026-08-23": [5, 5], "2026-08-24": [20, 9],
    "2026-08-25": [51, 5], "2026-08-26": [63, 32], "2026-08-27": [141, 38], "2026-08-28": [112, 44],
    "2026-08-29": [56, 29], "2026-08-30": [22, 11], "2026-08-31": [47, 27], "2026-09-01": [63, 27],
    "2026-09-02": [42, 25], "2026-09-03": [59, 28], "2026-09-04": [62, 28], "2026-09-05": [58, 23]
  },
  clones: {
    "2026-08-17": [51, 33], "2026-08-18": [4, 4], "2026-08-19": [12, 10], "2026-08-20": [13, 10],
    "2026-08-21": [9, 7], "2026-08-22": [7, 4], "2026-08-23": [6, 6], "2026-08-24": [8, 6],
    "2026-08-25": [25, 14], "2026-08-26": [19, 14], "2026-08-27": [21, 17], "2026-08-28": [18, 12],
    "2026-08-29": [2, 2], "2026-08-30": [5, 5], "2026-08-31": [20, 15], "2026-09-01": [18, 9],
    "2026-09-02": [5, 5], "2026-09-03": [36, 17], "2026-09-04": [2, 2], "2026-09-05": [33, 18]
  }
};

const day = (d) => new Date(d).toISOString().slice(0, 10);
const today = () => day(Date.now());
const num = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "—");

async function getJSON(url, headers = {}, retries = 3) {
  let lastFailure = "";
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "dsh-traffic-archive", accept: "application/vnd.github+json", ...headers } });
      if (res.status === 404) return { error: `404 ${url}` };
      if (res.status === 403 || res.status === 429) {
        // 403/429 多为权限或限流：保留 GitHub 自己的说明，便于定位（例如 traffic API 的 push 权限要求）
        const body = (await res.text()).replace(/\s+/g, " ").slice(0, 200);
        lastFailure = `HTTP ${res.status} ${body}`;
        await sleep(1200 * (i + 1));
        continue;
      }
      if (!res.ok) return { error: `HTTP ${res.status} ${url}: ${(await res.text()).slice(0, 200)}` };
      return { json: await res.json() };
    } catch (e) {
      lastFailure = `${e.name}: ${e.message}`;
      if (i === retries - 1) return { error: `${lastFailure} (${url})` };
      await sleep(800 * (i + 1));
    }
  }
  return { error: `${lastFailure || "exhausted retries"} (${url})` };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- collectors
async function fetchNpm() {
  const meta = await getJSON(`https://registry.npmjs.org/${NPM_PKG}`);
  const releases = [];
  let created = null;
  if (meta.json) {
    created = meta.json.time?.created?.slice(0, 10) ?? null;
    for (const [v, at] of Object.entries(meta.json.time ?? {})) if (!["created", "modified"].includes(v)) releases.push({ version: v, at });
    releases.sort((a, b) => new Date(a.at) - new Date(b.at));
  }
  const from = created ?? "2026-01-01";
  const range = await getJSON(`https://api.npmjs.org/downloads/range/${from}:${today()}/${NPM_PKG}`);
  const daily = {};
  if (range.json?.downloads) for (const r of range.json.downloads) daily[day(r.day)] = r.downloads;
  return { daily, releases, version: meta.json?.["dist-tags"]?.latest ?? null, created, error: meta.error ?? range.error };
}

async function fetchGithub() {
  const auth = TOKEN ? { authorization: `Bearer ${TOKEN}` } : {};
  if (!TOKEN) return { error: "未设置 GH_TOKEN/GITHUB_TOKEN", forbidden: true, hint: TRAFFIC_HINT };
  const base = `https://api.github.com/repos/${GH_REPO}`;
  const [views, clones, referrers, paths, repo] = await Promise.all([
    getJSON(`${base}/traffic/views?per=day`, auth),
    getJSON(`${base}/traffic/clones?per=day`, auth),
    getJSON(`${base}/traffic/popular/referrers`, auth),
    getJSON(`${base}/traffic/popular/paths`, auth),
    getJSON(base, auth)
  ]);
  const pack = (r) => {
    if (!r.json?.views && !r.json?.clones) return {};
    const out = {};
    for (const d of r.json.views ?? r.json.clones ?? []) out[day(d.timestamp)] = { count: d.count, uniques: d.uniques };
    return out;
  };
  const trafficError = views.error ?? clones.error;
  const forbidden = /HTTP 403|Resource not accessible|push access/i.test(trafficError ?? "");
  return {
    views: pack(views), clones: pack(clones),
    referrers: referrers.json ?? [], paths: paths.json ?? [],
    stats: repo.json ? { stars: repo.json.stargazers_count, forks: repo.json.forks_count, watchers: repo.json.subscribers_count, openIssues: repo.json.open_issues_count, pushedAt: repo.json.pushed_at, size: repo.json.size } : null,
    error: trafficError,
    forbidden,
    hint: forbidden ? TRAFFIC_HINT : undefined
  };
}

async function fetchStars() {
  const auth = TOKEN ? { authorization: `Bearer ${TOKEN}` } : {};
  const byDay = {};
  let page = 1, total = 0;
  for (;;) {
    const r = await getJSON(`https://api.github.com/repos/${GH_REPO}/stargazers?per_page=100&page=${page}`, { ...auth, accept: "application/vnd.github.star+json" });
    if (!r.json || !Array.isArray(r.json) || r.json.length === 0) { if (r.error) return { byDay, error: r.error }; break; }
    for (const s of r.json) { const d = day(s.starred_at ?? Date.now()); byDay[d] = (byDay[d] ?? 0) + 1; total++; }
    if (r.json.length < 100) break;
    page++;
    await sleep(200);
  }
  return { byDay, total };
}

// ---------------------------------------------------------------- archive
function loadArchive() {
  if (existsSync(ARCHIVE)) {
    try { return JSON.parse(readFileSync(ARCHIVE, "utf8")); } catch (e) { console.warn("归档损坏，将重建：", e.message); }
  }
  return null;
}

function seedArchive() {
  const viewsDaily = {}, clonesDaily = {};
  for (const [d, [c, u]] of Object.entries(RECOVERED_SEED.views)) viewsDaily[d] = { count: c, uniques: u, source: "recovered-session-log" };
  for (const [d, [c, u]] of Object.entries(RECOVERED_SEED.clones)) clonesDaily[d] = { count: c, uniques: u, source: "recovered-session-log" };
  return {
    version: 1, package: NPM_PKG, repo: GH_REPO, createdAt: new Date().toISOString(),
    npmDaily: {}, viewsDaily, clonesDaily, starsDaily: {}, releases: [],
    referrers: [], paths: [], stats: null, history: [], recovered: RECOVERED_SEED.note
  };
}

/**
 * 合并逐日数据：新值覆盖同日旧值，历史天数永不删除（这就是对抗 14 天窗口的核心）。
 * numeric=true 时（npm 下载量）存纯数字；否则存 {count, uniques, source} 结构。
 */
function mergeDaily(target, incoming, source, numeric = false) {
  let added = 0, updated = 0;
  for (const [d, v] of Object.entries(incoming ?? {})) {
    const next = numeric ? v : { ...v, source };
    const prev = target[d];
    if (prev === undefined) { target[d] = next; added++; }
    else if (JSON.stringify(prev) !== JSON.stringify(next)) { target[d] = next; updated++; }
  }
  return { added, updated };
}

// ---------------------------------------------------------------- chart
const COLORS = { views: "#2563eb", clones: "#10b981", npm: "#f59e0b", star: "#a855f7" };

function niceMax(max) {
  if (max <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (max <= m * pow) return m * pow;
  return 10 * pow;
}

function buildSVG(a) {
  const days = [...new Set([...Object.keys(a.npmDaily), ...Object.keys(a.viewsDaily), ...Object.keys(a.clonesDaily), ...Object.keys(a.starsDaily)])].sort();
  const W = 1120, H = 604, L = 68, R = 24;
  const plotW = W - L - R;
  // 垂直分区（严格不重叠）：标题 32 / 副标题 52,68 / KPI 值 94 + 标签 109 /
  // 发版圆点 121 + 标签两行 133,144 / 面板A 156..412 / 面板B 标题 440 + 面板 450..536 / 轴标签 554 / 脚注 572,588
  // 发版标签两行交错：序列变长后每天间距变小（39 天时约 27px），单行放不下相邻日的版本号
  const REL_DOT_Y = 121, REL_LABEL_Y = 133, REL_LABEL_Y2 = 144, REL_LINE_Y = 155;
  const x0 = 156, x1 = 412;           // panel A: GitHub uniques
  const y0 = 450, y1 = 536;           // panel B: npm downloads
  const n = Math.max(days.length, 2);
  const X = (i) => L + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const barW = Math.max(3, Math.min(18, plotW / n - 2));

  const ghMax = niceMax(Math.max(5, ...days.flatMap((d) => [a.viewsDaily[d]?.uniques ?? 0, a.clonesDaily[d]?.uniques ?? 0])));
  const npmMax = niceMax(Math.max(5, ...days.map((d) => a.npmDaily[d] ?? 0)));
  const YA = (v) => x1 - (v / ghMax) * (x1 - x0);
  const YB = (v) => y1 - (v / npmMax) * (y1 - y0);

  // 折线按日历索引定位；缺值为 null 时断开子路径，不产生 NaN
  const subpaths = (pick) => {
    let d = "", open = false;
    days.forEach((dayKey, i) => {
      const v = pick(dayKey);
      if (v === null || v === undefined) { open = false; return; }
      d += `${open ? "L" : "M"}${X(i).toFixed(1)},${YA(v).toFixed(1)} `;
      open = true;
    });
    return d.trim();
  };
  const line = (pick) => subpaths(pick);
  const area = (pick) => {
    const pts = days.map((dayKey, i) => ({ i, v: pick(dayKey) })).filter((p) => p.v !== null && p.v !== undefined);
    if (pts.length === 0) return "";
    const top = pts.map((p) => `${p.i === pts[0].i ? "M" : "L"}${X(p.i).toFixed(1)},${YA(p.v).toFixed(1)}`).join(" ");
    return `${top} L${X(pts.at(-1).i).toFixed(1)},${x1} L${X(pts[0].i).toFixed(1)},${x1} Z`;
  };
  const dots = (pick, color) => days.map((d, i) => {
    const v = pick(d); if (v === null || v === undefined) return "";
    return `<circle cx="${X(i).toFixed(1)}" cy="${YA(v).toFixed(1)}" r="2.6" fill="${color}"><title>${d} · ${v}</title></circle>`;
  }).join("");

  const gridA = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const y = YA(ghMax * f);
    return `<line class="grid" x1="${L}" y1="${y.toFixed(1)}" x2="${W - R}" y2="${y.toFixed(1)}"/><text class="tick" x="${L - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${Math.round(ghMax * f)}</text>`;
  }).join("");
  const gridB = [0, 0.5, 1].map((f) => {
    const y = YB(npmMax * f);
    return `<line class="grid" x1="${L}" y1="${y.toFixed(1)}" x2="${W - R}" y2="${y.toFixed(1)}"/><text class="tick" x="${L - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${Math.round(npmMax * f)}</text>`;
  }).join("");

  // release markers (dedupe same-day, group versions)
  const byDayRel = new Map();
  for (const r of a.releases ?? []) { const d = day(r.at); if (!byDayRel.has(d)) byDayRel.set(d, []); byDayRel.get(d).push(r.version); }
  // 发版标记分两段绘制：圆点+版本标签在头部标记带；竖虚线必须画在面板之后，
  // 否则会被不透明面板填充盖住（曾经如此）。
  // 标签宽度按 validate-chart.mjs 同款估算（CJK 记 1 字宽、其余 0.56），据此做两行交错布局：
  // 同一行里与上一个标签水平重叠 > 1.5px 就换到下一行；两行都挤则省略该标签（圆点 title 仍可悬停查看）
  const REL_LABEL_FS = 10;
  const relLabelWidth = (s) => [...s].reduce((w, ch) => w + (ch.codePointAt(0) > 0x2e80 ? 1 : 0.56) * REL_LABEL_FS, 0);
  const relRows = [null, null];
  const relDots = [...byDayRel.entries()].filter(([d]) => days.includes(d)).map(([d, vs]) => {
    const i = days.indexOf(d), x = X(i);
    // 标签缩写：同日多次发版只留补丁号区间（0.1.0…0.1.15 → 0–15），避免密集发版互相压字
    const seg = (v) => v.split(".");
    const sameMinor = seg(vs[0])[0] === seg(vs.at(-1))[0] && seg(vs[0])[1] === seg(vs.at(-1))[1];
    const label = vs.length === 1 ? vs[0] : (sameMinor ? `${seg(vs[0])[2]}–${seg(vs.at(-1))[2]}` : `${vs[0]}–${vs.at(-1)}`);
    const w = relLabelWidth(label);
    let row = -1;
    for (let r = 0; r < relRows.length; r++) {
      const prev = relRows[r];
      const overlap = prev === null ? 0 : (prev.w + w) / 2 - Math.abs(prev.x - x);
      if (overlap <= 1.5) { row = r; break; }
    }
    let labelEl = "";
    if (row >= 0) {
      relRows[row] = { x, w };
      labelEl = `<text class="rellabel" x="${x.toFixed(1)}" y="${row === 0 ? REL_LABEL_Y : REL_LABEL_Y2}" text-anchor="middle">${label}</text>`;
    }
    return `<circle cx="${x.toFixed(1)}" cy="${REL_DOT_Y}" r="2.6" fill="${COLORS.npm}"><title>${d} · ${vs.join(", ")}</title></circle>` + labelEl;
  }).join("");
  const relLines = [...byDayRel.keys()].filter((d) => days.includes(d))
    .map((d) => `<line class="rel" x1="${X(days.indexOf(d)).toFixed(1)}" y1="${REL_LINE_Y}" x2="${X(days.indexOf(d)).toFixed(1)}" y2="${y1}"/>`).join("");

  const step = Math.max(1, Math.ceil(n / 16));
  const xLabels = days.map((d, i) => i % step === 0 || i === n - 1 ? `<text class="tick" x="${X(i).toFixed(1)}" y="${y1 + 18}" text-anchor="middle">${d.slice(5)}</text>` : "").join("");

  const sum = (obj, key) => Object.values(obj).reduce((acc, v) => acc + (key ? (v?.[key] ?? 0) : v), 0);
  const npmTotal = sum(a.npmDaily), viewsTotal = sum(a.viewsDaily, "count"), viewsUniq = sum(a.viewsDaily, "uniques");
  const cloneTotal = sum(a.clonesDaily, "count"), cloneUniq = sum(a.clonesDaily, "uniques");
  const stars = a.stats?.stars ?? Object.values(a.starsDaily).reduce((x, y) => x + y, 0);
  const lastRelease = (a.releases ?? []).at(-1);
  const daysSince = lastRelease ? Math.round((Date.now() - new Date(lastRelease.at)) / 86400000) : null;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${NPM_PKG} 流量趋势">
<style>
  .bg{fill:#ffffff}.panel{fill:#f8fafc;stroke:#e2e8f0}
  .grid{stroke:#e5e7eb;stroke-width:1}.tick{fill:#64748b;font:11px ui-sans-serif,system-ui,sans-serif}
  .title{fill:#0f172a;font:600 17px ui-sans-serif,system-ui,sans-serif}
  .sub{fill:#475569;font:12px ui-sans-serif,system-ui,sans-serif}
  .lbl{fill:#334155;font:600 12px ui-sans-serif,system-ui,sans-serif}
  .rellabel{fill:#b45309;font:10px ui-sans-serif,system-ui,sans-serif}
  .rel{stroke:#f59e0b;stroke-width:1;stroke-dasharray:3 4;opacity:.65}
  .kpi{fill:#0f172a;font:600 16px ui-sans-serif,system-ui,sans-serif}
  .kpisub{fill:#64748b;font:10px ui-sans-serif,system-ui,sans-serif}
  .note{fill:#94a3b8;font:10px ui-sans-serif,system-ui,sans-serif}
  @media (prefers-color-scheme: dark){
    .bg{fill:#0b1220}.panel{fill:#111a2e;stroke:#1f2a44}.grid{stroke:#1f2a44}.tick{fill:#94a3b8}
    .title{fill:#e2e8f0}.sub{fill:#94a3b8}.lbl{fill:#cbd5e1}.kpi{fill:#e2e8f0}.kpisub{fill:#94a3b8}
    .rellabel{fill:#fbbf24}.note{fill:#64748b}
  }
</style>
<rect class="bg" width="${W}" height="${H}"/>
<text class="title" x="${L}" y="32">${NPM_PKG} · 流量趋势</text>
<text class="sub" x="${L}" y="52">${days[0] ?? ""} → ${days.at(-1) ?? ""}　累计 ${days.length} 天　数据源：npm downloads + GitHub traffic${a.recovered ? "（8/17–8/29 GitHub 数据由会话日志快照恢复）" : ""}</text>
<text class="sub" x="${L}" y="68">最近发版 ${lastRelease ? `${lastRelease.version} @ ${day(lastRelease.at)}（${daysSince} 天前）` : "—"}　生成于 ${new Date().toISOString().slice(0, 16).replace("T", " ")}Z</text>

<g class="kpi">
  <text x="${L}" y="94">${num(npmTotal)}</text><text class="kpisub" x="${L}" y="109">npm 累计下载</text>
</g>
<g class="kpi" transform="translate(236,0)"><text x="0" y="94">${num(viewsUniq)}</text><text class="kpisub" x="0" y="109">GitHub 独立访客</text></g>
<g class="kpi" transform="translate(400,0)"><text x="0" y="94">${num(cloneUniq)}</text><text class="kpisub" x="0" y="109">独立克隆者</text></g>
<g class="kpi" transform="translate(556,0)"><text x="0" y="94">${num(stars)}</text><text class="kpisub" x="0" y="109">Stars</text></g>
<g class="kpi" transform="translate(690,0)"><text x="0" y="94">${num(viewsTotal)} / ${num(cloneTotal)}</text><text class="kpisub" x="0" y="109">views / clones 次数</text></g>

${relDots}
<rect class="panel" x="${L}" y="${x0}" width="${plotW}" height="${x1 - x0}" rx="6"/>
${gridA}
<path d="${area((d) => a.viewsDaily[d]?.uniques ?? null)}" fill="${COLORS.views}" opacity=".10"/>
<path d="${line((d) => a.viewsDaily[d]?.uniques ?? null)}" fill="none" stroke="${COLORS.views}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="${line((d) => a.clonesDaily[d]?.uniques ?? null)}" fill="none" stroke="${COLORS.clones}" stroke-width="2.2" stroke-linejoin="round" stroke-dasharray="6 3"/>
${dots((d) => a.viewsDaily[d]?.uniques ?? null, COLORS.views)}
${dots((d) => a.clonesDaily[d]?.uniques ?? null, COLORS.clones)}
<g transform="translate(${L + 10},${x0 + 18})">
  <rect x="0" y="-9" width="10" height="10" fill="${COLORS.views}" rx="2"/><text class="tick" x="15" y="0">views 独立（上限 ${ghMax}）</text>
  <rect x="196" y="-9" width="10" height="10" fill="${COLORS.clones}" rx="2"/><text class="tick" x="211" y="0">clones 独立（虚线）</text>
</g>

<text class="lbl" x="${L}" y="${y0 - 10}">npm 每日下载（上限 ${npmMax}）</text>
<rect class="panel" x="${L}" y="${y0}" width="${plotW}" height="${y1 - y0}" rx="6"/>
${gridB}
${days.map((d, i) => {
  const v = a.npmDaily[d] ?? 0; if (!v) return "";
  const yTop = YB(v), h = Math.max(1.5, y1 - yTop), y = y1 - h; // 底部对齐，最小 1.5px 也不越出面板
  return `<rect x="${(X(i) - barW / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${COLORS.npm}" opacity=".85" rx="1.5"><title>${d} · npm ${v}</title></rect>`;
}).join("")}
${relLines}
${xLabels}
<text class="note" x="${L}" y="${H - 32}">注：npm 下载含镜像/CI/重复安装，且最近 1–2 天有结算延迟；GitHub traffic 仅保留滚动 14 天窗口，历史由本归档留存。</text>
<text class="note" x="${L}" y="${H - 16}">橙色圆点与竖虚线为发版日，其下数字为该日版本号（同日多次发版显示为 起始–结束 补丁号）。</text>
</svg>`;
}

// ---------------------------------------------------------------- render
function buildReport(a) {
  const days = [...new Set([...Object.keys(a.npmDaily), ...Object.keys(a.viewsDaily), ...Object.keys(a.clonesDaily)])].sort();
  const relByDay = new Map();
  for (const r of a.releases ?? []) { const d = day(r.at); relByDay.set(d, [...(relByDay.get(d) ?? []), r.version]); }
  const sum = (obj, k) => Object.values(obj).reduce((acc, v) => acc + (k ? (v?.[k] ?? 0) : v), 0);
  const rows = days.map((d) => {
    const v = a.viewsDaily[d], c = a.clonesDaily[d];
    return `| ${d} | ${a.npmDaily[d] ?? "—"} | ${v ? `${v.count}/${v.uniques}` : "—"} | ${c ? `${c.count}/${c.uniques}` : "—"} | ${relByDay.has(d) ? relByDay.get(d).join("+") : ""} |`;
  });
  const last7 = days.slice(-7);
  const avg = (arr, pick) => Math.round(arr.reduce((s, d) => s + (pick(d) ?? 0), 0) / Math.max(1, arr.length));
  const peak = (pick) => days.reduce((best, d) => ((pick(d) ?? 0) > (pick(best) ?? 0) ? d : best), days[0]);
  const lastRelease = (a.releases ?? []).at(-1);
  return `# ${NPM_PKG} 流量报告

> 自动生成于 ${new Date().toISOString().slice(0, 16).replace("T", " ")}Z · 数据源 npm downloads + GitHub traffic
> 图表：[traffic-trend.svg](./traffic-trend.svg) · 原始归档：[traffic-archive.json](./traffic-archive.json)

## 汇总（${days[0]} → ${days.at(-1)}）

| 指标 | 累计 | 最近 7 天日均 | 峰值日 |
| --- | --- | --- | --- |
| npm 下载 | ${num(sum(a.npmDaily))} | ${avg(last7, (d) => a.npmDaily[d])} | ${peak((d) => a.npmDaily[d])} |
| GitHub 独立访客 | ${num(sum(a.viewsDaily, "uniques"))} | ${avg(last7, (d) => a.viewsDaily[d]?.uniques)} | ${peak((d) => a.viewsDaily[d]?.uniques)} |
| GitHub 独立克隆者 | ${num(sum(a.clonesDaily, "uniques"))} | ${avg(last7, (d) => a.clonesDaily[d]?.uniques)} | ${peak((d) => a.clonesDaily[d]?.uniques)} |
| Stars | ${num(a.stats?.stars ?? sum(a.starsDaily))} | — | — |
| Forks | ${num(a.stats?.forks ?? 0)} | — | — |

最近发版：${lastRelease ? `**${lastRelease.version}** @ ${day(lastRelease.at)}（${Math.round((Date.now() - new Date(lastRelease.at)) / 86400000)} 天前）` : "—"}

## 逐日明细

| 日期 | npm | views 次/独立 | clones 次/独立 | 发版 |
| --- | --- | --- | --- | --- |
${rows.join("\n")}

${a.referrers?.length ? `## 流量来源（近 14 天）\n\n| 来源 | 次数 | 独立 |\n| --- | --- | --- |\n${a.referrers.map((r) => `| ${r.referrer} | ${r.count} | ${r.uniques} |`).join("\n")}\n` : ""}
${a.paths?.length ? `\n## 热门路径（近 14 天）\n\n| 路径 | 次数 | 独立 |\n| --- | --- | --- |\n${a.paths.slice(0, 10).map((p) => `| ${p.path} | ${p.count} | ${p.uniques} |`).join("\n")}\n` : ""}
## 口径说明

- **npm 下载**：包含镜像站、CI、重复安装，且最近 1–2 天存在结算延迟，不等于真实用户数。
- **GitHub traffic**：API 仅提供滚动 14 天窗口，过期永久丢失；本归档把每次抓取合并保存，8/17–8/29 的窗口外数据由 DSH 会话日志中的历史快照恢复。
- **独立访客/克隆者**：比下载数更接近真实人数，建议作为主要观测指标。
`;
}

// ---------------------------------------------------------------- main
const npmData = await fetchNpm();
const ghData = await fetchGithub();
const starData = await fetchStars();

const archive = loadArchive() ?? seedArchive();
const changes = {
  npm: mergeDaily(archive.npmDaily, npmData.daily, "npm-api", true),
  views: mergeDaily(archive.viewsDaily, ghData.views, "github-api"),
  clones: mergeDaily(archive.clonesDaily, ghData.clones, "github-api")
};
// starsDaily 存"当日新增 star 数"（来自 starred_at，绝对量：每次抓取重算并覆盖）
let starChanged = 0;
for (const [d, c] of Object.entries(starData.byDay ?? {})) {
  if (archive.starsDaily[d] !== c) { archive.starsDaily[d] = c; starChanged++; }
}
if (npmData.version) archive.latestVersion = npmData.version;

const dataChanges = changes.npm.added + changes.npm.updated + changes.views.added + changes.views.updated
  + changes.clones.added + changes.clones.updated + starChanged;

mkdirSync(OUT_DIR, { recursive: true });
// FORCE=1：数据无变化也重写归档/图表/报告（改了绘图或报告排版后需要一次强制重绘）
const force = process.env.FORCE === "1";
if (dataChanges === 0 && !force) {
  // 数据无变化时不写文件：图表/报告含生成时间戳，写了就会每天产生无意义提交
  console.log("数据无变化：归档/图表/报告保持不变（不产生提交）");
} else {
  if (npmData.releases?.length) archive.releases = npmData.releases;
  if (ghData.referrers?.length) archive.referrers = ghData.referrers;
  if (ghData.paths?.length) archive.paths = ghData.paths;
  if (ghData.stats) archive.stats = ghData.stats;
  archive.updatedAt = new Date().toISOString();
  archive.history = [...(archive.history ?? []), {
    at: archive.updatedAt,
    npm: npmData.error ? `ERROR ${npmData.error}` : `days=${Object.keys(npmData.daily).length}`,
    github: ghData.error ? `ERROR ${ghData.error}` : `views=${Object.keys(ghData.views).length} clones=${Object.keys(ghData.clones).length}`,
    stars: starData.error ? `ERROR ${starData.error}` : `total=${starData.total}`
  }].slice(-30);
  writeFileSync(ARCHIVE, JSON.stringify(archive, null, 1) + "\n");
  writeFileSync(SVG, buildSVG(archive));
  writeFileSync(REPORT, buildReport(archive));
}

const nDays = (o) => Object.keys(o).length;
console.log("归档:", ARCHIVE);
console.log(`  npm   : ${nDays(archive.npmDaily)} 天（本次 +${changes.npm.added} / 更新 ${changes.npm.updated}）${npmData.error ? " ⚠️ " + npmData.error : ""}`);
console.log(`  views : ${nDays(archive.viewsDaily)} 天（本次 +${changes.views.added} / 更新 ${changes.views.updated}）${ghData.error ? " ⚠️ " + ghData.error : ""}`);
console.log(`  clones: ${nDays(archive.clonesDaily)} 天（本次 +${changes.clones.added} / 更新 ${changes.clones.updated}）`);
console.log(`  stars : ${nDays(archive.starsDaily)} 天有记录，共 ${starData.total ?? "?"} 个 star 事件（本次变更 ${starChanged} 天）`);
console.log(dataChanges === 0 && !force ? "文件未改动（数据无变化）" : "图表与报告已刷新");


// ---------------------------------------------------------------- 状态与退出码
// 致命错误：npm / star 抓取失败 —— STRICT=1（CI）时以退出码 1 结束，避免静默断更。
// GitHub 流量失败：默认仅告警（未配置 TRAFFIC_TOKEN 的 CI 属预期）；若 EXPECT_TRAFFIC=1
//（工作流检测到 secret 已配置）则同样视为致命，防止"配了令牌却悄悄失效"。
const fatal = [];
if (npmData.error) fatal.push(`npm: ${npmData.error}`);
if (starData.error) fatal.push(`stars: ${starData.error}`);
if (ghData.error && !ghData.forbidden) fatal.push(`github: ${ghData.error}`);
if (ghData.error && ghData.forbidden && process.env.EXPECT_TRAFFIC === "1") fatal.push(`github/traffic: ${ghData.error}`);

const status = [
  "## 流量归档状态",
  "",
  `- npm 下载：${npmData.error ? `❌ ${npmData.error}` : `✅ ${Object.keys(npmData.daily).length} 天`}`,
  `- star 历史：${starData.error ? `❌ ${starData.error}` : `✅ ${starData.total} 个 star 事件`}`,
  `- GitHub 流量（views/clones）：${ghData.error ? `⚠️ ${ghData.error}` : `✅ 已采集 ${Object.keys(ghData.views).length} 天`}`,
  ""
];
if (ghData.error) {
  console.error("GitHub 流量抓取失败：" + ghData.error);
  if (ghData.hint) console.error("提示：" + ghData.hint);
  status.push(`> ${ghData.hint ?? ""}`, "");
}
if (fatal.length > 0) console.error("致命抓取错误：" + fatal.join(" | "));
const statusFile = process.env.STATUS_FILE;
if (statusFile) { try { writeFileSync(statusFile, status.join("\n")); } catch (e) { console.warn("状态文件写入失败:", e.message); } }

if (fatal.length > 0 && process.env.STRICT === "1") {
  console.error("STRICT=1：存在致命抓取错误，以退出码 1 结束");
  process.exit(1);
}
if (fatal.length > 0) console.warn("存在致命抓取错误（未设置 STRICT=1，仍以退出码 0 结束）");
