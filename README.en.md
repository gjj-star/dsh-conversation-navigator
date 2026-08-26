# DSH Conversation Navigator (dsh-conversation-navigator)

[English](README.en.md) | [中文](README.md)

[![npm](https://img.shields.io/npm/v/dsh-conversation-navigator?style=flat-square&color=blue)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![downloads](https://img.shields.io/npm/dm/dsh-conversation-navigator?style=flat-square&color=blue)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![stars](https://img.shields.io/github/stars/gjj-star/dsh-conversation-navigator?style=flat-square&color=green)](https://github.com/gjj-star/dsh-conversation-navigator)
[![license](https://img.shields.io/github/license/gjj-star/dsh-conversation-navigator?style=flat-square&color=teal)](https://github.com/gjj-star/dsh-conversation-navigator)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?style=flat-square)](https://www.npmjs.com/package/dsh-conversation-navigator)
[![awesome · DSH plugin](https://awesome-dsh-plugin.com/badge.svg)](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek_Harness-Plugin-blue?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)

A **DeepSeek Harness (DSH) Web conversation navigator panel**: a turn-folded outline floating on the **right** side of the conversation page. Click any node to smooth-jump, watch the current reading position highlight as you scroll, with step badges colored to match the built-in "Trajectory" view.

Browser-only (no host behavior), plain JavaScript, zero build step, zero npm dependencies (buttons/tooltips reuse the official primitives from the DSH kernel seed).

![Full mode](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-main.png)
![Hidden mode](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-no-round.png)
![Minimal mode · collapsed](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-minimal-hide.png)
![Minimal mode · expanded](https://raw.githubusercontent.com/gjj-star/dsh-conversation-navigator/main/assets/modes/mode-minimal-expand.png)

> Four forms: full, hidden, minimal-right, and minimal-left (the minimal strips collapse to the in-row indicator bars; hover expands the positioning panel). More screenshots in [assets/screenshots](./assets/screenshots). The two "community skins" shots are taken under third-party skins (whale-girl maid theme and the "Your Name" theme), not bundled with the plugin.

## Features

- **Turn-folded outline**: shows "Turn N + your question" rows by default, long conversations at a glance
- **Keyword filter**: click the top-left search icon to reveal the inline input; matches only your questions + the assistant's actual reply text (context, tool calls, commands, compaction and reasoning never match); hits are highlighted and the list text is windowed to the keyword
- **Expand / collapse steps**: the arrow button on the right of each turn row (`▸ N`, rotates to `▾` when expanded) smoothly expands or collapses the turn's step details (assistant replies, tool calls, commands, compaction points, etc.)
- **Hover full text**: rest the mouse on a turn row and a bubble shows the user's complete question, no longer truncated to one line
- **Full / Hidden / Minimal modes**: the header toggle cycles four states —
  - **Full**: the classic grouped view (system events like compaction are shown bold, at the same level as turns)
  - **Hidden**: every row is a trajectory badge + text (user = business blue, assistant = violet, compaction = neutral gray)
  - **Minimal-right**: the indicator-bar strip docked to the right edge of the viewport
  - **Minimal-left**: the same strip pinned to the left edge of the conversation area (at the right border of the DSH sidebar), leaving the right side for dsh-better-sidebar
  - The minimal strip collapses to the in-row indicator bars (current = solid brand color, others = 40% foreground-color mix); hovering expands a fixed 7-row positioning panel (click to jump, hover bubble for the full question, thumb-only scrollbar beyond 7 rows; right-aligned expands from right to left, left-aligned from left to right); a floating button above the bars keeps cycling forward (minimal-right → minimal-left → Full); the toggle yields while the search input is open
- **Draggable panel**: in Full / Hidden mode, grab the header to drag the panel anywhere in the viewport (auto-clamped to the edges); the pin button in the header toggles between the default right-dock and the last dragged position; the dragged position and the minimal left/right alignment survive page reloads via localStorage
- **Silky motion**: panel fade, step expand/collapse height transitions, staggered fade-in of filter results, rotating collapse arrow — all pure CSS, zero dependencies
- **Click to locate**: click a turn or a step to smooth-scroll the conversation to that exact position (fold state is preserved)
- **Load earlier / Load all**: two buttons on top — "Load earlier" pages one batch back, "Load all" loads every historical turn into the navigator for arbitrary jumps (the page itself stays lazily loaded until you click)
- **Position tracking**: scrolling the conversation highlights and follows the turn you are currently reading
- **Right-side docking (default)**: the panel is anchored to the right edge of the viewport and stays put when the left sidebar collapses or expands; unpin (drag it or hit the pin) to place it anywhere
- **Back to latest / Collapse all**: two shortcut buttons at the bottom
- **Trajectory colors**: user/steering = business blue, context = success green, assistant = violet, tool = amber, compaction = neutral gray (`--dsw` theme tokens matching the built-in trajectory view, light/dark adaptive)
- **Native DSH look**: action buttons reuse the official `Button`/`Tooltip` components and official icons (search, close); the remaining icons (navigate, load earlier, load all, back to latest, collapse all, switch modes, …) are inline SVGs drawn in the DSH stroke style, `currentColor` adaptive to light/dark themes
- Follows workspace/session switches automatically and rebuilds the outline

## Install

This plugin is a spec-compliant **bundle** (`dsh.bundle` manifest + `dsh.client` declaration), plain JavaScript with no build step. Install with the official CLI:

```sh
# Option 1: npm (no build authorization needed once published)
dsh plugin --profile web add dsh-conversation-navigator

# Option 2: GitHub (pure JS package, no prepare/allowBuilds required)
dsh plugin --profile web add github:gjj-star/dsh-conversation-navigator

# Option 3: local tarball
pnpm pack
dsh plugin --profile web add ./dsh-conversation-navigator-<version>.tgz
```

`dsh plugin` forwards to pnpm inside the profile directory, so **pnpm must be on your PATH**; installation appends this package to the profile's `dsh.profile.bundles`, and its bundled `cordis.patch.yml` layer inserts the plugin row. Restart `dsh web` and the panel appears (expanded by default).

> Manual install (no pnpm): place the repo at `<DSH_HOME>\profiles\<profile>\node_modules\dsh-conversation-navigator` and append the content of [`example.patch.yml`](./example.patch.yml) to the top-level array of the profile's `cordis.patch.yml`.

## Updates

Edit `lib/client.js` and restart `dsh web`. Only the panel position, docked state and minimal alignment persist (localStorage `dsh-cnvnav:ui:v1`); expand/collapse, mode selection and search keywords still live only within the page session.

## How it works

- Slots: `conversation.session.header.utilities` (the "导航" toggle in the title bar) + `shell.overlay` (the floating panel)
- Data: the session-level standard props `useSession` (selects the stable render order `order` of `ConversationSnapshot.chat` + the `ChatNodeStore`), grouped by `node.location` turn
- History backfill: pages back through `sessions`'s `binding(sessionId).session.loadOlder()`, "Load all" loops until `hasMore=false`
- Jumping: reuses the DSH chat view's own stable DOM anchor `[data-chat-anchor-key]` (the same anchor the product uses internally for paging/scroll positioning) with `scrollIntoView` smooth scrolling
- Position tracking: captures scroll events on the `[data-conversation-scroll]` container (throttled 120ms) and computes the first visible node at the viewport top
- Keyword filter: extracts searchable text only for `user` and `assistant-step` nodes (`dialogueText`), case-insensitive matching, hits wrapped in `<mark>` and the display windowed around the first hit
- Hover full text: the turn-row bubble reads `fullDialogueText` (all text blocks of the user node joined), shown via `Tooltip` with a 340px width cap
- Modes: the header button cycles `viewMode` (full/hidden/minimal/minimal-left); hidden replaces the turn head title with a trajectory badge (`titleNode` strategy); minimal-right is docked by CSS `right`, minimal-left is pinned to `scrollport.left + 12` (the placement key includes `r.left` and a ResizeObserver on the chat area re-anchors it whenever the left sidebar expands or collapses); the toggle yields while the search input is open
- Drag & persistence: the full-panel header is draggable (pointer events, clamped to the viewport); dragging or the pin toggles `docked`; `place()` only clamps a freely-placed panel into the viewport instead of re-docking it; the position, docked state and alignment choice persist in localStorage (`dsh-cnvnav:ui:v1`)
- Styling: `Button`/`Tooltip`/search & close icons reuse `@deepseek-ai/dsh-client-ui-primitives`, the rest are inline SVGs; the panel injects its own `<style>` element, colors use `--dsw-*` theme tokens; everything is cleaned up with the fiber on unload

## Compatibility

- Target platform: DSH Web (`dsh.client.platform: web`), depends on the kernel seed's `react`, `slots`, `sessions` services and `@deepseek-ai/dsh-client-ui-primitives`, plus the standard capabilities provided by `dsh-client-runtime` and `dsh-client-ui-conversation` (`dsh.client.inject` declares runtime and conversation)
- **Version-sensitive points**: `[data-chat-anchor-key]` / `[data-conversation-scroll]` are the current DOM anchor conventions of the DSH chat view; if they change after a DSH upgrade, only `findAnchor` / `computeActiveKey` in `lib/client.js` need adjusting
- No hard `timer` dependency: the client timer service is used for throttling when present, and degrades to unthrottled otherwise

## Structure

```
lib/
  index.js   # empty host entry (browser-only plugin)
  client.js  # full browser implementation (window.__ModuleLoader__ module format)
assets/
  screenshots/   # screenshots (README hero + market gallery)
cordis.patch.yml     # bundle patch layer (inserts the plugin row)
example.patch.yml    # patch example for manual installs
```

## License

MIT
