window.__ModuleLoader__.load({
	id: "dsh-conversation-navigator",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const { Button, Tooltip, IconCloseOutline16, IconSearchOutline16 } = require("@deepseek-ai/dsh-client-ui-primitives");

/* ---------- 自绘图标: Lucide (ISC License, https://lucide.dev)
		   24px 网格 / 2px 描边 / 圆角线帽, 与 DSH 官方描边图标同一视觉语言 ---------- */
	function ToggleIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "M3 5h.01" }),
			React.createElement("path", { d: "M3 12h.01" }),
			React.createElement("path", { d: "M3 19h.01" }),
			React.createElement("path", { d: "M8 5h13" }),
			React.createElement("path", { d: "M8 12h13" }),
			React.createElement("path", { d: "M8 19h13" }),
		);
	}
	function LoadEarlierIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "M5 3h14" }),
			React.createElement("path", { d: "m18 13-6-6-6 6" }),
			React.createElement("path", { d: "M12 7v14" }),
		);
	}
	function LoadAllIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "m17 11-5-5-5 5" }),
			React.createElement("path", { d: "m17 18-5-5-5 5" }),
		);
	}
	function JumpLatestIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "M12 17V3" }),
			React.createElement("path", { d: "m6 11 6 6 6-6" }),
			React.createElement("path", { d: "M19 21H5" }),
		);
	}
	function CollapseAllIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "m14 10 7-7" }),
			React.createElement("path", { d: "M20 10h-6V4" }),
			React.createElement("path", { d: "m3 21 7-7" }),
			React.createElement("path", { d: "M4 14h6v6" }),
		);
	}

	function SwitchTurnsIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "M8 3 4 7l4 4" }),
			React.createElement("path", { d: "M4 7h16" }),
			React.createElement("path", { d: "m16 21 4-4-4-4" }),
			React.createElement("path", { d: "M20 17H4" }),
		);
	}

	function PinIcon() {
		return React.createElement("svg", {
			viewBox: "0 0 24 24", width: 14, height: 14, fill: "none",
			stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
			"aria-hidden": true,
		},
			React.createElement("path", { d: "M12 17v5" }),
			React.createElement("path", { d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" }),
		);
	}

		/* ---------- own stylesheet (static packages have no styles builtin) ---------- */
		const CSS = `
.cnvnav-panel {
  position: fixed; z-index: 9999; width: 288px;
  display: flex; flex-direction: column;
  pointer-events: auto;
  background: var(--dsw-alias-bg-overlay, #fff);
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.35));
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,.22);
  font-family: system-ui, -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  color: var(--dsw-alias-label-primary, #222);
  overflow: hidden;
  transition: opacity .18s ease, transform .18s ease;
}
.cnvnav-panel-hidden { opacity: 0; transform: translateY(-6px) scale(.985); pointer-events: none; }
.cnvnav-panel-unplaced { visibility: hidden; }
.cnvnav-head {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.35));
}
.cnvnav-count { color: var(--dsw-alias-label-secondary, #888); font-size: 11px; }
.cnvnav-search { flex: none; display: flex; }
.cnvnav-turns-toggle { flex: none; display: flex; }
.cnvnav-close { margin-left: auto; }
.cnvnav-list {
  overflow-y: auto; padding: 6px; min-height: 0;
  display: flex; flex-direction: column; gap: 2px;
}
.cnvnav-group { display: flex; flex-direction: column; margin-bottom: 2px; }
.cnvnav-group-row {
  display: flex; align-items: stretch;
  border-radius: 8px; overflow: hidden;
  position: relative;
  transition: background .16s ease;
}
.cnvnav-group-row:hover { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); }
.cnvnav-group-row-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 13%, transparent); }
.cnvnav-group-row-active::before {
  content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px;
  width: 3px; border-radius: 2px;
  background: var(--dsw-alias-brand-primary, #4f46e5);
}
.cnvnav-group-row-active:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 18%, transparent); }
.cnvnav-group-row-active .cnvnav-group-title { color: var(--dsw-alias-brand-primary, #4f46e5); }
.cnvnav-group-row-active .cnvnav-group-sub { color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 45%, var(--dsw-alias-label-secondary, #888)); }
.cnvnav-group-head-wrap { flex: 1; min-width: 0; display: flex; }
.cnvnav-group-head {
  width: 100%;
  display: flex; align-items: baseline; gap: 6px; text-align: left;
  border: none; background: transparent; cursor: pointer;
  padding: 5px 0 5px 17px;
  color: var(--dsw-alias-label-primary, #222);
}
.cnvnav-group-title { font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif); font-size: 14px; font-weight: 700; line-height: 20px; white-space: nowrap; transition: color .16s ease; }
.cnvnav-group-head .cnvnav-badge { align-self: center; }
.cnvnav-group-sub {
  color: var(--dsw-alias-label-secondary, #888);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  flex: 1; min-width: 0;
}
.cnvnav-chevron-wrap { flex: none; display: flex; }
.cnvnav-chevron {
  min-width: 30px; align-self: stretch;
  display: flex; align-items: center; justify-content: center; gap: 3px;
  border: none; background: transparent; cursor: pointer;
  color: var(--dsw-alias-label-secondary, #888);
  font-size: 11px; line-height: 1; padding: 0 8px;
  white-space: nowrap;
  transition: color .16s ease, background .16s ease;
}
.cnvnav-chevron:hover { color: var(--dsw-alias-brand-primary, #4f46e5); background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); }
.cnvnav-chevron-icon { flex: none; display: block; transition: transform .2s cubic-bezier(.4, 0, .2, 1); }
.cnvnav-chevron[aria-expanded="true"] .cnvnav-chevron-icon { transform: rotate(90deg); }
.cnvnav-chevron-count { font-size: 11px; line-height: 1; }
.cnvnav-steps { display: grid; grid-template-rows: 1fr; margin-top: 2px; transition: grid-template-rows .24s cubic-bezier(.4, 0, .2, 1), margin-top .24s cubic-bezier(.4, 0, .2, 1); }
.cnvnav-steps-collapsed { grid-template-rows: 0fr; margin-top: 0; }
.cnvnav-steps-inner { overflow: hidden; min-height: 0; display: flex; flex-direction: column; gap: 2px; }
.cnvnav-fade-item { animation: cnvnav-fade-up .2s ease-out backwards; }
@keyframes cnvnav-fade-up { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
.cnvnav-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  border: none; background: transparent; cursor: pointer;
  padding: 5px 8px 5px 22px; border-radius: 8px; position: relative;
  color: var(--dsw-alias-label-primary, #222);
  transition: background .16s ease;
}
.cnvnav-item:hover { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); }
.cnvnav-item-active { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 13%, transparent); }
.cnvnav-item-active:hover { background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 18%, transparent); }
.cnvnav-item-active .cnvnav-item-preview { color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 60%, var(--dsw-alias-label-primary, #222)); }
.cnvnav-item-active::before,
.cnvnav-item-active::after {
  content: ''; position: absolute; left: 6px; width: 3px; border-radius: 2px;
  background: var(--dsw-alias-brand-primary, #4f46e5);
}
.cnvnav-item-active::before { top: 6px; height: calc(50% - 7.5px); }
.cnvnav-item-active::after { bottom: 6px; height: calc(50% - 7.5px); }
.cnvnav-badge {
  flex: none; min-width: 36px; box-sizing: border-box;
  display: inline-flex; align-items: center; justify-content: center;
  height: 19px; padding: 0 5px; border-radius: 4px;
  font-size: 10px; font-weight: 650; line-height: 1;
  letter-spacing: .035em; white-space: nowrap;
}
.cnvnav-badge-traj-user { color: var(--dsw-alias-state-business-primary, #4f46e5); background: var(--dsw-alias-state-business-tertiary, rgba(79,70,229,.14)); }
.cnvnav-badge-traj-context { color: color-mix(in srgb, var(--dsw-alias-state-success-primary, #0e9f6e) 68%, var(--dsw-alias-label-secondary, #888)); background: var(--dsw-alias-state-success-tertiary, rgba(14,159,110,.14)); }
.cnvnav-badge-traj-assistant { color: color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color, #7c3aed) 60%, var(--dsw-alias-state-error-secondary, #b91c1c)); background: color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-brand-primary-new-colorprimary-new-color, #7c3aed) 55%, var(--dsw-alias-state-error-secondary, #b91c1c)) 15%, var(--dsw-alias-bg-layer-1, transparent)); }
.cnvnav-badge-traj-tool { color: var(--dsw-alias-state-warn-label, #b45309); background: var(--dsw-alias-state-warn-tertiary, rgba(180,83,9,.14)); }
.cnvnav-badge-traj-compacted { color: var(--dsw-alias-label-secondary, #888); background: var(--dsw-alias-bg-module-platform, rgba(128,128,128,.12)); }
.cnvnav-badge-other-command { color: #1d4ed8; background: rgba(29,78,216,.13); }
.cnvnav-badge-other-error { color: var(--dsw-alias-state-error-primary, #dc2626); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 14%, transparent); }
.cnvnav-badge-other-retry { color: #ea580c; background: rgba(234,88,12,.14); }
.cnvnav-badge-other-neutral { color: var(--dsw-alias-label-secondary, #888); background: var(--dsw-alias-bg-module-platform, rgba(128,128,128,.12)); }
.cnvnav-item-preview {
  flex: 1; min-width: 0; display: block;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--dsw-alias-label-secondary, #888);
}
.cnvnav-item-time {
  flex: none; color: var(--dsw-alias-label-secondary, #888); font-size: 10px; opacity: .8;
}
.cnvnav-hl {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 30%, transparent);
  color: inherit; border-radius: 2px; padding: 0 1px; font-weight: 600;
}
.cnvnav-empty { padding: 18px 10px; text-align: center; color: var(--dsw-alias-label-secondary, #888); }
/* ---------- 极简模式 ---------- */
.cnvnav-mini-wrap {
  position: fixed; z-index: 9999; right: 12px;
  pointer-events: auto;
  transition: opacity .18s ease, transform .18s ease;
}
.cnvnav-mini-panel {
  width: 18px; height: 220px; overflow: hidden;
  position: relative;
  display: flex; flex-direction: column;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  box-shadow: none;
  transition: width .18s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease;
}
.cnvnav-mini-wrap:hover .cnvnav-mini-panel {
  width: 288px;
  background: var(--dsw-alias-bg-overlay, #fff);
  border-color: var(--dsw-alias-border-l1, rgba(128,128,128,.35));
  box-shadow: 0 16px 48px rgba(0,0,0,.22);
}
.cnvnav-mini-fab {
  position: absolute; bottom: 100%; right: -8px;
  margin-bottom: 6px;
  display: flex;
}
.cnvnav-mini-list {
  flex: 1; min-height: 0; width: 288px; box-sizing: border-box;
  overflow-y: auto; padding: 4px;
  display: flex; flex-direction: column; gap: 2px;
}
/* dsweb 式滚动条: 只显示滑块, 无滑轨无上下按钮.
   面板列表与极简条统一; 鼠标移上列表(极简条展开)时才显示滑块,
   平时隐藏避免视觉噪音. Chromium 用 webkit 伪元素(标准属性会令其失效),
   Firefox 用 @supports 标准属性 */
.cnvnav-list::-webkit-scrollbar,
.cnvnav-mini-list::-webkit-scrollbar { width: 4px; }
.cnvnav-list::-webkit-scrollbar-track,
.cnvnav-mini-list::-webkit-scrollbar-track { background: transparent; }
.cnvnav-list::-webkit-scrollbar-thumb,
.cnvnav-mini-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 2px;
}
.cnvnav-list:hover::-webkit-scrollbar-thumb,
.cnvnav-mini-list:hover::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #888) 40%, transparent);
}
.cnvnav-list::-webkit-scrollbar-button,
.cnvnav-mini-list::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
.cnvnav-list::-webkit-scrollbar-corner,
.cnvnav-mini-list::-webkit-scrollbar-corner { background: transparent; }
@supports (-moz-appearance: none) {
  .cnvnav-list,
  .cnvnav-mini-list {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }
  .cnvnav-list:hover,
  .cnvnav-mini-list:hover {
    scrollbar-color: color-mix(in srgb, var(--dsw-alias-label-secondary, #888) 40%, transparent) transparent;
  }
}
.cnvnav-mini-item {
  flex: none; height: 28px; box-sizing: border-box; width: 100%;
  display: flex; align-items: center; text-align: left;
  border: none; background: transparent; cursor: pointer;
  padding: 5px 8px 5px 17px; border-radius: 8px; position: relative;
  color: var(--dsw-alias-label-secondary, #888);
  font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  transition: background .16s ease;
}
.cnvnav-mini-item:hover { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); }
/* 每行都有指示竖条: 非当前=掺前景色(浅色主题掺黑/深色主题掺白, 40%), 当前=品牌色实色 */
.cnvnav-mini-item::before {
  content: ''; position: absolute; left: 6px; top: 6px; bottom: 6px;
  width: 3px; border-radius: 2px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary, #222) 40%, transparent);
  transition: background .16s ease;
}
.cnvnav-mini-item-active {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 13%, transparent);
  color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 60%, var(--dsw-alias-label-primary, #222));
}
.cnvnav-mini-item-active::before { background: var(--dsw-alias-brand-primary, #4f46e5); }
.cnvnav-filter {
  flex: 1; min-width: 0; box-sizing: border-box;
  height: 28px; padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.35));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, rgba(128,128,128,.06));
  color: var(--dsw-alias-label-primary, #222);
  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif);
  font-size: 12px; outline: none;
  animation: cnvnav-search-in .16s ease-out;
}
.cnvnav-filter::placeholder { color: var(--dsw-alias-label-secondary, #888); }
.cnvnav-filter:focus { border-color: var(--dsw-alias-brand-primary, #4f46e5); }
@keyframes cnvnav-search-in {
  from { opacity: 0; transform: translateX(4px); }
  to { opacity: 1; transform: translateX(0); }
}
.cnvnav-topbar { display: flex; gap: 6px; margin: 6px 6px 0; }
.cnvnav-footer { display: flex; gap: 6px; margin: 0 6px 6px; }
.cnvnav-bar-btn { flex: 1; display: block; }
.cnvnav-bar-fill { width: 100%; }
/* ---------- 拖动定位与左对齐极简 ---------- */
.cnvnav-head { cursor: grab; touch-action: none; }
.cnvnav-dragging { cursor: grabbing; user-select: none; }
.cnvnav-dragging .cnvnav-head { cursor: grabbing; }
/* 模式切换按钮激活态: 与整行描边图标按钮同一视觉层级
   (实心 primary 填充夹在幽灵图标中间会显得"错位") */
.cnvnav-head button.cnvnav-toggle-on {
  color: var(--dsw-alias-brand-primary, #4f46e5);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 13%, transparent);
}
.cnvnav-head button.cnvnav-toggle-on:hover {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4f46e5) 20%, transparent);
}
.cnvnav-mini-wrap-left { right: auto; }
.cnvnav-mini-wrap-left .cnvnav-mini-fab { right: auto; left: -8px; }
`;

		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;
			const timer = ctx.get("timer");
			const sessions = ctx.get("sessions");

			/* own stylesheet with fiber-scoped cleanup */
			const styleEl = document.createElement("style");
			styleEl.setAttribute("data-dsh-cnvnav", "");
			styleEl.textContent = CSS;
			document.head.appendChild(styleEl);
			ctx.effect(() => () => styleEl.remove());

			/* ---------- shared store (toggle button + overlay panel) ---------- */
			const UI_KEY = "dsh-cnvnav:ui:v1";
			const VIEW_MODES = ["full", "hidden", "minimal", "minimal-left"];
			function readUi() {
				try {
					const raw = window.localStorage.getItem(UI_KEY);
					if (!raw) return {};
					const o = JSON.parse(raw);
					const out = {};
					if (VIEW_MODES.indexOf(o.viewMode) !== -1) out.viewMode = o.viewMode;
					if (o.docked === true || o.docked === false) out.docked = o.docked;
					if (o.userPos && typeof o.userPos.left === "number" && typeof o.userPos.top === "number"
						&& Number.isFinite(o.userPos.left) && Number.isFinite(o.userPos.top)) {
						out.userPos = { left: o.userPos.left, top: o.userPos.top };
					}
					return out;
				} catch (err) {
					return {};
				}
			}
			function persistUi() {
				try {
					window.localStorage.setItem(UI_KEY, JSON.stringify({
						viewMode: state.viewMode, docked: state.docked, userPos: state.userPos,
					}));
				} catch (err) { /* 隐私模式等场景忽略 */ }
			}
			const savedUi = readUi();
			let state = Object.assign({
				open: true, sessionId: null, outline: null, activeKey: null, expanded: {},
				hasMore: false, loadingOlder: false, loadingAll: false,
				viewMode: "full", docked: true, userPos: null,
			}, savedUi);
			const listeners = new Set();
			function setState(patch) {
				state = Object.assign({}, state, patch);
				listeners.forEach((fn) => { try { fn(); } catch (err) { console.error(err); } });
			}
			function subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; }
			function useStore() {
				const [snap, setSnap] = React.useState(state);
				React.useEffect(() => subscribe(() => setSnap(state)), []);
				return snap;
			}

			/* ---------- history paging ---------- */
			let loadingAll = false;
			function loadOlderPage() {
				if (sessions === undefined) return;
				const sid = state.sessionId;
				if (sid === null) return;
				const binding = sessions.binding(sid);
				if (binding === undefined) return;
				binding.session.loadOlder().catch((err) => console.error(err));
			}
			async function loadAllPages() {
				if (sessions === undefined || loadingAll) return;
				const sid = state.sessionId;
				if (sid === null) return;
				const binding = sessions.binding(sid);
				if (binding === undefined) return;
				loadingAll = true;
				setState({ loadingAll: true });
				try {
					let guard = 0;
					while (binding.session.getSnapshot().hasMore && guard < 500) {
						await binding.session.loadOlder();
						guard += 1;
					}
				} catch (err) {
					console.error(err);
				} finally {
					loadingAll = false;
					setState({ loadingAll: false });
				}
			}

			/* ---------- outline derivation from ConversationSnapshot ---------- */
			const KIND_META = {
				"user": { label: "你", cls: "traj-user" },
				"steering": { label: "插话", cls: "traj-user" },
				"context": { label: "上下文", cls: "traj-context" },
				"assistant-step": { label: "助手", cls: "traj-assistant" },
				"tool-call": { label: "工具", cls: "traj-tool" },
				"command": { label: "命令", cls: "other-command" },
				"compaction": { label: "压缩", cls: "traj-compacted" },
				"manual-compaction": { label: "压缩", cls: "traj-compacted" },
				"turn-error": { label: "出错", cls: "other-error" },
				"turn-max-tokens": { label: "截断", cls: "other-error" },
				"model-retry": { label: "重试", cls: "other-retry" },
				"workflow-run": { label: "流程", cls: "other-neutral" },
				"unknown": { label: "其他", cls: "other-neutral" },
			};
			function firstText(blocks) {
				if (!Array.isArray(blocks)) return null;
				for (const b of blocks) {
					if (!b || typeof b !== "object") continue;
					if ((b.type === "text" || b.kind === "text") && typeof b.text === "string" && b.text.trim() !== "") return b.text;
				}
				return null;
			}
			/* Searchable dialogue text: user questions + agent actual dialogue only
			   (excludes context, tool calls, commands, compaction, reasoning, etc.) */
			function dialogueText(node) {
				const d = node && node.data;
				if (!d || typeof d !== "object") return null;
				if (node.kind === "user") return firstText(d.content);
				if (node.kind === "assistant-step") {
					if (!Array.isArray(d.blocks)) return null;
					const parts = [];
					for (const b of d.blocks) {
						if (!b || typeof b !== "object") continue;
						if ((b.type === "text" || b.kind === "text") && typeof b.text === "string" && b.text.trim() !== "") parts.push(b.text.trim());
					}
					return parts.length > 0 ? parts.join(" ") : null;
				}
				return null;
			}
			/* Full user question text (all text blocks) for the hover bubble. */
		function fullDialogueText(node) {
			const d = node && node.data;
			if (!d || typeof d !== "object") return null;
			if (node.kind !== "user") return null;
			if (typeof d.content === "string") {
				const t = d.content.trim();
				return t === "" ? null : t;
			}
			if (!Array.isArray(d.content)) return null;
			const parts = [];
			for (const b of d.content) {
				if (!b || typeof b !== "object") continue;
				if ((b.type === "text" || b.kind === "text") && typeof b.text === "string" && b.text.trim() !== "") parts.push(b.text.trim());
			}
			return parts.length > 0 ? parts.join("\n") : null;
		}
		function previewFor(node) {
				const d = node && node.data;
				if (!d || typeof d !== "object") return null;
				switch (node.kind) {
					case "user":
					case "steering":
					case "context":
						return firstText(d.content);
					case "assistant-step": {
						const text = firstText(d.blocks);
						if (text !== null) return text;
						if (Array.isArray(d.blocks) && d.blocks.some((b) => b && b.kind === "tool-call")) return "调用工具";
						return d.status === "running" ? "进行中…" : null;
					}
					case "tool-call": {
						const root = d.root;
						if (!root || typeof root !== "object") return null;
						if (root.isError === true) return "执行失败";
						const name = typeof root.name === "string" ? root.name
							: (root.call && typeof root.call.name === "string" ? root.call.name : null);
						return name;
					}
					case "command":
						return typeof d.name === "string" ? d.name + (typeof d.args === "string" && d.args !== "" ? " " + d.args : "") : null;
					case "compaction":
						return typeof d.summary === "string" ? d.summary : "上下文已压缩";
					case "manual-compaction": {
						const c = d.compaction;
						if (c && typeof c.summary === "string") return c.summary;
						return "手动压缩";
					}
					case "turn-error":
						return typeof d.message === "string" ? d.message : "本轮出错";
					case "turn-max-tokens":
						return "达到输出上限";
					case "model-retry": {
						const n = Array.isArray(d.attempts) ? d.attempts.length : 0;
						return "自动重试" + (n > 0 ? " ×" + n : "…");
					}
					case "unknown":
						return typeof d.type === "string" ? "未知事件 " + d.type : "未知事件";
					default:
						return null;
				}
			}
			function timeOf(node) {
				const d = node && node.data;
				if (!d || typeof d !== "object") return null;
				const t = typeof d.time === "number" ? d.time
					: (d.root && typeof d.root.time === "number" ? d.root.time : null);
				return t;
			}
			function fmtTime(ms) {
				if (typeof ms !== "number" || !isFinite(ms)) return "";
				const d = new Date(ms);
				const h = d.getHours();
				const m = d.getMinutes();
				return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
			}
			function turnOf(node) {
				const loc = node && node.location;
				if (!loc) return null;
				if (loc.kind === "step" || loc.kind === "turn") return loc.turn.turn;
				return null;
			}
			function truncate(text, max) {
				if (typeof text !== "string") return "";
				if (text.length <= max) return text;
				return text.slice(0, max) + "…";
			}
			function deriveOutline(snap) {
				const empty = { groups: [], count: 0, byKey: {} };
				if (snap === null || snap === undefined) return empty;
				const order = snap.chat && snap.chat.order;
				const nodes = snap.chat && snap.chat.nodes;
				if (!Array.isArray(order) || nodes === undefined) return empty;
				const groups = [];
				const byKey = {};
				let current = null;
				let count = 0;
				for (const key of order) {
					const node = nodes.get(key);
					if (node === undefined) continue;
					const meta = KIND_META[node.kind] || KIND_META.unknown;
					const item = {
						key: node.key,
						kind: node.kind,
						label: meta.label,
						cls: meta.cls,
						preview: previewFor(node),
						search: dialogueText(node),
						full: fullDialogueText(node),
						time: fmtTime(timeOf(node)),
					};
					const turn = turnOf(node);
					if (turn === null) {
						groups.push({ turn: null, items: [item], gid: "x" + groups.length });
						count += 1;
						current = null;
						continue;
					}
					if (current === null || current.turn !== turn) {
						current = { turn: turn, items: [], gid: "t" + turn };
						groups.push(current);
					}
					current.items.push(item);
					count += 1;
				}
				for (const g of groups) {
					const first = g.items[0];
					if (g.turn === null) {
						g.title = first.label;
						g.subtitle = truncate(first.preview || "", 60);
						g.headKey = first.key;
						g.headIsUser = false;
					} else {
						g.title = "第 " + g.turn + " 轮";
						const head = first.kind === "user" ? first : null;
						g.headKey = head ? head.key : first.key;
						g.headIsUser = head !== null;
						g.subtitle = truncate((head ? head.preview : first.preview) || "", 60);
					}
					for (const it of g.items) byKey[it.key] = g.gid;
				}
				return { groups: groups, count: count, byKey: byKey };
			}
			let cacheKey = null;
			let cacheValue = null;
			function selectOutline(snap) {
				if (snap !== cacheKey) {
					cacheKey = snap;
					cacheValue = deriveOutline(snap);
				}
				return cacheValue;
			}

			/* ---------- DOM helpers: jump + position tracking ---------- */
			function findAnchor(key) {
				const rows = document.querySelectorAll("[data-chat-anchor-key]");
				for (const row of rows) {
					if (row.getAttribute("data-chat-anchor-key") === key) return row;
				}
				return null;
			}
			let lastActive = null;
			function jumpTo(key) {
				try {
					const el = findAnchor(key);
					if (el === null) return false;
					el.scrollIntoView({ behavior: "smooth", block: "start" });
					lastActive = key;
					setState({ activeKey: key });
					return true;
				} catch (err) {
					console.error(err);
					return false;
				}
			}
			function computeActiveKey() {
				try {
					const scrollport = document.querySelector("[data-conversation-scroll]");
					if (scrollport === null) return null;
					const vp = scrollport.getBoundingClientRect();
					const rows = document.querySelectorAll("[data-chat-anchor-key]");
					let found = null;
					for (const row of rows) {
						const rect = row.getBoundingClientRect();
						if (rect.bottom > vp.top) { found = row; break; }
					}
					if (found === null && rows.length > 0) found = rows[rows.length - 1];
					return found === null ? null : found.getAttribute("data-chat-anchor-key");
				} catch (err) {
					console.error(err);
					return null;
				}
			}

			let panelEl = null;
			let listEl = null;
			let dragMove = null;
			const itemEls = {};
			const groupEls = {};

			/* ---------- header toggle button ---------- */
			function ToggleButton(props) {
				const snap = useStore();
				const outline = props.useSession(selectOutline);
				const hasMore = props.useSession((s) => s.hasMore);
				const loadingOlder = props.useSession((s) => s.loadingOlder);
				React.useEffect(() => {
					setState({ sessionId: props.sessionId, outline: outline, hasMore: hasMore, loadingOlder: loadingOlder });
				}, [outline, props.sessionId, hasMore, loadingOlder]);
				React.useEffect(() => {
					if (state.sessionId !== null && state.sessionId !== props.sessionId) {
						lastActive = null;
						setState({ activeKey: null, expanded: {} });
					}
				}, [props.sessionId]);
				return React.createElement(Tooltip, {
					label: snap.open ? "收起会话导航" : "打开会话导航",
					side: "bottom",
					delayMs: 500,
				},
					React.createElement("span", null,
						React.createElement(Button, {
							variant: snap.open ? "primary" : "ghost",
							size: "sm",
							icon: React.createElement(ToggleIcon),
							"aria-pressed": snap.open,
							onClick: () => setState({ open: !snap.open }),
						}, "导航"),
					),
				);
			}

			/* ---------- floating navigator panel ---------- */
			function Panel() {
				const snap = useStore();
				const [filter, setFilter] = React.useState("");
				const [searchOpen, setSearchOpen] = React.useState(false);
				const viewMode = snap.viewMode; /* full | hidden | minimal | minimal-left */
				const turnsHidden = viewMode !== "full";
				function nextModeLabel() {
					return viewMode === "full" ? "隐藏轮次" : viewMode === "hidden" ? "极简·右" : viewMode === "minimal" ? "极简·左" : "显示轮次";
				}
				function cycleMode() {
					const next = viewMode === "full" ? "hidden" : viewMode === "hidden" ? "minimal" : viewMode === "minimal" ? "minimal-left" : "full";
					setState({ viewMode: next });
					persistUi();
				}
				function toggleSearch() {
					if (searchOpen) setFilter("");
					setSearchOpen(!searchOpen);
				}
				/* ---------- 拖动定位(仅面板形式, 极简条不参与) ---------- */
				function startDrag(e) {
					if (e.button !== 0) return;
					if (typeof e.target.closest === "function" && e.target.closest("button") !== null) return;
					const el = panelEl;
					if (el === null) return;
					dragMove = { startX: e.clientX, startY: e.clientY, baseLeft: el.offsetLeft, baseTop: el.offsetTop, el: el, dragging: false };
					try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* 忽略捕获失败 */ }
				}
				function moveDrag(e) {
					const d = dragMove;
					if (d === null) return;
					const dx = e.clientX - d.startX;
					const dy = e.clientY - d.startY;
					if (!d.dragging && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
						d.dragging = true;
						d.el.classList.add("cnvnav-dragging");
					}
					if (!d.dragging) return;
					const vw = document.documentElement.clientWidth || 1000;
					const vh = document.documentElement.clientHeight || 800;
					const w = d.el.offsetWidth || 288;
					const h = d.el.offsetHeight || 200;
					const left = Math.min(Math.max(8, d.baseLeft + dx), Math.max(8, vw - w - 8));
					const top = Math.min(Math.max(8, d.baseTop + dy), Math.max(8, vh - h - 8));
					d.el.style.left = Math.round(left) + "px";
					d.el.style.top = Math.round(top) + "px";
				}
				function endDrag() {
					const d = dragMove;
					dragMove = null;
					if (d === null || !d.dragging) return;
					d.el.classList.remove("cnvnav-dragging");
					const r = d.el.getBoundingClientRect();
					/* 拖完同步封顶(与 place() 浮动分支一致): 上边缘固定, 高度至多半屏 */
					const vh = document.documentElement.clientHeight || 800;
					d.el.style.maxHeight = Math.max(160, Math.round(Math.min(vh / 2, vh - Math.max(8, Math.round(r.top)) - 8))) + "px";
					setState({ docked: false, userPos: { left: Math.round(r.left), top: Math.round(r.top) } });
					persistUi();
				}

				React.useEffect(() => {
					if (!snap.open) return;
					let lastKey = null;
					let stableTicks = 0;
					let misses = 0;
					function place() {
						const panel = panelEl;
						if (panel === null) return false;
						if (dragMove !== null) return true;
						const vw = document.documentElement.clientWidth || 1000;
						const vh = document.documentElement.clientHeight || 800;
						const mini = viewMode === "minimal" || viewMode === "minimal-left";
						const alignLeft = viewMode === "minimal-left";
						/* 面板被拖走后不再自动停靠: 夹进视口、上边缘固定, 展开高度至多半屏以便下方留白 */
						if (!mini && !state.docked && state.userPos !== null) {
							const w = panel.offsetWidth || 288;
							const h = panel.offsetHeight || 200;
							const left = Math.min(Math.max(8, Math.round(state.userPos.left)), Math.max(8, vw - w - 8));
							const top = Math.min(Math.max(8, Math.round(state.userPos.top)), Math.max(8, vh - h - 8));
							panel.style.maxHeight = Math.max(160, Math.round(Math.min(vh / 2, vh - top - 8))) + "px";
							panel.style.left = left + "px";
							panel.style.top = top + "px";
							panel.classList.remove("cnvnav-panel-unplaced");
							return true;
						}
						const sp = document.querySelector("[data-conversation-scroll]");
						const width = 288;
						const MINI_H = 220;
						if (sp === null) {
							/* 会话视图可能尚未挂载(刷新/重启/切会话时面板先就位);
							   非会话页(设置页等)则永远没有该容器。
							   连续 15 次(约 6s)仍未出现才回退到视口定位, 否则保持隐藏等待校准。 */
							misses += 1;
							if (misses >= 15) {
								if (mini) {
									/* 极简: 水平锚定, 右对齐由 CSS right 负责, 左对齐钉在视口左侧 */
									if (alignLeft) {
										panel.style.left = "12px";
										panel.style.right = "auto";
									} else {
										panel.style.left = "";
										panel.style.right = "";
									}
									panel.style.top = Math.max(8, Math.round((vh - MINI_H) / 2)) + "px";
									panel.style.maxHeight = MINI_H + "px";
								} else {
									panel.style.left = Math.max(8, vw - width - 12) + "px";
									panel.style.top = Math.max(8, 60) + "px";
									panel.style.maxHeight = Math.round(vh - 90) + "px";
								}
								panel.classList.remove("cnvnav-panel-unplaced");
								return true;
							}
							return false;
						}
						const r = sp.getBoundingClientRect();
						const key = mini
							? [Math.round(r.left), Math.round(r.top), Math.round(r.height), Math.round(vh)].join("|")
							: [Math.round(r.top), Math.round(r.height), Math.round(vw), Math.round(vh)].join("|");
						if (key !== lastKey) {
							lastKey = key;
							if (mini) {
								/* 极简: 右对齐由 CSS(right)锚定视口右缘, 左对齐钉在对话区左缘 */
								if (alignLeft) {
									panel.style.left = Math.max(8, Math.round(r.left + 12)) + "px";
									panel.style.right = "auto";
								} else {
									panel.style.left = "";
									panel.style.right = "";
								}
								panel.style.top = Math.max(8, Math.round(r.top + (r.height - MINI_H) / 2)) + "px";
								panel.style.maxHeight = MINI_H + "px";
							} else {
								panel.style.left = Math.max(8, vw - width - 12) + "px";
								panel.style.top = Math.max(8, Math.round(r.top + 8)) + "px";
								panel.style.maxHeight = Math.round(Math.min(r.height - 24, vh - 40)) + "px";
							}
						}
						panel.classList.remove("cnvnav-panel-unplaced");
						return true;
					}
					place();
					/* 每 400ms 复查: 容器出现即校准; 布局连续 3 次无变化后停止 */
					let id = setInterval(() => {
						const before = lastKey;
						if (!place()) return;
						if (lastKey !== null && lastKey === before) {
							stableTicks += 1;
							if (stableTicks >= 3) clearInterval(id);
						} else {
							stableTicks = 0;
						}
					}, 400);
					window.addEventListener("resize", place);
					/* 左对齐极简条需跟随左侧栏展开/折叠: 对话区宽度变化时重新校准 */
					let ro = null;
					const roTarget = document.querySelector("[data-conversation-scroll]");
					if (typeof ResizeObserver === "function" && roTarget !== null) {
						ro = new ResizeObserver(() => { place(); });
						ro.observe(roTarget);
					}
					return () => {
						clearInterval(id);
						window.removeEventListener("resize", place);
						if (ro !== null) ro.disconnect();
					};
				}, [snap.open, snap.sessionId, viewMode]);

				React.useEffect(() => {
					if (!snap.open) return;
					const run = () => {
						const key = computeActiveKey();
						if (key !== lastActive) {
							lastActive = key;
							setState({ activeKey: key });
						}
					};
					const update = timer !== undefined ? timer.throttle(run, 120) : run;
					document.addEventListener("scroll", update, true);
					window.addEventListener("resize", update);
					run();
					return () => {
						document.removeEventListener("scroll", update, true);
						window.removeEventListener("resize", update);
						if (timer !== undefined && typeof update.dispose === "function") update.dispose();
					};
				}, [snap.open]);

				React.useEffect(() => {
					if (!snap.open || snap.activeKey === null) return;
					let target = itemEls[snap.activeKey];
					if (target === undefined || target === null || (typeof target.closest === "function" && target.closest(".cnvnav-steps-collapsed") !== null)) {
						const gid = snap.outline !== null ? snap.outline.byKey[snap.activeKey] : undefined;
						if (gid !== undefined) target = groupEls[gid];
					}
					const list = listEl;
					if (target !== undefined && target !== null && list !== null) {
						const lr = list.getBoundingClientRect();
						const er = target.getBoundingClientRect();
						const rel = er.top - lr.top + list.scrollTop;
						if (rel < list.scrollTop || rel + er.height > list.scrollTop + list.clientHeight) {
							list.scrollTo({ top: Math.max(0, rel - list.clientHeight / 2), behavior: "smooth" });
						}
					}
				}, [snap.open, snap.activeKey]);

				const groups = snap.outline !== null ? snap.outline.groups : [];
				const count = snap.outline !== null ? snap.outline.count : 0;
				const hasExpanded = Object.keys(snap.expanded).some((k) => snap.expanded[k] === true);

				/* ---------- 极简模式(右/左对齐): 只保留定位 ---------- */
				if (viewMode === "minimal" || viewMode === "minimal-left") {
					const miniRows = [];
					for (const g of groups) {
						if (g.turn === null) continue;
						miniRows.push({
							key: g.headKey,
							text: g.subtitle,
							full: g.headIsUser && g.items.length > 0 ? g.items[0].full : null,
							active: g.items.some((it) => it.key === snap.activeKey),
						});
					}
					return React.createElement("div", {
						ref: (el) => { panelEl = el; },
						className: "cnvnav-mini-wrap" + (viewMode === "minimal-left" ? " cnvnav-mini-wrap-left" : "") + " cnvnav-panel-unplaced" + (snap.open ? "" : " cnvnav-panel-hidden"),
						role: "complementary",
						"aria-label": "会话导航",
						"aria-hidden": !snap.open,
					},
						React.createElement(Tooltip, {
							label: nextModeLabel(),
							side: "top",
							delayMs: 500,
						},
							React.createElement("span", { className: "cnvnav-mini-fab" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									icon: React.createElement(SwitchTurnsIcon),
									"aria-pressed": true,
									onClick: () => cycleMode(),
								}),
							),
						),
						React.createElement("div", { className: "cnvnav-mini-panel" },
							React.createElement("div", {
								ref: (el) => { listEl = el; },
								className: "cnvnav-mini-list",
							},
								groups.length === 0
									? React.createElement("div", { className: "cnvnav-empty" }, "当前会话暂无对话节点")
									: miniRows.map((r) => React.createElement(Tooltip, {
										key: r.key,
										label: r.full !== null ? r.full : "跳转到此位置",
										side: "top",
										delayMs: 500,
										maxWidth: 340,
									},
										React.createElement("button", {
											type: "button",
											ref: (el) => { itemEls[r.key] = el; },
											className: "cnvnav-mini-item" + (r.active ? " cnvnav-mini-item-active" : ""),
											onClick: () => jumpTo(r.key),
										}, r.text),
									)),
							),
						),
					);
				}

				const kw = filter.trim().toLowerCase();
				const filtering = kw !== "";
				function hit(text) {
					return typeof text === "string" && text !== "" && text.toLowerCase().indexOf(kw) !== -1;
				}
				/* Split text into nodes, wrapping every case-insensitive keyword match in a <mark>. */
				function highlightedNodes(text, kw) {
					if (typeof text !== "string" || kw === "") return [text];
					const lower = text.toLowerCase();
					const out = [];
					let i = 0;
					let m = 0;
					for (;;) {
						const idx = lower.indexOf(kw, i);
						if (idx === -1) { if (i < text.length) out.push(text.slice(i)); break; }
						if (idx > i) out.push(text.slice(i, idx));
						out.push(React.createElement("mark", { key: "m" + (m++), className: "cnvnav-hl" }, text.slice(idx, idx + kw.length)));
						i = idx + kw.length;
					}
					return out;
				}
				/* Window the text around the first keyword match (so the keyword is visible,
				   not hidden behind head-truncation), then highlight every occurrence. */
				function snippetNodes(text, kw, before, after) {
					if (typeof text !== "string") return [text];
					const idx = text.toLowerCase().indexOf(kw);
					if (idx === -1) return highlightedNodes(text, kw);
					const start = Math.max(0, idx - before);
					const end = Math.min(text.length, idx + kw.length + after);
					const s = text.slice(start, end);
					const parts = [];
					if (start > 0) parts.push("…");
					parts.push(...highlightedNodes(s, kw));
					if (end < text.length) parts.push("…");
					return parts;
				}
				function renderItem(item, staggerMs) {
					const useSnippet = filtering && hit(item.search);
					const preview = useSnippet ? snippetNodes(item.search, kw, 20, 50) : item.preview;
					const hasPreview = preview !== null && preview !== "" && (!Array.isArray(preview) || preview.length > 0);
					return React.createElement("button", {
						key: item.key,
						type: "button",
						ref: (el) => { itemEls[item.key] = el; },
						className: "cnvnav-item" + (item.key === snap.activeKey ? " cnvnav-item-active" : "") + (staggerMs !== undefined ? " cnvnav-fade-item" : ""),
						style: staggerMs !== undefined ? { animationDelay: staggerMs + "ms" } : undefined,
						onClick: () => jumpTo(item.key),
					},
						React.createElement("span", { className: "cnvnav-badge cnvnav-badge-" + item.cls }, item.label),
						hasPreview
							? React.createElement("span", { className: "cnvnav-item-preview" }, preview)
							: null,
						item.time !== ""
							? React.createElement("span", { className: "cnvnav-item-time" }, item.time)
							: null,
					);
				}
				function renderGroupHead(g, groupActive, chevron) {
					const headSearch = g.items.length > 0 ? g.items[0].search : null;
					const headFull = g.headIsUser && g.items.length > 0 ? g.items[0].full : null;
					const useSnippet = filtering && hit(headSearch);
					const sub = useSnippet ? snippetNodes(headSearch, kw, 15, 40) : g.subtitle;
					const hasSub = sub !== "" && (!Array.isArray(sub) || sub.length > 0);
					/* 标题策略:
					   显示轮次: 轮次行 = 加粗「第 N 轮」; 压缩等非轮次行 = 加粗类型标签, 视作轮次同级
					   隐藏轮次: 每行统一轨迹徽标 — 轮次头 = 「用户」业务蓝(助手开头则助手紫), 非轮次行 = 各自徽标(压缩=中性灰) */
					let titleNode = null;
					if (g.turn === null) {
						if (turnsHidden && g.items.length > 0) {
							const headItem = g.items[0];
							titleNode = React.createElement("span", {
								className: "cnvnav-badge cnvnav-badge-" + headItem.cls,
							}, headItem.label);
						} else {
							titleNode = React.createElement("span", { className: "cnvnav-group-title" }, g.title);
						}
					} else if (!turnsHidden) {
						titleNode = React.createElement("span", { className: "cnvnav-group-title" }, g.title);
					} else if (g.items.length > 0) {
						const headItem = g.items[0];
						titleNode = React.createElement("span", {
							className: "cnvnav-badge cnvnav-badge-" + headItem.cls,
						}, headItem.kind === "user" ? "用户" : headItem.label);
					}
					return React.createElement("div", {
						ref: (el) => { groupEls[g.gid] = el; },
						className: "cnvnav-group-row" + (groupActive ? " cnvnav-group-row-active" : ""),
					},
						React.createElement(Tooltip, {
							label: headFull !== null ? headFull : "跳转到此位置", maxWidth: 340,
							side: "top",
							delayMs: 500,
						},
							React.createElement("span", { className: "cnvnav-group-head-wrap" },
								React.createElement("button", {
									type: "button",
									className: "cnvnav-group-head",
									onClick: () => jumpTo(g.headKey),
								},
									titleNode,
									hasSub
										? React.createElement("span", { className: "cnvnav-group-sub" }, sub)
										: null,
								),
							),
						),
						chevron !== undefined ? chevron : null,
					);
				}

				let groupNodes;
				if (filtering) {
					groupNodes = [];
					for (const g of groups) {
						const headHit = g.headIsUser && g.items.length > 0 && hit(g.items[0].search);
						const hits = g.items.filter((it, i) =>
							(it.kind === "user" || it.kind === "assistant-step") &&
							hit(it.search) &&
							!(i === 0 && g.headIsUser)
						);
						if (!headHit && hits.length === 0) continue;
						const groupActive = g.items.some((it) => it.key === snap.activeKey);
						groupNodes.push(React.createElement("div", {
							key: g.gid,
							className: "cnvnav-group cnvnav-fade-item",
							style: { animationDelay: (groupNodes.length * 18) + "ms" },
						},
							renderGroupHead(g, groupActive, null),
							hits.length > 0
								? React.createElement("div", { className: "cnvnav-steps" },
									React.createElement("div", { className: "cnvnav-steps-inner" },
										hits.map((it, i) => renderItem(it, i * 20)),
									),
								)
								: null,
						));
					}
				} else {
					groupNodes = groups.map((g) => {
						const expanded = snap.expanded[g.gid] === true;
						const isTurnGroup = g.turn !== null;
						const stepItems = isTurnGroup ? (g.headIsUser ? g.items.slice(1) : g.items) : [];
						const hasSteps = stepItems.length > 0;
						const groupActive = g.items.some((it) => it.key === snap.activeKey);
						const chevron = hasSteps
							? React.createElement(Tooltip, {
								label: expanded ? "折叠步次" : "展开步次",
								side: "top",
								delayMs: 500,
							},
								React.createElement("span", { className: "cnvnav-chevron-wrap" },
									React.createElement("button", {
										type: "button",
										className: "cnvnav-chevron",
										"aria-expanded": expanded,
										onClick: (e) => {
											e.stopPropagation();
											setState({ expanded: Object.assign({}, state.expanded, { [g.gid]: !expanded }) });
										},
									},
										React.createElement("svg", {
										className: "cnvnav-chevron-icon",
										viewBox: "0 0 24 24", width: 12, height: 12, fill: "none",
										stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
										"aria-hidden": true,
									},
										React.createElement("path", { d: "m9 18 6-6-6-6" }),
									),
									expanded ? null : React.createElement("span", { className: "cnvnav-chevron-count" }, String(stepItems.length)),
									),
								),
							)
							: null;
						return React.createElement("div", { key: g.gid, className: "cnvnav-group" },
							renderGroupHead(g, groupActive, chevron),
							hasSteps
								? React.createElement("div", {
									className: "cnvnav-steps" + (expanded ? "" : " cnvnav-steps-collapsed"),
									"aria-hidden": !expanded,
								},
									React.createElement("div", { className: "cnvnav-steps-inner" },
										stepItems.map(renderItem),
									),
								)
								: null,
						);
					});
				}

				return React.createElement("div", {
					ref: (el) => { panelEl = el; },
					className: "cnvnav-panel cnvnav-panel-unplaced" + (snap.open ? "" : " cnvnav-panel-hidden"),
					role: "complementary",
					"aria-label": "会话导航",
					"aria-hidden": !snap.open,
				},
					React.createElement("div", {
						className: "cnvnav-head",
						onPointerDown: startDrag,
						onPointerMove: moveDrag,
						onPointerUp: endDrag,
						onPointerCancel: endDrag,
					},
						React.createElement(Tooltip, {
							label: searchOpen ? "收起搜索" : "搜索关键词",
							side: "bottom",
							delayMs: 500,
						},
							React.createElement("span", { className: "cnvnav-search" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									icon: React.createElement(IconSearchOutline16, { size: 14 }),
									onClick: () => toggleSearch(),
								}),
							),
						),
						searchOpen
							? null
							: React.createElement(Tooltip, {
								label: nextModeLabel(),
								side: "bottom",
								delayMs: 500,
							},
								React.createElement("span", { className: "cnvnav-turns-toggle" },
									React.createElement(Button, {
										variant: "ghost",
										size: "sm",
										className: viewMode !== "full" ? "cnvnav-toggle-on" : "",
										icon: React.createElement(SwitchTurnsIcon),
										"aria-pressed": viewMode !== "full",
										onClick: () => cycleMode(),
									}),
								),
							),
						searchOpen
							? React.createElement("input", {
								type: "text",
								className: "cnvnav-filter",
								placeholder: "请输入关键词",
								value: filter,
								autoFocus: true,
								onChange: (e) => setFilter(e.target.value),
							})
							: null,
						React.createElement(Tooltip, {
								label: snap.docked ? "解除停靠(拖动头部定位)" : "停靠回右侧",
								side: "bottom",
								delayMs: 500,
							},
								React.createElement("span", null,
									React.createElement(Button, {
										variant: snap.docked ? "primary" : "ghost",
										size: "sm",
										icon: React.createElement(PinIcon),
										"aria-pressed": snap.docked,
										onClick: () => {
											if (snap.docked) {
												const el = panelEl;
												const r = el !== null ? el.getBoundingClientRect() : null;
												setState({ docked: false, userPos: r !== null ? { left: Math.round(r.left), top: Math.round(r.top) } : null });
											} else {
												setState({ docked: true });
											}
											persistUi();
										},
									}),
								),
							),
						React.createElement("span", { className: "cnvnav-count" }, (filtering ? groupNodes.length + " / " : "") + String(count) + " 条"),
						React.createElement(Tooltip, {
							label: "收起面板",
							side: "bottom",
							delayMs: 500,
						},
							React.createElement("span", { className: "cnvnav-close" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									icon: React.createElement(IconCloseOutline16, { size: 14 }),
									onClick: () => setState({ open: false }),
								}),
							),
						),
					),
					React.createElement("div", { className: "cnvnav-topbar" },
						React.createElement(Tooltip, {
							label: "加载更早的一批轮次",
							side: "bottom",
							delayMs: 500,
							disabled: !snap.hasMore || snap.loadingOlder,
						},
							React.createElement("span", { className: "cnvnav-bar-btn" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									className: "cnvnav-bar-fill",
									icon: React.createElement(LoadEarlierIcon),
									disabled: !snap.hasMore || snap.loadingOlder,
									onClick: () => loadOlderPage(),
								}, "加载更早"),
							),
						),
						React.createElement(Tooltip, {
							label: "加载全部历史轮次",
							side: "bottom",
							delayMs: 500,
							disabled: !snap.hasMore || snap.loadingOlder || snap.loadingAll,
						},
							React.createElement("span", { className: "cnvnav-bar-btn" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									className: "cnvnav-bar-fill",
									icon: React.createElement(LoadAllIcon),
									disabled: !snap.hasMore || snap.loadingOlder || snap.loadingAll,
									onClick: () => loadAllPages(),
								}, "加载全部"),
							),
						),
					),
					React.createElement("div", {
						ref: (el) => { listEl = el; },
						className: "cnvnav-list",
					},
						groups.length === 0
							? React.createElement("div", { className: "cnvnav-empty" }, "当前会话暂无对话节点")
							: (filtering && groupNodes.length === 0
								? React.createElement("div", { className: "cnvnav-empty" }, "无匹配结果")
								: groupNodes),
					),
					React.createElement("div", { className: "cnvnav-footer" },
						React.createElement(Tooltip, {
							label: "回到对话最新位置",
							side: "top",
							delayMs: 500,
						},
							React.createElement("span", { className: "cnvnav-bar-btn" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									className: "cnvnav-bar-fill",
									icon: React.createElement(JumpLatestIcon),
									onClick: () => {
										const gs = snap.outline !== null ? snap.outline.groups : [];
										if (gs.length === 0) return;
										const lastGroup = gs[gs.length - 1];
										const lastItem = lastGroup.items[lastGroup.items.length - 1];
										if (lastItem !== undefined) jumpTo(lastItem.key);
									},
								}, "回到最新"),
							),
						),
						React.createElement(Tooltip, {
							label: hasExpanded ? "折叠所有已展开的轮次" : "当前无展开的轮次",
							side: "top",
							delayMs: 500,
							disabled: !hasExpanded,
						},
							React.createElement("span", { className: "cnvnav-bar-btn" },
								React.createElement(Button, {
									variant: "ghost",
									size: "sm",
									className: "cnvnav-bar-fill",
									icon: React.createElement(CollapseAllIcon),
									disabled: !hasExpanded,
									onClick: () => setState({ expanded: {} }),
								}, "全部折叠"),
							),
						),
					),
				);
			}

			/* ---------- register ---------- */
			slots.inject("conversation.session.header.utilities", () => slots.register(
				{ name: "conversation.session.header.utilities", id: "conversation-navigator-toggle", order: 20, label: () => "会话导航" },
				(props) => React.createElement(ToggleButton, props),
			));
			slots.inject("shell.overlay", () => slots.register(
				{ name: "shell.overlay", id: "conversation-navigator-panel", order: 10, label: () => "会话导航" },
				() => React.createElement(Panel),
			));
		}

		const inject = ["slots", "sessions"];
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
