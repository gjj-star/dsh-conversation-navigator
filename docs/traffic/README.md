# 流量归档（docs/traffic）

本目录把 `dsh-conversation-navigator` 的**分发流量**沉淀成可长期对比的序列。

| 文件 | 说明 |
| --- | --- |
| `traffic-trend.svg` | 趋势图：上半区 GitHub 独立访客/独立克隆者，下半区 npm 每日下载，橙色竖虚线为发版日 |
| `traffic-report.md` | 汇总 + 逐日明细表（含发版记录、来源渠道、热门路径） |
| `traffic-archive.json` | 原始归档：逐日 npm 下载、views、clones、star 事件、发版时间、抓取历史 |
| `traffic-archive.mjs` | 抓取 + 合并 + 渲染脚本（零依赖，Node ≥ 18） |
| `refresh-traffic.ps1` | 刷新入口：自动从 `gh auth token` 注入 token 后运行脚本 |

## 为什么需要"归档"这一步

- **GitHub traffic API 只提供滚动 14 天**，过期即永久丢失；npm 的逐日下载虽可回溯，但最近 1–2 天存在结算延迟。
- 因此本脚本采用"**每次抓取合并进归档**"的策略：新数据覆盖同日旧值，**已归档的历史天数永不删除**。跑得越勤，序列越完整。
- 8/17（首发）–8/29 这段 GitHub 数据因超出窗口已无法从 API 取回，是通过 DSH 会话日志中 8/25、9/7 两次历史查询快照恢复的（见 `traffic-archive.json` 的 `recovered` 字段与 `viewsDaily.*.source`）。

## 自动刷新（GitHub Actions）

`.github/workflows/traffic.yml` 每天 **03:23 UTC（11:23 CST）** 自动执行一次：

1. `node docs/traffic/traffic-archive.mjs`（`GH_TOKEN` 用仓库自带的 `GITHUB_TOKEN`，权限 `contents: write`）
2. `node docs/traffic/validate-chart.mjs` 自检图表与归档一致
3. 有变化才提交（`chore(traffic): 每日流量归档 YYYY-MM-DD`），无变化直接跳过

该工作流设置了 `STRICT=1`：任一数据源抓取失败会让本次 run 失败（红灯），避免 token 失效后静默断更。也可在 Actions 页 `workflow_dispatch` 手动触发。

> 首次启用前，请先把 `docs/traffic/` 提交并推送到 `main`，否则 Actions 里没有可刷新的基线文件。

## 刷新方式

```powershell
# 需要已 gh auth login（对仓库有读权限即可）
.\docs\traffic\refresh-traffic.ps1
```

或手动：

```powershell
$env:GH_TOKEN = (gh auth token); node .\docs\traffic\traffic-archive.mjs
# 可用环境变量覆盖：NPM_PKG / GH_REPO / OUT_DIR
# 追加 STRICT=1 可让抓取失败时以退出码 1 结束（CI 用）
```

## 口径与陷阱

- **npm 下载 ≠ 用户数**：含镜像站、CI、重复安装，且首日（8/17）的 2,125 中包含作者连续发版 16 次的自我安装。
- **GitHub 独立访客/克隆者更接近真实人数**，建议作为主要观测指标；`clones` 里也包含 CI 与 fork 同步。
- **发版是最强的流量驱动**：历史数据显示每次发版前后 1–2 天浏览/克隆抬升，断更后一周内明显衰减。
- **star 历史**取自 `stargazers?starred_at`，是全量数据、不受 14 天窗口限制，适合做长期趋势。

## 在 README 里展示

```markdown
![流量趋势](./docs/traffic/traffic-trend.svg)
```

SVG 内置 `prefers-color-scheme` 适配，GitHub 深色/浅色主题下都可读。
