import { BuildConfig } from '../types/build';

export function generateFlutterBuildArgs(config: BuildConfig): string[] {
  const args: string[] = ['build', config.target];

  if (config.mode === 'release') {
    args.push('--release');
  } else if (config.mode === 'profile') {
    args.push('--profile');
  } else if (config.mode === 'debug') {
    args.push('--debug');
  }

  // Target platform / Split ABI
  if (config.platform === 'split-per-abi') {
    args.push('--split-per-abi');
  } else if (config.platform !== 'universal') {
    args.push(`--target-platform=${config.platform}`);
  }

  // Icon tree-shaking
  if (config.noTreeShakeIcons) {
    args.push('--no-tree-shake-icons');
  }

  // Obfuscation
  if (config.obfuscate) {
    args.push('--obfuscate');
    if (config.splitDebugInfo) {
      args.push(`--split-debug-info=${config.splitDebugInfo}`);
    }
  }

  // Build name & number
  if (config.buildName) {
    args.push(`--build-name=${config.buildName}`);
  }
  if (config.buildNumber) {
    args.push(`--build-number=${config.buildNumber}`);
  }

  // Flavor & Target entrypoint
  if (config.flavor) {
    args.push(`--flavor=${config.flavor}`);
  }
  if (config.mainEntry && config.mainEntry !== 'lib/main.dart') {
    args.push(`-t ${config.mainEntry}`);
  }

  // Dart Defines
  config.dartDefines
    .filter((d) => d.enabled && d.key.trim().length > 0)
    .forEach((d) => {
      args.push(`--dart-define=${d.key.trim()}=${d.value.trim()}`);
    });

  if (config.outputDirectory) {
    args.push(`--output-directory=${config.outputDirectory}`);
  }

  if (config.offline) {
    args.push('--offline');
  }

  if (config.verbose) {
    args.push('-v');
  }

  return args;
}

export function generateGradleBuildCommand(config: BuildConfig): string {
  const flags: string[] = ['./gradlew', 'assembleRelease'];
  flags.push(`-PshrinkResources=${config.shrinkResources}`);
  flags.push(`-PminifyEnabled=${config.minifyEnabled}`);
  return flags.join(' ');
}

export function generateFullScript(config: BuildConfig): string {
  const lines: string[] = [];
  
  if (config.runClean) {
    lines.push('# Clean previous build artifacts');
    lines.push('flutter clean');
    lines.push('');
  }

  if (config.runPubGet) {
    lines.push('# Fetch and resolve dependencies');
    lines.push('flutter pub get');
    lines.push('');
  }

  const buildArgs = generateFlutterBuildArgs(config).join(' ');
  lines.push(`# Compile ${config.platform === 'split-per-abi' ? 'split-per-ABI' : config.platform} ${config.mode} ${config.target.toUpperCase()} with Min SDK ${config.minSdk} and Target SDK ${config.targetSdk}`);
  lines.push(`flutter ${buildArgs}`);

  return lines.join('\n');
}

export function generateBashScript(config: BuildConfig): string {
  const buildCommand = `flutter ${generateFlutterBuildArgs(config).join(' ')}`;
  return `#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo " Flutter Android Release APK Build Pipeline"
echo " Target Platform: ${config.platform}"
echo " Min SDK: ${config.minSdk} | Target SDK: ${config.targetSdk}"
echo "=============================================="

# 1. Environment Verification
if ! command -v flutter &> /dev/null; then
  echo "❌ Error: 'flutter' command not found. Ensure Flutter SDK is added to your PATH."
  exit 1
fi

echo "✓ Flutter SDK detected: $(flutter --version | head -n 1)"

${config.runClean ? `# 2. Clean previous build artifacts
echo "🧹 Cleaning previous build artifacts..."
flutter clean
` : ''}
${config.runPubGet ? `# 3. Resolve pub dependencies
echo "📦 Resolving pub packages..."
flutter pub get
` : ''}
# 4. Compile APK with specified parameters
echo "🚀 Building ${config.target.toUpperCase()} (${config.platform}, Min SDK ${config.minSdk}, Target SDK ${config.targetSdk})..."
${buildCommand}

echo "✅ Build completed successfully!"
echo "📁 Artifact location:"
if [ -d "build/app/outputs/flutter-apk" ]; then
  ls -lh build/app/outputs/flutter-apk/*.apk
elif [ -d "build/app/outputs/bundle/release" ]; then
  ls -lh build/app/outputs/bundle/release/*.aab
fi
`;
}

export function generatePowerShellScript(config: BuildConfig): string {
  const buildCommand = `flutter ${generateFlutterBuildArgs(config).join(' ')}`;
  return `# Flutter Android Release Build Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Flutter Android Release APK Build Pipeline" -ForegroundColor Cyan
Write-Host " Target: ${config.platform} | Min SDK: ${config.minSdk} | Target SDK: ${config.targetSdk}" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

# Check Flutter existence
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Error "Flutter SDK not found in PATH."
    exit 1
}

${config.runClean ? `Write-Host "--> Cleaning previous build artifacts..." -ForegroundColor Yellow
flutter clean
` : ''}
${config.runPubGet ? `Write-Host "--> Fetching dependencies..." -ForegroundColor Yellow
flutter pub get
` : ''}
Write-Host "--> Building ${config.target.toUpperCase()}..." -ForegroundColor Green
${buildCommand}

Write-Host "--> Build complete!" -ForegroundColor Green
Get-ChildItem -Path "build\\app\\outputs\\flutter-apk\\*.apk" | Select-Object Name, Length, LastWriteTime
`;
}

export function generateGitHubWorkflow(config: BuildConfig): string {
  const buildCommand = `flutter ${generateFlutterBuildArgs(config).join(' ')}`;
  return `name: Build Flutter Android Release

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build ${config.platform} ${config.target.toUpperCase()}
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Java Development Kit (JDK 21)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Set up Flutter SDK
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.29.x'
          channel: 'stable'
          cache: true

      - name: Verify Flutter doctor
        run: flutter doctor -v

      ${config.runClean ? `- name: Clean build artifacts
        run: flutter clean
` : ''}
      ${config.runPubGet ? `- name: Install dependencies
        run: flutter pub get
` : ''}
      - name: Build Android Release Artifact
        run: ${buildCommand}

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: flutter-${config.target}-${config.platform}-release
          path: |
            build/app/outputs/flutter-apk/*.apk
            build/app/outputs/bundle/release/*.aab
          if-no-files-found: error
          retention-days: 14
`;
}

export function generateKotlinGradle(config: BuildConfig): string {
  return `// android/app/build.gradle.kts
plugins {
    id("com.android.application")
    id("kotlin-android")
    // Flutter Gradle Plugin must be applied after Android and Kotlin
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.example.flutter_app"
    compileSdk = ${config.compileSdk}
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    defaultConfig {
        applicationId = "com.example.flutter_app"
        // Target and Minimum SDK requested
        minSdk = ${config.minSdk}
        targetSdk = ${config.targetSdk}
        versionCode = flutter.versionCode
        versionName = flutter.versionName

        ${config.platform === 'android-arm64' ? `// Specific 64-bit ARM ABI target
        ndk {
            abiFilters.add("arm64-v8a")
        }` : config.platform === 'android-arm' ? `// 32-bit ARM ABI target
        ndk {
            abiFilters.add("armeabi-v7a")
        }` : config.platform === 'android-x64' ? `// x86_64 Emulator/Intel ABI target
        ndk {
            abiFilters.add("x86_64")
        }` : `// Multi-ABI / Split per ABI support
        ndk {
            abiFilters.addAll(listOf("arm64-v8a", "armeabi-v7a", "x86_64"))
        }`}
    }

    signingConfigs {
        create("release") {
            // Configure signing in android/key.properties
            storeFile = file(project.property("MYAPP_RELEASE_STORE_FILE") ?: "my-release-key.jks")
            storePassword = project.property("MYAPP_RELEASE_STORE_PASSWORD") ?: "password"
            keyAlias = project.property("MYAPP_RELEASE_KEY_ALIAS") ?: "my-key-alias"
            keyPassword = project.property("MYAPP_RELEASE_KEY_PASSWORD") ?: "password"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // Code & resource shrinking flags (supports CLI -PshrinkResources and -PminifyEnabled flags)
            isMinifyEnabled = project.findProperty("minifyEnabled")?.toString()?.toBoolean() ?: ${config.minifyEnabled}
            isShrinkResources = project.findProperty("shrinkResources")?.toString()?.toBoolean() ?: ${config.shrinkResources}
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

flutter {
    source = "../.."
}
`;
}

export function generateGroovyGradle(config: BuildConfig): string {
  return `// android/app/build.gradle
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.example.flutter_app"
    compileSdkVersion ${config.compileSdk}
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    defaultConfig {
        applicationId "com.example.flutter_app"
        minSdkVersion ${config.minSdk}
        targetSdkVersion ${config.targetSdk}
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName

        ${config.platform === 'android-arm64' ? `ndk {
            abiFilters "arm64-v8a"
        }` : config.platform === 'split-per-abi' ? `ndk {
            abiFilters "arm64-v8a", "armeabi-v7a", "x86_64"
        }` : `ndk {
            abiFilters "arm64-v8a", "armeabi-v7a", "x86_64"
        }`}
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            // Code & resource shrinking flags (supports CLI -PshrinkResources and -PminifyEnabled flags)
            minifyEnabled project.hasProperty('minifyEnabled') ? project.property('minifyEnabled').toBoolean() : ${config.minifyEnabled}
            shrinkResources project.hasProperty('shrinkResources') ? project.property('shrinkResources').toBoolean() : ${config.shrinkResources}
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

flutter {
    source '../..'
}
`;
}

export function generateGradleProperties(config: BuildConfig): string {
  return `# android/gradle.properties
# Project-wide Gradle settings for Flutter Android builds

org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseG1GC
android.useAndroidX=true
android.enableJetifier=false

# Target SDK ${config.targetSdk} & Modern Android 15/16 16KB Page alignment
${config.enable16KbPages ? 'android.bundle.enableUncompressedNativeLibs=true\nandroid.native.buildReport.enabled=true' : '# 16KB alignment enabled'}

# R8 Full Mode for enhanced bytecode shrinking and dead-code elimination
android.enableR8.fullMode=${config.minifyEnabled ? 'true' : 'false'}

# Android resource shrinking flag
android.enableResourceShrinking=${config.shrinkResources}

# Suppress Kotlin experimental warnings during Flutter Gradle plugin compilation
kotlin.incremental=true
`;
}

export function generateAndroidManifest(config: BuildConfig): string {
  return `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.flutter_app">

    <!-- Permissions required for Target SDK ${config.targetSdk} (Android 16) -->
    <uses-permission android:name="android.permission.INTERNET"/>
    
    <!-- For notifications on Android 13+ (Target SDK 33+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <application
        android:label="Flutter App"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="false"
        android:supportsRtl="true"
        android:extractNativeLibs="false">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:taskAffinity=""
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <!-- Target SDK 35/36 Edge-to-Edge window layout defaults -->
            <meta-data
                android:name="io.flutter.embedding.android.NormalTheme"
                android:resource="@style/NormalTheme" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <!-- Don't delete Flutter metadata -->
        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>
`;
}

export function generateKeytoolCommand(): string {
  return `keytool -genkey -v -keystore android/app/my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias`;
}

export function generateKeyProperties(): string {
  return `# android/key.properties
# NEVER commit this file with real passwords to public git repositories!
storePassword=YourKeystorePasswordHere
keyPassword=YourKeyPasswordHere
keyAlias=my-key-alias
storeFile=my-release-key.jks
`;
}
