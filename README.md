# MOMusic Android

MoMusic 音乐播放器的 **Android 版本**（APK 分发仓库）。

基于 **Capacitor 8 + NodeJS-mobile 内嵌后端**：Web 前端与 Node.js 音乐后端打包进同一个 APK，无需外部服务器，离线可用的个性化音乐播放器。

## 特性

- 多平台聚合播放：网易云 / QQ 音乐 / 酷狗 / 汽水 / Spotify 搜索与播放，自动换源
- 3D 视觉场景：3D 歌单架、粒子封面、歌词星海、DIY 玩家模式（FX 视觉控制台）
- 个性主页：每日回顾卡片、音乐库入口、今日聆听统计
- 一起听（Listen Together）：创建/加入房间，多人同步听歌
- 自定义音源：导入落雪协议音源脚本
- App 内更新：启动时自动检查本仓库 Releases，发现新版本弹窗提示

## 安装与更新

1. 到 [Releases](https://github.com/mo1749/MOMusic-Android/releases) 下载最新 `app-release.apk`
2. 安装后打开 App，自动检测新版本（发布新版本后 App 内会提示更新）
3. 允许安装未知来源应用（首次安装需在系统设置中授权）

> 当前版本使用 Debug 签名发布，可直接安装与覆盖升级。

## 桌面版（PC）

本项目为 Android 版本。桌面版（Windows 桌面播放器）在独立仓库：

- **发布页**：https://github.com/mo1749/MOMusic
- **下载地址**：https://github.com/mo1749/MOMusic/releases

两个仓库互相独立，代码与发布互不影响。

## 本地构建（开发）

```bash
# 同步 Web 资源（从 E:\work\MOMusic 源同步到 www/）
npm run sync:web
npm run sync:node

# 同步到 Android 工程
npm run cap:sync

# 构建 APK
npm run build:apk
```

产物：`android/app/build/outputs/apk/release/app-release.apk`

## 免责声明

本项目的音乐数据均来自各平台公开接口，仅供学习与技术交流使用，请勿用于商业用途。
