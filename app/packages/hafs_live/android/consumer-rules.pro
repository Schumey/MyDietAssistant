# The code scanner of Play services starts ML Kit through component registrars that are created by reflection (no-arg
# constructor). R8 in the app's release build removed those constructors, ML Kit failed to start ("Could not
# instantiate ...CommonComponentRegistrar", NoSuchMethodException <init>) and the scanner reported "unavailable", so the
# nutrition page fell back to the WebView camera, which the app does not grant.
-keep class * implements com.google.firebase.components.ComponentRegistrar { public <init>(); }
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit_code_scanner.** { *; }
-dontwarn com.google.mlkit.**
