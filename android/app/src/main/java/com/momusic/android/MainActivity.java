package com.momusic.android;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import com.getcapacitor.BridgeActivity;

/**
 * MoMusic Android 主 Activity。
 * 沉浸式全屏：状态栏 + 导航栏自动隐藏（滑动边缘临时显示，数秒后再次自动隐藏）。
 * - API 30+（Android 11+）：WindowInsetsController（官方推荐）
 * - API 23-29：SYSTEM_UI_FLAG_IMMERSIVE_STICKY（低端老设备兼容）
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MomusicLoginPlugin.class);
        super.onCreate(savedInstanceState);
        // 禁用 WebView 缓存：本地资源始终加载最新版（避免 CSS/JS 版本号未更新导致旧资源残留）
        try {
            android.webkit.WebView.setWebContentsDebuggingEnabled(true);
            getBridge().getWebView().getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
        } catch (Exception ignored) { }
        hideSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
        }
    }

    private void hideSystemBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }
}
