package com.momusic.android;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;

/**
 * 平台网页登录页（PC UA WebView）。
 * 伪装桌面浏览器打开 y.qq.com / www.kugou.com 登录页，
 * 登录成功后读取对应域 cookie 并提交给内嵌 Node（127.0.0.1:3000）。
 * 支持拦截 mqqapi:// / weixin:// 等 intent 唤起外部 App（QQ/微信授权）。
 */
public class LoginActivity extends Activity {

    public static final String EXTRA_PLATFORM = "platform";
    private static final String TAG = "MomusicLogin";
    private static final String PC_UA =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    private WebView webView;
    private String platform = "qq";
    private String lastCookies = "";
    private final Handler handler = new Handler();
    private boolean submitted = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        platform = getIntent().getStringExtra(EXTRA_PLATFORM);
        if (platform == null) platform = "qq";
        WebView.setWebContentsDebuggingEnabled(true);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);

        Button doneBtn = new Button(this);
        doneBtn.setText("完成登录");
        doneBtn.setTextSize(15);
        doneBtn.setTextColor(Color.WHITE);
        doneBtn.setBackgroundColor(Color.rgb(32, 36, 44));
        doneBtn.setOnClickListener(v -> collectAndSubmitCookies());
        root.addView(doneBtn, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, dp(48)));

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setUserAgentString(PC_UA);
        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("mqqapi://") || url.startsWith("wtloginmqq://")
                    || url.startsWith("weixin://") || url.startsWith("alipays://")
                    || url.startsWith("mqqwpa://") || url.startsWith("intent://")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                        return true;
                    } catch (Exception e) {
                        Log.w(TAG, "intent launch failed: " + url, e);
                    }
                }
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        root.addView(webView, new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f));
        setContentView(root);

        String url;
        if ("qq".equals(platform)) {
            // QQ 音乐 OAuth 登录页（QQ 扫码/密码），避免 y.qq.com 主页默认的微信扫码
            url = "https://xui.ptlogin2.qq.com/cgi-bin/xlogin?appid=716027609&daid=383&style=33"
                + "&login_text=%E7%99%BB%E5%BD%95&hide_title_bar=1&hide_border=1&target=self"
                + "&s_url=https%3A%2F%2Fgraph.qq.com%2Foauth2.0%2Flogin_jump&pt_3rd_aid=100497308"
                + "&pt_feedback_link=https%3A%2F%2Fsupport.qq.com%2Fproducts%2F77942%3FcustomInfo%3D.appid100497308"
                + "&theme=2";
        } else {
            url = "https://www.kugou.com";
        }
        webView.loadUrl(url);

        // 自动检测：检测到登录态 cookie（登录完成）后自动提交，最多一次
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (submitted) return;
                String cookies = readCookies();
                if (hasLoginSignal(cookies)) {
                    lastCookies = cookies;
                    submitCookies(cookies);
                }
                handler.postDelayed(this, 2000);
            }
        }, 3000);
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private String readCookies() {
        CookieManager cm = CookieManager.getInstance();
        if ("qq".equals(platform)) {
            return join(
                cm.getCookie("https://y.qq.com"),
                cm.getCookie("https://y.qq.com/"),
                cm.getCookie("https://graph.qq.com"),
                cm.getCookie("https://qzone.qq.com"),
                cm.getCookie("https://qq.com")
            );
        }
        return join(
            cm.getCookie("https://www.kugou.com"),
            cm.getCookie("https://kugou.com"),
            cm.getCookie("https://login-user.kugou.com"),
            cm.getCookie("https://login.kugou.com")
        );
    }

    private boolean hasLoginSignal(String cookies) {
        if (cookies == null || cookies.isEmpty()) return false;
        if ("qq".equals(platform)) {
            return cookies.indexOf("uin=") >= 0
                && (cookies.indexOf("skey=") >= 0 || cookies.indexOf("qqmusic_key=") >= 0);
        }
        return cookies.indexOf("KuGoo=") >= 0
            || cookies.indexOf("KugooID=") >= 0
            || cookies.indexOf("userid=") >= 0;
    }

    private String join(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isEmpty()) {
                if (sb.length() > 0) sb.append("; ");
                sb.append(p);
            }
        }
        return sb.toString();
    }

    private void collectAndSubmitCookies() {
        String cookies = readCookies();
        if (!hasLoginSignal(cookies)) {
            Log.i(TAG, "no login signal yet, keep login in webview");
            return;
        }
        submitCookies(cookies);
    }

    private void submitCookies(final String cookies) {
        if (cookies == null || cookies.trim().isEmpty()) {
            Log.i(TAG, "no cookies yet");
            return;
        }
        if (submitted) return;
        submitted = true;
        new Thread(() -> {
            try {
                String endpoint = "qq".equals(platform) ? "/api/qq/login/cookie" : "/api/kugou/login/cookie";
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection)
                    new java.net.URL("http://127.0.0.1:3000" + endpoint).openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(10000);
                String body = "{\"cookie\":\"" + cookies.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}";
                conn.getOutputStream().write(body.getBytes("UTF-8"));
                int code = conn.getResponseCode();
                String resp = "";
                try {
                    java.io.InputStream is = conn.getInputStream();
                    java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
                    byte[] buf = new byte[2048];
                    int n;
                    while ((n = is.read(buf)) != -1) bos.write(buf, 0, n);
                    resp = bos.toString("UTF-8");
                } catch (Exception ignored) { }
                Log.i(TAG, "submit " + endpoint + " -> " + code + " len=" + cookies.length());
                conn.disconnect();
                if (code == 200 && resp.indexOf("\"loggedIn\":true") >= 0) {
                    Log.i(TAG, "login ok, auto closing");
                    runOnUiThread(() -> finish());
                }
            } catch (Exception e) {
                Log.e(TAG, "submit failed", e);
            }
        }).start();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
