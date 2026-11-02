#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo " Flutter Android Release Build Pipeline"
echo " Target Platform: android-arm64 (64-bit ARM)"
echo " Min SDK: 28 (Android 9 Pie) | Target SDK: 36 (Android 16)"
echo " Icon Subsetting: --no-tree-shake-icons"
echo "=========================================================="

# 1. Clean previous build artifacts
echo "🧹 [Step 1/3] Cleaning previous build artifacts..."
flutter clean

# 2. Resolve pub dependencies
echo "📦 [Step 2/3] Resolving dependencies..."
flutter pub get

# 3. Compile release APK
echo "🚀 [Step 3/3] Compiling release APK for arm64..."
flutter build apk --release --target-platform=android-arm64 --no-tree-shake-icons

echo ""
echo "✅ Build complete!"
echo "📁 Generated APK:"
ls -lh build/app/outputs/flutter-apk/*.apk || true
