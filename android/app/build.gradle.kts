plugins {
    id("com.android.application")
    id("com.google.gms.google-services") // ✅ important
}

android {
    compileSdk = 34

    defaultConfig {
        applicationId = "com.LearnPython.app" // your package name
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    // other settings
}

dependencies {
    // Firebase BoM
    implementation(platform("com.google.firebase:firebase-bom:34.7.0"))

    // Firebase Analytics (example)
    implementation("com.google.firebase:firebase-analytics")

    // Add any other Firebase products you need
}
