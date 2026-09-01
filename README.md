# DSH 会话导航插件(dsh-conversation-navigator)

[English](README.en.md) | 中文

[![npm](https://img.shields.io/npm/v/dsh-conversation-navigator?style=flat-square&color=blue)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![downloads](https://img.shields.io/npm/dm/dsh-conversation-navigator?style=flat-square&color=blue)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![downloads-total](https://img.shields.io/npm/dt/dsh-conversation-navigator?style=flat-square&color=blue)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![stars](https://img.shields.io/github/stars/gjj-star/dsh-conversation-navigator?style=flat-square&color=green)](https://github.com/gjj-star/dsh-conversation-navigator)
[![license](https://img.shields.io/github/license/gjj-star/dsh-conversation-navigator?style=flat-square&color=teal)](https://github.com/gjj-star/dsh-conversation-navigator)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek_Harness-Plugin-blue?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
[![dsh.so risk](https://www.dsh.so/badge/dsh-conversation-navigator-2.svg)](https://www.dsh.so/artifact/dsh-conversation-navigator-2/)
[![dsh.so install](https://www.dsh.so/badge/install/dsh-conversation-navigator-2.svg)](https://www.dsh.so/artifact/dsh-conversation-navigator-2/)

**DeepSeek Harness(DSH)Web 端会话导航面板**:在对话页**右侧**悬浮展示按轮折叠的对话大纲,点击任意节点平滑跳转,滚动对话时实时高亮当前阅读位置,步次徽标配色与内置"轨迹"视图统一。

纯浏览器插件(无宿主行为)、纯 JavaScript、零构建、零 npm 依赖(按钮/Tooltip 复用 DSH 内核 seed 的官方 primitives)。

![显示轮次模式](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-main.png)
![隐藏轮次模式](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-no-round.png)
![极简模式·收起](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-minimal-hide.png)
![极简模式·展开](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-minimal-expand.png)

> 四种形态:显示轮次、隐藏轮次、极简·右、极简·左(极简收起仅露行内指示条,悬停展开定位面板)。完整截图见 [assets/screenshots](./assets/screenshots)。其中「社区皮肤适配」两张为第三方皮肤下的效果(鲸鱼娘女仆主题与君の名は主题),非插件自带。

## 功能

- **按轮折叠大纲**:默认只显示"第 N 轮 + 你的问题"列表,长对话一目了然
- **关键词过滤**:点击左上角搜索图标呼出输入框,只按「你的提问 + 助手实际回复文本」过滤(上下文、工具、命令、压缩、推理等不参与匹配),命中词高亮,列表文本自动定位到关键词处
- **展开/折叠步次**:点击轮次行右侧的箭头按钮(`▸ N`,展开时旋转为 `▾`)平滑展开/折叠该轮的步次明细(助手回复、工具调用、命令、压缩点等)
- **悬停查看全文**:鼠标在轮次行停留片刻,气泡显示该轮用户提问的完整原文,不再被单行截断
- **显示 / 隐藏 / 极简四种形态**:头部切换按钮四态循环——「显示轮次」为经典分组视图(压缩等系统事件与轮次同级加粗展示)→「隐藏轮次」每行统一为轨迹徽标 + 文本(用户 = 业务蓝、助手 = 紫罗兰、压缩 = 中性灰)→「极简·右」视口右缘指示条→「极简·左」锚定对话区左缘(为 dsh-better-sidebar 让出右侧),再回到「显示轮次」;
- 「极简」形态收起时只露行内指示条(当前 = 品牌色实色、非当前 = 主题前景色掺 40%),悬停展开 7 行画幅的定位面板(点击跳转、悬停全文气泡、超 7 条仅滑块滚动;右对齐从右向左展开、左对齐向右展开),外置悬浮按钮继续循环(极简·右→极简·左→显示轮次),搜索框展开时按钮自动让位
- **面板可拖动**:显示轮次 / 隐藏轮次面板按住头部即可拖到视口任意位置(自动夹边;展开高度至多半屏,上边缘固定、下边缘展开,超长轮次时列表内部滚动,底部「回到最新/全部折叠」始终可达),头部图钉按钮在「默认右侧停靠」与「上次拖动位置」间切换;拖动位置与极简左/右对齐选择持久化于 localStorage,刷新页面原样恢复
- **丝滑动效**:面板开合淡入淡出、步次展开/折叠高度过渡、过滤结果逐条级联淡入、折叠箭头旋转——全部纯 CSS 实现,零依赖
- **点击定位**:点击轮次主体或步次条目,平滑滚动跳转到对话中对应位置(不改变折叠状态)
- **加载更早 / 加载全部**:面板顶部两个按钮——「加载更早」向后翻一页、「加载全部」一键把所有历史轮次载入导航,之后可任意跳转(页面默认仍懒加载,只有点按钮才补载)
- **位置跟踪**:手动滚动对话时,面板自动高亮并跟随当前正在阅读的轮次
- **右侧定位**:默认锚定视口右侧,收起/展开左侧边栏时纹丝不动;解除停靠(拖动/图钉)后可自由放置
- **回到最新 / 全部折叠**:面板底部两个快捷按钮;「全部折叠」在没有展开的轮次时置灰,避免误以为失效
- **轨迹配色**:用户/插话 = 业务蓝、上下文 = 成功绿、助手 = 紫罗兰、工具 = 琥珀、压缩 = 中性灰(与内置轨迹视图一致的 `--dsw` 主题 token,自动适配明暗主题)
- **DSH 原生风格**:操作按钮复用官方 `Button`/`Tooltip` 组件与官方图标(搜索、关闭);其余操作图标(导航、加载更早、加载全部、回到最新、全部折叠、切换轮次等)取自 **Lucide** 描边图标集(ISC License,[lucide.dev](https://lucide.dev)),`currentColor` 自动适配明暗主题
- 切换工作区/会话自动跟随并重建大纲

## 安装

本插件是官方规范的**组合包**(`dsh.bundle` manifest + `dsh.client` 声明),纯 JavaScript、无构建步骤,推荐用官方 CLI 安装:

```sh
# 方式一:npm(发布后,用户无需任何构建授权)
dsh plugin --profile web add dsh-conversation-navigator

# 方式二:GitHub(纯 JS 包无需 prepare/allowBuilds,直接可用)
dsh plugin --profile web add github:gjj-star/dsh-conversation-navigator

# 方式三:本地 tarball
pnpm pack
dsh plugin --profile web add ./dsh-conversation-navigator-<version>.tgz
```

`dsh plugin` 在 profile 目录内转发给 pnpm,因此需要 **pnpm 在 PATH 上**;安装会自动把本包追加进 profile 的 `dsh.profile.bundles`,其自带的 `cordis.patch.yml` 层负责插入插件行。重启 `dsh web` 后生效,面板默认展开。

> 手动方式(不依赖 pnpm):把仓库放进 `<DSH_HOME>\profiles\<profile>\node_modules\dsh-conversation-navigator`,并在 profile 的 `cordis.patch.yml` 顶层数组追加 [`example.patch.yml`](./example.patch.yml) 的内容。

## 更新

修改 `lib/client.js` 后重启 `dsh web` 即可;仅面板位置、停靠状态与极简左/右对齐持久化于 localStorage(`dsh-cnvnav:ui:v1`),展开/折叠、模式、搜索关键词等界面状态仍只存于页面会话内。

## 工作原理

- 注册槽位:`conversation.session.header.utilities`(标题栏「导航」开关)+ `shell.overlay`(浮动面板)
- 数据来源:会话级标准 props 的 `useSession`(选择 `ConversationSnapshot.chat` 的稳定渲染顺序 `order` + `ChatNodeStore`),按 `node.location` 的 turn 分组
- 历史补载:通过 `sessions` 服务的 `binding(sessionId).session.loadOlder()` 分页向后加载,「加载全部」循环至 `hasMore=false`
- 跳转定位:复用 DSH 聊天视图自身的稳定 DOM 锚点 `[data-chat-anchor-key]`(与产品内部 paging/scroll 定位同源),`scrollIntoView` 平滑滚动
- 位置跟踪:捕获 `[data-conversation-scroll]` 滚动容器的 scroll 事件(节流 120ms),计算视口顶部首个可见节点
- 关键词过滤:仅为 `user` 与 `assistant-step` 节点提取检索文本(`dialogueText`),大小写不敏感匹配,命中片段以 `<mark>` 高亮并按首个命中位置截取显示窗口
- 悬停全文:轮次头气泡读取 `fullDialogueText`(用户节点全部文本块拼接),用 `Tooltip` 展示并限宽 340px
- 显示/隐藏/极简模式:`viewMode` 四态循环(full/hidden/minimal/minimal-left),隐藏时仅把轮次头标题替换为轨迹徽标(`titleNode` 策略);极简右对齐由 CSS `right` 锚定视口右缘、左对齐以 `scrollport.left + 12` 钉在对话区左缘(定位 key 含 `r.left`,并用 ResizeObserver 监听对话区宽度变化,左侧栏展开/折叠时紧贴跟随);搜索框展开时按钮让位
- 拖动定位与持久化:面板头部拖拽(pointer events,视口夹边),拖动或图钉切换 `docked` 状态;`place()` 对自由放置的面板只做视口夹边、不再自动停靠;位置、停靠状态与对齐选择存于 localStorage(`dsh-cnvnav:ui:v1`)
- 样式:`Button`/`Tooltip`/搜索与关闭图标复用 `@deepseek-ai/dsh-client-ui-primitives`,其余图标为 Lucide 内联 SVG(ISC License);面板容器自建 `<style>` 注入,颜色使用 `--dsw-*` 主题 token;插件卸载时随 fiber 清理

## 兼容性说明

- 目标平台:DSH Web 端(`dsh.client.platform: web`),依赖内核 seed 的 `react`、`slots`、`sessions` 服务与 `@deepseek-ai/dsh-client-ui-primitives`,以及 `dsh-client-runtime`、`dsh-client-ui-conversation` 提供的标准能力(`dsh.client.inject` 已声明 runtime 与 conversation)
- **版本敏感点**:`[data-chat-anchor-key]` / `[data-conversation-scroll]` 是当前 DSH 聊天视图的 DOM 锚点约定,DSH 升级后若锚点变化,只需调整 `lib/client.js` 中 `findAnchor` / `computeActiveKey` 两个函数
- 未声明 `timer` 硬依赖:客户端的 timer 服务存在则用于节流,不存在时自动退化为未节流模式

## 目录结构

```
lib/
  index.js   # 宿主侧空入口(纯浏览器插件)
  client.js  # 浏览器端完整实现(window.__ModuleLoader__ 模块格式)
assets/
  screenshots/   # 截图(README 主图 + 市场截图墙)
cordis.patch.yml     # 组合包补丁层(插入插件行)
example.patch.yml    # 手动安装时的补丁示例
```

## License

MIT
