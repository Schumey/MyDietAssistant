plugins {
    id("com.android.application")
}

android {
    namespace = "io.github.schumey.mydiet"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.schumey.mydiet"
        minSdk = 26
        // Sideloaded APK: target 34 keeps the WebView below the system bars (no forced edge-to-edge).
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Sideload only: signed with the local debug key so the APK installs without a keystore.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}
