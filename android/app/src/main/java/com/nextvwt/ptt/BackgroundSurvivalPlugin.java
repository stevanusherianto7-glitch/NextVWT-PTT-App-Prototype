package com.nextvwt.ptt;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundSurvival")
public class BackgroundSurvivalPlugin extends Plugin {

    @PluginMethod
    public void startService(PluginCall call) {
        String channelInfo = call.getString("channelInfo", "Siaga di latar belakang");
        try {
            Context context = getContext();
            Intent intent = new Intent(context, PTTForegroundService.class);
            intent.putExtra("channelInfo", channelInfo);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
            
            JSObject ret = new JSObject();
            ret.put("status", "started");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to start foreground service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent(context, PTTForegroundService.class);
            context.stopService(intent);
            
            JSObject ret = new JSObject();
            ret.put("status", "stopped");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop foreground service: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void checkBatteryWhitelist(PluginCall call) {
        try {
            Context context = getContext();
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            boolean isWhitelisted = false;
            if (pm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                isWhitelisted = pm.isIgnoringBatteryOptimizations(context.getPackageName());
            }
            
            JSObject ret = new JSObject();
            ret.put("isWhitelisted", isWhitelisted);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to check battery optimization status: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void requestBatteryWhitelist(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent();
            String packageName = context.getPackageName();
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            
            if (pm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                    intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + packageName));
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                    
                    JSObject ret = new JSObject();
                    ret.put("status", "requested");
                    call.resolve(ret);
                } else {
                    JSObject ret = new JSObject();
                    ret.put("status", "already_whitelisted");
                    call.resolve(ret);
                }
            } else {
                call.reject("Battery optimization APIs not supported on this version of Android");
            }
        } catch (Exception e) {
            call.reject("Failed to request ignore battery optimizations: " + e.getMessage(), e);
        }
    }
}
