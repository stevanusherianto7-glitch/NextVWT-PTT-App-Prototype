# ===== NextVWT PTT App — ProGuard Rules (Maximum Obfuscation) =====

# ---- CRITICAL: Keep Capacitor bridge ----
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}

# ---- Keep app entry point ----
-keep class com.nextvwt.ptt.MainActivity { *; }

# ---- Obfuscation Settings ----
-dontwarn javax.annotation.**
-dontwarn okhttp3.**
-dontwarn okio.**

# Maximum obfuscation
-repackageclasses ''
-allowaccessmodification
-mergeinterfacesaggressively

# Remove all logging in production
-assumenosideeffects class android.util.Log {
    public static int v(...);
    public static int d(...);
    public static int i(...);
    public static int w(...);
    public static int e(...);
    public static int wtf(...);
}

# Remove all System.out in production
-assumenosideeffects class java.io.PrintStream {
    public void println(%s);
    public void println(**);
}

# String encryption (manual class-level)
-adaptclassstrings com.nextvwt.**

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
