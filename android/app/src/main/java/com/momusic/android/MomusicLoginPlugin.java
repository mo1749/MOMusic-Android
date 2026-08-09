package com.momusic.android;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 平台网页登录桥：前端调用打开 PC UA 登录页（QQ/酷狗）。
 */
@CapacitorPlugin(name = "MomusicLogin")
public class MomusicLoginPlugin extends Plugin {

    @PluginMethod
    public void openLogin(PluginCall call) {
        String platform = call.getString("platform", "qq");
        Intent intent = new Intent(getContext(), LoginActivity.class);
        intent.putExtra(LoginActivity.EXTRA_PLATFORM, platform);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve(new JSObject().put("ok", true));
    }
}
