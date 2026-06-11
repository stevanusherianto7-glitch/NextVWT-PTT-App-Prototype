package com.nextvwt.ptt;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class PTTForegroundService extends Service {
    private static final String CHANNEL_ID = "NextVWT_PTT_Service_Channel";
    private static final int NOTIFICATION_ID = 9912;
    
    private PowerManager.WakeLock wakeLock = null;
    private WifiManager.WifiLock wifiLock = null;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String channelInfo = intent != null ? intent.getStringExtra("channelInfo") : null;
        if (channelInfo == null) {
            channelInfo = "Siaga di latar belakang";
        }

        // Acquire locks to survive deep sleep
        acquireWakeLocks();

        Notification notification = buildNotification(channelInfo);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            int serviceType = ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE 
                            | ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
            startForeground(NOTIFICATION_ID, notification, serviceType);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        releaseWakeLocks();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void acquireWakeLocks() {
        try {
            if (wakeLock == null) {
                PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NextVWT::PTTBackgroundWakeLock");
                    wakeLock.acquire();
                }
            }
            if (wifiLock == null) {
                WifiManager wm = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
                if (wm != null) {
                    wifiLock = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "NextVWT::PTTBackgroundWifiLock");
                    wifiLock.acquire();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void releaseWakeLocks() {
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
                wakeLock = null;
            }
            if (wifiLock != null && wifiLock.isHeld()) {
                wifiLock.release();
                wifiLock = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "NextVWT PTT Service Channel",
                NotificationManager.IMPORTANCE_LOW
            );
            serviceChannel.setDescription("Saluran komunikasi latar belakang NextVWT");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification buildNotification(String text) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("NextVWT PTT Aktif")
            .setContentText(text)
            .setSmallIcon(R.mipmap.ic_launcher) // app icon fallback
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
    }
}
