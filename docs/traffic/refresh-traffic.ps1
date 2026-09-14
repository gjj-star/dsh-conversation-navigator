# 刷新插件流量归档与趋势图（npm 下载 + GitHub traffic + star 历史）
#
# 用法：在 PowerShell 里执行
#   .\docs\traffic\refresh-traffic.ps1
# 说明：GitHub token 从 `gh auth token` 取（需要已 `gh auth login` 且对仓库有权限），
#       只注入当前进程环境变量，不写入任何文件。
# 产物：traffic-archive.json（长期归档）、traffic-trend.svg（趋势图）、traffic-report.md（报告）

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $env:GH_TOKEN -and -not $env:GITHUB_TOKEN) {
  $token = $null
  try { $token = (gh auth token 2>$null) } catch { }
  if ($token) {
    $env:GH_TOKEN = $token.Trim()
    Write-Host "已从 gh 注入 GitHub token" -ForegroundColor DarkGray
  } else {
    Write-Warning "未取到 GitHub token（gh 未登录？），本次将跳过 GitHub 部分，仅更新 npm 数据"
  }
}

& node (Join-Path $here 'traffic-archive.mjs')
