// MoMusic Android 桥接层
// 作用：WebView 加载本地 assets（capacitor://localhost），本脚本将
//   fetch('/api/*') 重写为 http://127.0.0.1:3000/api/*（内嵌 Node server.js）
// 并在 Node 尚未就绪时自动排队重试，前端 104 个模块零改动。
// 注入方式：sync-web.ps1 拷贝本文件到 www/js/ 并在 index.html <head> 注入引用。
(function () {
  'use strict';
  if (window.__MOMUSIC_ANDROID_BRIDGE__) return;
  window.__MOMUSIC_ANDROID_BRIDGE__ = true;

  var API_BASE = 'http://127.0.0.1:3000';
  var PROBE_INTERVAL = 250;
  var PROBE_TIMEOUT = 30000;
  var startedAt = Date.now();
  var nodeReady = false;
  var waiters = [];

  function flushWaiters(err) {
    var w = waiters;
    waiters = [];
    for (var i = 0; i < w.length; i++) {
      try { w[i](err); } catch (e) { /* ignore */ }
    }
  }

  function markReady() {
    if (nodeReady) return;
    nodeReady = true;
    flushWaiters(null);
  }

  function scheduleProbe() {
    if (nodeReady) return;
    if (Date.now() - startedAt > PROBE_TIMEOUT) {
      flushWaiters(new Error('node-timeout'));
      return;
    }
    setTimeout(probe, PROBE_INTERVAL);
  }

  function probe() {
    if (nodeReady) return;
    var xhr = new XMLHttpRequest();
    try {
      // 注意：必须用带 CORS 头的 /api 端点（favicon/静态资源 404 无 ACAO 头会被浏览器拦截）
      xhr.open('GET', API_BASE + '/api/app/version');
      xhr.timeout = 2000;
      xhr.onload = function () { markReady(); };
      xhr.onerror = function () { scheduleProbe(); };
      xhr.ontimeout = function () { scheduleProbe(); };
      xhr.send();
    } catch (e) {
      scheduleProbe();
    }
  }

  function whenNodeReady() {
    if (nodeReady) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      waiters.push(function (err) { err ? reject(err) : resolve(); });
      if (waiters.length === 1) probe();
    });
  }

  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url);
    if (typeof url === 'string' && url.indexOf('/api') === 0) {
      return whenNodeReady().then(function () {
        return origFetch.call(window, API_BASE + url, init);
      });
    }
    return origFetch.apply(window, arguments);
  };

  // <img>/<audio> 的 src 相对 /api/ 路径重写（封面/头像/音频代理，不走 fetch 桥）
  // innerHTML 解析的元素不走 src setter，需 MutationObserver 覆盖。
  // 监听 body 子树（封面/头像/歌词视觉注入点）。
  var scopeRoot = document.body || document.documentElement;
  function rewriteElSrc(el) {
    if (!el || !el.getAttribute) return;
    var s = el.getAttribute('src');
    if (s && s.indexOf('/api/') === 0 && s.indexOf(API_BASE) === -1) {
      el.setAttribute('src', API_BASE + s);
    }
  }
  try {
    document.querySelectorAll('img[src^="/api/"], audio[src^="/api/"]').forEach(rewriteElSrc);
    // new Audio()/new Video() 创建的非 DOM 媒体元素走 src setter，observer 覆盖不到
    try {
      var mediaProto = window.HTMLMediaElement && window.HTMLMediaElement.prototype;
      if (mediaProto) {
        var mediaDesc = Object.getOwnPropertyDescriptor(mediaProto, 'src');
        if (mediaDesc && mediaDesc.set) {
          Object.defineProperty(mediaProto, 'src', {
            get: function () { return mediaDesc.get.call(this); },
            set: function (v) {
              if (typeof v === 'string' && v.indexOf('/api/') === 0 && v.indexOf(API_BASE) === -1) {
                v = API_BASE + v;
              }
              mediaDesc.set.call(this, v);
            },
            configurable: true
          });
        }
      }
    } catch (e) { /* noop */ }
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === 'childList') {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var n = m.addedNodes[j];
            if (!n || !n.querySelectorAll) continue;
            n.querySelectorAll('img[src^="/api/"], audio[src^="/api/"]').forEach(rewriteElSrc);
          }
        } else if (m.type === 'attributes' && m.attributeName === 'src') {
          rewriteElSrc(m.target);
        }
      }
    });
    mo.observe(scopeRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  } catch (e) { /* noop */ }

  // ---- desktopWindow 幽灵桥 ----
  // 前端对 desktopWindow 的其余调用全部有 typeof 防护（自动降级 UI），
  // 仅 08-desktop-render-power.js:351 的 trimAppMemory 为裸调用，
  // 缺失会导致后台模式 TypeError 崩溃。注入最小实现保平安。
  if (!window.desktopWindow) {
    window.desktopWindow = {
      isDesktop: false,
      trimAppMemory: function () {
        return Promise.resolve({ ok: true, skipped: 'android' });
      }
    };
  }

  console.log('[android-bridge] installed, api base =', API_BASE);

  // ================= 移动端适配：触控修复 =================
  // 1. viewport 修正：禁缩放 + 刘海屏安全区（viewport-fit=cover）
  try {
    var meta = document.querySelector('meta[name="viewport"]');
    var metaContent = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    if (meta) {
      meta.setAttribute('content', metaContent);
    } else {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = metaContent;
      document.head.insertBefore(meta, document.head.firstChild);
    }
  } catch (e) { /* noop */ }

  // 2. 触控 CSS：消除触摸高亮/长按菜单/误选文本/橡皮筋滚动
  try {
    var mobileStyle = document.createElement('style');
    mobileStyle.textContent = [
      '* { -webkit-touch-callout: none !important; -webkit-tap-highlight-color: transparent !important; }',
      'html, body { overscroll-behavior: none; }',
      'body { user-select: none !important; -webkit-user-select: none !important; }',
      'input, textarea, select, [contenteditable] { user-select: text !important; -webkit-user-select: text !important; }',
      '@media (hover: none), (pointer: coarse) { * { cursor: default !important; } }',
      '/* ---- 移动端横屏布局适配：home 界面触屏滚动 ---- */',
      '#empty-home {',
      '  overflow-y: auto !important;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '  top: 8px !important;',
      '  bottom: 64px !important;',
      '  width: calc(100vw - 16px) !important;',
      '  max-width: none !important;',
      '}',
      '#empty-home::-webkit-scrollbar { width: 0 !important; height: 0 !important; }',
      '.empty-home-shell {',
      '  grid-template-columns: 1fr !important;',
      '  grid-template-rows: auto auto !important;',
      '  height: auto !important;',
      '  min-height: 0 !important;',
      '}',
      '.home-hero { min-height: 0 !important; }',
      '.home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; }',
      '.home-card { min-height: 108px !important; padding: 12px 14px !important; }',
      '.home-card-art { width: 52px !important; height: 52px !important; }',
      '/* ---- modal 面板触屏滚动（一起听/登录/房间卡片） ---- */',
      '.modal-mask { overflow-y: auto !important; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }',
      '.modal, .dual-login-modal, .dual-user-modal, #listen-together-panel {',
      '  max-height: calc(100dvh - 24px) !important;',
      '  overflow-y: auto !important;',
      '  -webkit-overflow-scrolling: touch;',
      '  overscroll-behavior: contain;',
      '}',
      '.modal::-webkit-scrollbar { width: 0 !important; }',
      '/* ---- 登录面板手机端优化 ---- */',
      '/* 隐藏拖拽排序手柄（手机端不需要桌面拖拽交互） */',
      '.login-provider-sort-handle { display: none !important; }',
      '/* 隐藏 workflow 输出端口（拖拽连线用，手机端简化交互） */',
      '.flow-port.out { display: none !important; }',
      '.login-node-graph .flow-port.in { display: none !important; }',
      '#login-workflow-svg { display: none !important; }',
      '/* 简化登录节点图布局：去掉复杂的节点图，直接平台列表 + 详情 */',
      '.login-node-graph {',
      '  grid-template-columns: 200px 1fr !important;',
      '  gap: 12px !important;',
      '}',
      '.login-node-providers {',
      '  padding: 8px !important;',
      '}',
      '.login-node-providers [data-login-provider] {',
      '  min-height: 52px !important;',
      '  padding: 10px 14px !important;',
      '  margin-bottom: 6px !important;',
      '}',
      '/* 二维码区域手机端适配 */',
      '#qr-shell {',
      '  padding: 16px !important;',
      '}',
      '#qr-img {',
      '  max-width: 180px !important;',
      '  max-height: 180px !important;',
      '}',
      '/* 登录按钮增大触控区域 */',
      '#refresh-qr-btn, #qq-cookie-save-btn, .qq-login-mark, .qq-cookie-toggle-btn {',
      '  min-height: 44px !important;',
      '  padding: 10px 18px !important;',
      '  font-size: 14px !important;',
      '}',
      '/* Cookie 输入框手机端适配 */',
      '#qq-cookie-input {',
      '  min-height: 80px !important;',
      '  font-size: 13px !important;',
      '  padding: 10px 12px !important;',
      '}',
      '/* 登录模式切换按钮（官方/手动）手机端适配 */',
      '.login-mode-tabs button {',
      '  min-height: 40px !important;',
      '  padding: 8px 14px !important;',
      '}',
      '/* 手机端登录卡片模态框：优化横屏布局 */',
      '.login-card-modal-mask .modal {',
      '  width: min(560px, calc(100vw - 32px)) !important;',
      '  max-height: calc(100dvh - 32px) !important;',
      '  padding: 20px 24px !important;',
      '}',
      '/* 登录平台 tab 手机端：横向滚动，避免挤压 */',
      '#login-platform-tabs {',
      '  flex-direction: row !important;',
      '  flex-wrap: nowrap !important;',
      '  overflow-x: auto !important;',
      '  overflow-y: hidden !important;',
      '  -webkit-overflow-scrolling: touch;',
      '  padding-bottom: 4px !important;',
      '}',
      '#login-platform-tabs::-webkit-scrollbar { display: none !important; }',
      '#login-platform-tabs [data-login-provider] {',
      '  flex: 0 0 auto !important;',
      '  min-width: 80px !important;',
      '  margin-right: 8px !important;',
      '  margin-bottom: 0 !important;',
      '  flex-direction: column !important;',
      '  align-items: center !important;',
      '  justify-content: center !important;',
      '  padding: 8px 12px !important;',
      '  min-height: 64px !important;',
      '}',
      '#login-platform-tabs .provider-logo {',
      '  margin-right: 0 !important;',
      '  margin-bottom: 4px !important;',
      '}',
      '#login-platform-tabs .login-provider-state-badge {',
      '  top: 4px !important;',
      '  right: 4px !important;',
      '  font-size: 10px !important;',
      '  padding: 1px 5px !important;',
      '}'
    ].join('\n');
    document.head.appendChild(mobileStyle);
  } catch (e) { /* noop */ }

  // 3. 触屏 sticky-hover 修复：把 CSS 中全部 :hover 选择器改写为 :active  //    （桌面版 258 处 :hover；触屏上首个触摸会让元素保持 hover 态，"按钮粘住"的根因）
  try {
    var touchOnly = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (touchOnly) {
      var sheets = document.styleSheets;
      for (var si = 0; si < sheets.length; si++) {
        var sh = sheets[si];
        var rules = null;
        try { rules = sh.cssRules; } catch (err) { continue; }
        if (!rules) continue;
        for (var ri = 0; ri < rules.length; ri++) {
          var rule = rules[ri];
          if (rule && rule.selectorText && rule.selectorText.indexOf(':hover') !== -1) {
            try {
              rule.selectorText = rule.selectorText.replace(/:hover/g, ':active');
            } catch (err) { /* 单条失败跳过 */ }
          }
        }
      }
      console.log('[android-bridge] hover->active rewrite applied (touch device)');
    }
  } catch (e) { /* noop */ }

  // 4. DIY 按钮恢复：桌面版在标题栏（移动端标题栏隐藏），注入浮层入口
  try {
    function ensureDiyFab() {
      if (document.getElementById('momusic-diy-fab')) return;
      if (!document.body) { setTimeout(ensureDiyFab, 300); return; }
      var fab = document.createElement('button');
      fab.id = 'momusic-diy-fab';
      fab.type = 'button';
      fab.textContent = 'DIY';
      fab.setAttribute('aria-label', 'DIY');
      fab.style.cssText =
        'position:fixed;top:8px;left:12px;z-index:950;min-width:52px;height:32px;padding:0 14px;' +
        'border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(14,16,20,.62);' +
        'color:rgba(255,255,255,.82);font-size:13px;font-weight:600;letter-spacing:.5px;' +
        'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);cursor:pointer;display:flex;' +
        'align-items:center;justify-content:center;-webkit-tap-highlight-color:transparent;';
      fab.addEventListener('click', function () {
        try {
          if (typeof window.toggleDiyMode === 'function') window.toggleDiyMode();
        } catch (err) { /* noop */ }
      });
      document.body.appendChild(fab);
      console.log('[android-bridge] DIY fab injected');
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureDiyFab);
    } else {
      ensureDiyFab();
    }
  } catch (e) { /* noop */ }

  // 5. DOM 诊断探针（滚动问题定位）
  setTimeout(function () {
    try {
      var el = document.getElementById('empty-home');
      if (!el) { console.log('[diag] #empty-home NOT FOUND'); return; }
      var cs = getComputedStyle(el);
      console.log('[diag] bodyClass=' + document.body.className);
      console.log('[diag] empty-home clientH=' + el.clientHeight + ' scrollH=' + el.scrollHeight +
        ' ovY=' + cs.overflowY + ' opacity=' + cs.opacity + ' pe=' + cs.pointerEvents +
        ' transform=' + cs.transform + ' inlineTf=' + (el.style.transform || ''));
      var shell = el.querySelector('.empty-home-shell');
      if (shell) {
        console.log('[diag] shell clientH=' + shell.clientHeight + ' scrollH=' + shell.scrollHeight +
          ' cols=' + getComputedStyle(shell).gridTemplateColumns + ' inlineCols=' + (shell.style.gridTemplateColumns || ''));
      }
      el.scrollTop = 200;
      console.log('[diag] scrollTop after set = ' + el.scrollTop);
      el.scrollTop = 0;
    } catch (err) { console.log('[diag] err ' + err.message); }
  }, 6000);

  // 6. home 布局强制：WebView 存在 grid-template-columns used-value 缓存 bug
  //    （inline/CSSOM 修改均不生效，computed 恒为塌陷两列，hero 被压成 1px）。
  //    绕开 CSS 层叠：display:block 块级堆叠（hero 上、grid 下），与 grid 模板无关。
  try {
    function forceHomeBlockLayout() {
      var shell = document.querySelector('.empty-home-shell');
      if (!shell) return;
      var cur = shell.getAttribute('style') || '';
      if (cur.indexOf('display:block') === -1) {
        shell.setAttribute('style', cur + ';display:block!important;height:auto!important;min-height:0!important;');
        console.log('[android-bridge] home shell forced to block layout');
      }
    }
    setTimeout(forceHomeBlockLayout, 800);
    setTimeout(forceHomeBlockLayout, 2500);
    setTimeout(forceHomeBlockLayout, 6000);
    setInterval(forceHomeBlockLayout, 2000);
  } catch (e) { /* noop */ }

  // 7. 登录面板手机端行为适配
  //    - 覆盖 startSelectedLoginConnection：手机端点击"连接"直接打开登录，不需要拖拽
  //    - 手机端点击平台按钮直接展开登录详情，不走节点图拖拽流程
  try {
    function patchMobileLoginBehavior() {
      if (typeof window.startSelectedLoginConnection === 'function') {
        var origStartConnection = window.startSelectedLoginConnection;
        window.startSelectedLoginConnection = function () {
          var isTouch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;
          if (isTouch) {
            // 手机端：直接打开当前选中平台的登录
            if (typeof window.setLoginAuthDrawer === 'function') {
              // 优先使用官方模式（扫码）
              if (typeof window.setLoginProvider === 'function' && typeof window.loginProvider !== 'undefined') {
                var provider = window.loginProvider;
                if (typeof window.setManualCookieOpenForProvider === 'function') {
                  window.setManualCookieOpenForProvider(provider, false);
                }
                if (typeof window.setLoginAuthDrawerOpen === 'function') {
                  window.setLoginAuthDrawerOpen(true);
                }
                if (typeof window.connectLoginMode === 'function') {
                  window.connectLoginMode('official');
                  return;
                }
              }
            }
          }
          return origStartConnection.apply(window, arguments);
        };
        console.log('[android-bridge] login startSelectedLoginConnection patched for mobile');
      }
      // 覆盖"展示"开关的标题，手机端文案更易懂
      if (typeof window.updateLoginProviderCapsuleStatus === 'function') {
        var origUpdateCapsule = window.updateLoginProviderCapsuleStatus;
        window.updateLoginProviderCapsuleStatus = function (provider, btn) {
          var result = origUpdateCapsule.apply(window, arguments);
          var sw = btn && btn.querySelector('.login-provider-external-switch');
          if (sw) {
            var label = sw.querySelector('.login-provider-external-label');
            if (label) label.textContent = window.isAccountProviderExternallyVisible(provider) ? '已展示' : '展示';
          }
          return result;
        };
      }
    }
    // 延迟到前端模块加载完成后再 patch
    setTimeout(patchMobileLoginBehavior, 3000);
    setTimeout(patchMobileLoginBehavior, 6000);
  } catch (e) { /* noop */ }
})();
