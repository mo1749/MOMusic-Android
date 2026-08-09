const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "MoMusic Team";
pres.title = "MoMusic Android APK 发布会";

// ========================================
// 配色：与 Logo 一致的紫蓝渐变
// ========================================
const C = {
  BG:        "0F0E17",
  BG_CARD:   "1A1A2E",
  PRIMARY:   "7C3AED",   // 紫色
  SECONDARY: "06B6D4",   // 青色
  ACCENT:    "F59E0B",   // 金色
  GRAD1:     "508CF0",   // Logo 蓝
  GRAD2:     "A855F7",   // Logo 紫
  TEXT:      "E8E8F0",
  MUTE:      "9CA3AF",
  WHITE:     "FFFFFF",
};

// ========================================
// Slide 1: 封面 — 极简大气
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  // Logo 圆圈
  s.addShape(pres.shapes.OVAL, {
    x: 4.0, y: 1.2, w: 2.0, h: 2.0,
    fill: { color: C.GRAD1, transparency: 60 }
  });
  s.addShape(pres.shapes.OVAL, {
    x: 4.15, y: 1.35, w: 1.7, h: 1.7,
    fill: { color: C.GRAD2, transparency: 70 }
  });

  // 音符 M 路径
  s.addText("M", {
    x: 4.0, y: 1.2, w: 2.0, h: 2.0,
    fontSize: 72, fontFace: "Georgia", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
  });

  // 主标题
  s.addText("MoMusic", {
    x: 0.5, y: 3.2, w: 9, h: 1.0,
    fontSize: 64, fontFace: "Georgia", color: C.WHITE, bold: true, align: "center", margin: 0
  });

  // 副标题
  s.addText("粒子音乐可视化播放器", {
    x: 0.5, y: 4.2, w: 9, h: 0.6,
    fontSize: 22, fontFace: "Arial", color: C.GRAD2, align: "center", margin: 0
  });

  // 版本标签
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 4.3, y: 4.9, w: 1.4, h: 0.4,
    fill: { color: C.PRIMARY }, rectRadius: 0.1
  });
  s.addText("v1.4.4", {
    x: 4.3, y: 4.9, w: 1.4, h: 0.4,
    fontSize: 16, fontFace: "Arial", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
  });

  // 底部线条
  s.addShape(pres.shapes.LINE, {
    x: 4.5, y: 4.75, w: 1.0, h: 0,
    line: { color: C.GRAD2, width: 2 }
  });
}

// ========================================
// Slide 2: 一句话定义
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("让手机端拥有", {
    x: 0.5, y: 1.5, w: 9, h: 1.5,
    fontSize: 48, fontFace: "Georgia", color: C.TEXT, margin: 0
  });

  s.addText("服务器级的音乐能力", {
    x: 0.5, y: 2.5, w: 9, h: 1.5,
    fontSize: 52, fontFace: "Georgia", color: C.GRAD2, bold: true, margin: 0
  });

  // 装饰线
  s.addShape(pres.shapes.LINE, {
    x: 3.5, y: 3.5, w: 3.0, h: 0,
    line: { color: C.PRIMARY, width: 3 }
  });

  // 三行关键词
  const keywords = [
    ["Capacitor 8", "混合应用框架"],
    ["Node.js 内嵌", "手机端运行完整后端"],
    ["WebView + Bridge", "前端零改动适配"],
  ];
  keywords.forEach((kw, i) => {
    const x = 1.0 + i * 2.8;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 4.0, w: 2.5, h: 0.8,
      fill: { color: C.BG_CARD }, rectRadius: 0.1
    });
    s.addText(kw[0], {
      x: x, y: 4.0, w: 1.4, h: 0.4,
      fontSize: 14, fontFace: "Arial", color: C.GRAD2, bold: true, align: "center", valign: "middle", margin: 0
    });
    s.addText(kw[1], {
      x: x, y: 4.4, w: 2.5, h: 0.4,
      fontSize: 10, fontFace: "Arial", color: C.MUTE, align: "center", valign: "middle", margin: 0
    });
  });
}

// ========================================
// Slide 3: Logo 演变 — 品牌故事
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("品牌设计", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.PRIMARY, width: 3 }
  });

  // 左侧：Logo 说明
  s.addText("Logo 构成元素", {
    x: 0.6, y: 1.4, w: 4, h: 0.5,
    fontSize: 18, fontFace: "Georgia", color: C.GRAD2, bold: true, margin: 0
  });

  const elements = [
    ["圆形唱片外框", "双层同心圆，象征音乐的圆满与循环"],
    ["M 形音符", "MoMusic 首字母，同时也是音符的抽象"],
    ["两个音符头", "圆形填充，代表节奏与韵律"],
    ["中心圆点", "唱片轴心，象征音乐的核心"],
    ["蓝紫渐变", "从 #508CF0 到 #A855F7，科技与艺术融合"],
  ];
  elements.forEach((el, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: 0.7, y: 2.0 + i * 0.55, w: 0.12, h: 0.12,
      fill: { color: C.GRAD2 }
    });
    s.addText(el[0], {
      x: 1.0, y: 1.9 + i * 0.55, w: 3.5, h: 0.3,
      fontSize: 12, fontFace: "Arial", color: C.WHITE, bold: true, margin: 0
    });
    s.addText(el[1], {
      x: 1.0, y: 2.15 + i * 0.55, w: 3.5, h: 0.3,
      fontSize: 10, fontFace: "Arial", color: C.MUTE, margin: 0
    });
  });

  // 右侧：色彩系统
  s.addText("色彩系统", {
    x: 5.0, y: 1.4, w: 4.5, h: 0.5,
    fontSize: 18, fontFace: "Georgia", color: C.GRAD2, bold: true, margin: 0
  });

  const colors = [
    ["主色 Purple", C.PRIMARY, "活力与创造力"],
    ["辅色 Cyan", C.SECONDARY, "科技与信任"],
    ["强调 Gold", C.ACCENT, "品质与尊享"],
    ["背景 Dark", C.BG, "沉浸与专注"],
    ["卡片 BG", C.BG_CARD, "层次与边界"],
  ];
  colors.forEach((c, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.0, y: 2.0 + i * 0.55, w: 0.4, h: 0.4,
      fill: { color: c[1] }, rectRadius: 0.05
    });
    s.addText(c[0], {
      x: 5.6, y: 1.95 + i * 0.55, w: 2.0, h: 0.3,
      fontSize: 12, fontFace: "Arial", color: C.WHITE, bold: true, margin: 0
    });
    s.addText(c[1], {
      x: 5.6, y: 2.15 + i * 0.55, w: 1.0, h: 0.3,
      fontSize: 10, fontFace: "Consolas", color: C.MUTE, margin: 0
    });
    s.addText(c[2], {
      x: 7.0, y: 2.05 + i * 0.55, w: 2.5, h: 0.3,
      fontSize: 10, fontFace: "Arial", color: C.MUTE, margin: 0
    });
  });
}

// ========================================
// Slide 4: 核心功能 — 大数字冲击
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("核心数据", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.GRAD2, width: 3 }
  });

  const stats = [
    ["8,456", "后端代码行数\nserver.js", C.GRAD1],
    ["2,229", "前端 HTML 行数\n多模块架构", C.GRAD2],
    ["429", "Bridge 适配代码\n前端零改动", C.PRIMARY],
    ["104", "前端模块数量\n功能丰富", C.ACCENT],
    ["6", "音源平台聚合\n一站式服务", C.SECONDARY],
  ];

  stats.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 3.1;
    const y = 1.5 + row * 1.8;

    // 大数字
    s.addText(st[0], {
      x: x, y: y, w: 2.8, h: 1.0,
      fontSize: 54, fontFace: "Georgia", color: st[2], bold: true, align: "center", margin: 0
    });

    // 描述
    s.addText(st[1], {
      x: x, y: y + 1.0, w: 2.8, h: 0.5,
      fontSize: 12, fontFace: "Arial", color: C.MUTE, align: "center", lineSpacingMultiple: 1.2, margin: 0
    });
  });
}

// ========================================
// Slide 5: 音源平台 — 卡片阵列
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("多音源聚合", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.PRIMARY, width: 3 }
  });
  s.addText("一个 App，六个平台，无缝切换", {
    x: 0.5, y: 1.2, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.MUTE, margin: 0
  });

  const sources = [
    ["网易云音乐", "搜索 · 歌单 · 扫码登录 · 评论", C.GRAD1],
    ["酷狗音乐", "无损音质 · 榜单聚合", C.GRAD2],
    ["汽水音乐", "抖音系音源 · 解密播放", C.ACCENT],
    ["QQ 音乐 VIP", "会员专享 · 多 quality 探测", C.PRIMARY],
    ["Spotify", "国际音源 · 歌单导入", C.SECONDARY],
    ["LX Sources", "自定义音源 · 多解析引擎", C.ACCENT],
  ];

  sources.forEach((src, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 3.2;
    const y = 1.8 + row * 1.7;

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 2.9, h: 1.4,
      fill: { color: C.BG_CARD }, rectRadius: 0.1
    });

    // 顶部色条
    s.addShape(pres.shapes.RECTANGLE, {
      x: x, y: y, w: 2.9, h: 0.08,
      fill: { color: src[2] }
    });

    s.addText(src[0], {
      x: x + 0.15, y: y + 0.2, w: 2.6, h: 0.4,
      fontSize: 18, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
    });
    s.addText(src[1], {
      x: x + 0.15, y: y + 0.7, w: 2.6, h: 0.5,
      fontSize: 11, fontFace: "Arial", color: C.MUTE, lineSpacingMultiple: 1.3, margin: 0
    });
  });
}

// ========================================
// Slide 6: 一起听 — 功能详解
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("一起听", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.SECONDARY, width: 3 }
  });
  s.addText("WebSocket 实时同步播放，让音乐成为社交的桥梁", {
    x: 0.5, y: 1.2, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.MUTE, margin: 0
  });

  // 架构图
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.8, w: 2.8, h: 2.8,
    fill: { color: C.BG_CARD }, rectRadius: 0.1
  });
  s.addText("📱 客户端 A", {
    x: 0.6, y: 1.9, w: 2.8, h: 0.5,
    fontSize: 16, fontFace: "Georgia", color: C.GRAD2, bold: true, align: "center", margin: 0
  });
  s.addText("加入房间\n同步播放状态", {
    x: 0.6, y: 2.5, w: 2.8, h: 1.0,
    fontSize: 12, fontFace: "Arial", color: C.MUTE, align: "center", lineSpacingMultiple: 1.3, margin: 0
  });

  // 箭头
  s.addText("⟷", {
    x: 3.5, y: 2.8, w: 0.8, h: 0.6,
    fontSize: 28, color: C.ACCENT, align: "center", valign: "middle", margin: 0
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 4.4, y: 1.8, w: 2.8, h: 2.8,
    fill: { color: C.BG_CARD }, rectRadius: 0.1
  });
  s.addText("🖥️ 服务器", {
    x: 4.4, y: 1.9, w: 2.8, h: 0.5,
    fontSize: 16, fontFace: "Georgia", color: C.PRIMARY, bold: true, align: "center", margin: 0
  });
  s.addText("WebSocket 服务\n房间管理 · 状态广播\n健康检查 /health", {
    x: 4.4, y: 2.5, w: 2.8, h: 1.5,
    fontSize: 12, fontFace: "Arial", color: C.MUTE, align: "center", lineSpacingMultiple: 1.3, margin: 0
  });

  // 箭头
  s.addText("⟷", {
    x: 7.3, y: 2.8, w: 0.8, h: 0.6,
    fontSize: 28, color: C.ACCENT, align: "center", valign: "middle", margin: 0
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.6, y: 1.8, w: 2.0, h: 2.8,
    fill: { color: C.BG_CARD }, rectRadius: 0.1
  });
  s.addText("📱 客户端 B", {
    x: 7.6, y: 1.9, w: 2.0, h: 0.5,
    fontSize: 16, fontFace: "Georgia", color: C.GRAD2, bold: true, align: "center", margin: 0
  });
  s.addText("同步接收\n播放状态", {
    x: 7.6, y: 2.5, w: 2.0, h: 1.0,
    fontSize: 12, fontFace: "Arial", color: C.MUTE, align: "center", lineSpacingMultiple: 1.3, margin: 0
  });

  // 底部部署标签
  s.addText("公网可部署：Render · Heroku · VPS", {
    x: 0.5, y: 4.7, w: 9, h: 0.4,
    fontSize: 12, fontFace: "Arial", color: C.MUTE, align: "center", margin: 0
  });
}

// ========================================
// Slide 7: 登录系统 — 双模式
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("登录系统", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.PRIMARY, width: 3 }
  });

  // 左侧：扫码登录
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.6, y: 1.5, w: 4.2, h: 3.5,
    fill: { color: C.BG_CARD }, rectRadius: 0.1
  });
  s.addText("扫码登录", {
    x: 0.8, y: 1.6, w: 3.8, h: 0.5,
    fontSize: 20, fontFace: "Georgia", color: C.GRAD2, bold: true, margin: 0
  });

  const qrSteps = [
    "1. 客户端请求 login_qr_key",
    "2. 服务器返回二维码 key",
    "3. 前端展示二维码 (jsQR)",
    "4. 手机扫码确认授权",
    "5. 轮询 login_qr_check",
    "6. 登录成功，Cookie 保存",
  ];
  qrSteps.forEach((step, i) => {
    s.addText(step, {
      x: 0.9, y: 2.2 + i * 0.4, w: 3.8, h: 0.35,
      fontSize: 11, fontFace: "Consolas", color: C.TEXT, margin: 0
    });
  });

  // 右侧：Cookie 登录
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 1.5, w: 4.2, h: 3.5,
    fill: { color: C.BG_CARD }, rectRadius: 0.1
  });
  s.addText("Cookie 登录", {
    x: 5.4, y: 1.6, w: 3.8, h: 0.5,
    fontSize: 20, fontFace: "Georgia", color: C.PRIMARY, bold: true, margin: 0
  });

  const cookieSteps = [
    "1. 用户手动粘贴 Cookie",
    "2. 支持 QQ 音乐 VIP 账号",
    "3. Cookie 本地文件持久化",
    "4. 重启自动恢复登录态",
    "5. 多平台账号自由切换",
    "6. 节点图拖拽排序 (桌面端)",
  ];
  cookieSteps.forEach((step, i) => {
    s.addText(step, {
      x: 5.5, y: 2.2 + i * 0.4, w: 3.8, h: 0.35,
      fontSize: 11, fontFace: "Consolas", color: C.TEXT, margin: 0
    });
  });
}

// ========================================
// Slide 8: Bridge 核心 — 代码美学
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("android-bridge.js", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.GRAD2, width: 3 }
  });
  s.addText("429 行代码，实现前端零改动适配", {
    x: 0.5, y: 1.2, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.MUTE, margin: 0
  });

  // 核心代码展示
  const codeLines = [
    { text: "window.fetch = function (input, init) {", color: C.TEXT },
    { text: "  var url = typeof input === 'string' ? input : input.url;", color: C.TEXT },
    { text: "  if (url.indexOf('/api') === 0) {", color: C.GRAD2 },
    { text: "    return whenNodeReady().then(() => {", color: C.TEXT },
    { text: "      return origFetch(API_BASE + url, init);", color: C.TEXT },
    { text: "    });", color: C.TEXT },
    { text: "  }", color: C.GRAD2 },
    { text: "  return origFetch.apply(window, arguments);", color: C.TEXT },
    { text: "};", color: C.TEXT },
  ];

  codeLines.forEach((line, i) => {
    s.addText(line.text, {
      x: 0.8, y: 1.8 + i * 0.4, w: 8.4, h: 0.35,
      fontSize: 13, fontFace: "Consolas", color: line.color, margin: 0
    });
  });

  // 特性标签
  const tags = ["fetch 拦截", "src 重写", "MutationObserver", "Hover→Active", "viewport 修正", "布局强制修复"];
  tags.forEach((tag, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8 + col * 3.0, y: 5.5 + row * 0.45, w: 2.7, h: 0.35,
      fill: { color: C.GRAD2, transparency: 70 }, rectRadius: 0.08
    });
    s.addText(tag, {
      x: 0.8 + col * 3.0, y: 5.5 + row * 0.45, w: 2.7, h: 0.35,
      fontSize: 11, fontFace: "Arial", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
    });
  });
}

// ========================================
// Slide 9: 构建流程 — 简洁有力
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  s.addText("构建流程", {
    x: 0.5, y: 0.4, w: 9, h: 0.7,
    fontSize: 36, fontFace: "Georgia", color: C.WHITE, bold: true, margin: 0
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 1.1, w: 1.5, h: 0,
    line: { color: C.PRIMARY, width: 3 }
  });

  const steps = [
    ["sync:web", "前端资源\nrobocopy MIR\n+ Bridge 注入"],
    ["sync:node", "后端资源\n16个模块\nnpm install"],
    ["cap:sync", "Capacitor\nWebView assets\n打包"],
    ["build:apk", "Gradle\napp-debug.apk\n多架构"],
  ];

  steps.forEach((step, i) => {
    const x = 0.8 + i * 2.3;
    const y = 1.8;

    // 步骤圆
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.85, y: y, w: 0.6, h: 0.6,
      fill: { color: C.PRIMARY }
    });
    s.addText(String(i + 1), {
      x: x + 0.85, y: y, w: 0.6, h: 0.6,
      fontSize: 20, fontFace: "Georgia", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
    });

    // 步骤标题
    s.addText(step[0], {
      x: x, y: y + 0.8, w: 2.3, h: 0.4,
      fontSize: 16, fontFace: "Arial", color: C.SECONDARY, bold: true, align: "center", margin: 0
    });

    // 步骤描述
    s.addText(step[1], {
      x: x, y: y + 1.25, w: 2.3, h: 1.0,
      fontSize: 11, fontFace: "Arial", color: C.MUTE, align: "center", lineSpacingMultiple: 1.3, margin: 0
    });

    // 箭头
    if (i < 3) {
      s.addText("▶", {
        x: x + 2.05, y: y + 0.2, w: 0.25, h: 0.3,
        fontSize: 18, fontFace: "Arial", color: C.ACCENT, align: "center", margin: 0
      });
    }
  });

  // 产物标签
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.0, y: 3.8, w: 4.0, h: 0.5,
    fill: { color: C.SECONDARY, transparency: 75 }, rectRadius: 0.1
  });
  s.addText("app-debug.apk · arm64-v8a / armeabi-v7a / x86_64", {
    x: 3.0, y: 3.8, w: 4.0, h: 0.5,
    fontSize: 12, fontFace: "Arial", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
  });
}

// ========================================
// Slide 10: 结尾 — 金句
// ========================================
{
  let s = pres.addSlide();
  s.background = { color: C.BG };

  // Logo
  s.addShape(pres.shapes.OVAL, {
    x: 4.0, y: 0.8, w: 2.0, h: 2.0,
    fill: { color: C.GRAD1, transparency: 60 }
  });
  s.addShape(pres.shapes.OVAL, {
    x: 4.15, y: 0.95, w: 1.7, h: 1.7,
    fill: { color: C.GRAD2, transparency: 70 }
  });
  s.addText("M", {
    x: 4.0, y: 0.8, w: 2.0, h: 2.0,
    fontSize: 72, fontFace: "Georgia", color: C.WHITE, bold: true, align: "center", valign: "middle", margin: 0
  });

  s.addText("让音乐无处不在", {
    x: 0.5, y: 3.0, w: 9, h: 1.0,
    fontSize: 48, fontFace: "Georgia", color: C.WHITE, bold: true, align: "center", margin: 0
  });

  s.addText("MoMusic — 手机端拥有服务器级的音乐能力", {
    x: 0.5, y: 4.0, w: 9, h: 0.6,
    fontSize: 18, fontFace: "Arial", color: C.GRAD2, align: "center", margin: 0
  });

  s.addShape(pres.shapes.LINE, {
    x: 4.5, y: 4.7, w: 1.0, h: 0,
    line: { color: C.GRAD2, width: 2 }
  });

  s.addText("v1.4.4 · 2026", {
    x: 0.5, y: 4.85, w: 9, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.MUTE, align: "center", margin: 0
  });
}

// 保存
pres.writeFile({ fileName: "E:/work/MoMusic Android APK/MoMusic-发布会.pptx" })
  .then(file => console.log("OK:", file))
  .catch(err => { console.error("ERR:", err); process.exit(1); });
