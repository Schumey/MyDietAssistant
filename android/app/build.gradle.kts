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
        versionCode = 3
        versionName = "0.3.0"
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
    // Health Connect: read weight, steps and active calories (feature of the web interface, see Health.kt)
    implementation("androidx.health.connect:connect-client:1.1.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
}
