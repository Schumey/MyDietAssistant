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
        versionCode = 2
        versionName = "0.2.0"
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            // Sideload only: signed with the local debug key so the APK installs without a keystore.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

dependencies {
    // Google code scanner: the camera UI runs in Play services, so the app needs no camera code of its own for barcodes.
    implementation("com.google.android.gms:play-services-code-scanner:16.1.0")
}
