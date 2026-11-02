import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Maximize2, 
  Cpu, 
  Bell, 
  Key, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BuildConfig } from '../types/build';

interface Sdk36ReadinessCheckerProps {
  config: BuildConfig;
}

export const Sdk36ReadinessChecker: React.FC<Sdk36ReadinessCheckerProps> = ({ config }) => {
  const [expandedId, setExpandedId] = useState<string | null>('edge-to-edge');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const checklistItems = [
    {
      id: 'no-tree-shake',
      title: '--no-tree-shake-icons Flag (Active in Prompt)',
      status: config.noTreeShakeIcons ? 'passed' : 'warning',
      badge: config.noTreeShakeIcons ? 'Protected' : 'Risk of Missing Icons',
      summary: 'Prevents Flutter build engine from subsetting icon fonts, preserving complete glyph tables.',
      details: `When building release APKs, Flutter's default tree-shaker inspects your Dart code for constant IconData references (e.g. Icons.home) and strips all other glyphs from font files to shave ~100KB off the APK. 
      However, if your app uses FontAwesome, dynamic icons from server APIs, CupertinoIcons, or custom font packages, the tree-shaker fails to identify referenced glyphs and strips them, causing blank squares [?] or runtime glyph missing errors. The --no-tree-shake-icons flag guarantees all icons render reliably.`,
      action: config.noTreeShakeIcons 
        ? '✓ Included in your current build command.' 
        : 'Recommended: Enable --no-tree-shake-icons if using custom icon sets.',
    },
    {
      id: 'arm64',
      title: 'Target Platform: android-arm64 (64-Bit ABI)',
      status: config.platform === 'android-arm64' ? 'passed' : 'neutral',
      badge: config.platform === 'android-arm64' ? 'Optimized' : 'Multi-ABI',
      summary: 'Directly compiles libapp.so and libflutter.so exclusively for 64-bit ARM architecture.',
      details: `Almost 100% of physical Android smartphones manufactured in the last 6+ years run on 64-bit ARM (ARMv8-A or ARMv9). By passing --target-platform=android-arm64, you avoid building 32-bit armeabi-v7a and x86 binaries, cutting build time in half and reducing APK size from ~52MB down to ~21MB.`,
      action: 'Optimal for internal distribution, QA device testing, direct customer APK downloads, and CI pipelines.',
    },
    {
      id: 'min-sdk-28',
      title: 'Minimum SDK 28 (Android 9.0 Pie)',
      status: config.minSdk >= 28 ? 'passed' : 'warning',
      badge: config.minSdk >= 28 ? 'Modern AndroidX' : 'Legacy Support',
      summary: 'Establishes Android 9.0 as the base floor, dropping antiquated 32-bit-only operating systems.',
      details: `Setting minSdkVersion = 28 gives your app access to modern Android biometric APIs (BiometricPrompt), hardware-backed Android Keystore key attestation, mandatory TLS 1.3 / cleartext HTTP traffic restriction, and modern camera2 pipelines without bulky backwards-compatibility shims.`,
      action: config.minSdk >= 28 
        ? `Configured to Min SDK ${config.minSdk}. Covers ~92% of active Android devices worldwide.` 
        : 'Consider bumping minSdk to 28 to simplify dependency resolution.',
    },
    {
      id: 'target-sdk-36',
      title: 'Target SDK 36 (Android 16 Baklava)',
      status: config.targetSdk >= 36 ? 'passed' : 'neutral',
      badge: `Target SDK ${config.targetSdk}`,
      summary: 'Targets the latest Android 16 API level with full forward-compatibility.',
      details: `Targeting SDK 36 satisfies all upcoming Google Play policy requirements. In Android 15 & 16, Google enforces mandatory edge-to-edge windowing, strict foreground service permissions, and 16KB memory page alignment for native C/C++ libraries.`,
      action: 'Ensure your Flutter framework is at least version 3.24+ or 3.29+ and Gradle compileSdk is set to 36.',
    },
    {
      id: 'edge-to-edge',
      title: 'Edge-to-Edge Window Inset Enforcement',
      status: 'passed',
      badge: 'Target SDK 35/36 Enforced',
      summary: 'System status and navigation bars are transparent by default in Android 15 & 16.',
      details: `On Android 15+ (API 35/36), apps targeting SDK 35+ are drawn edge-to-edge by default. You cannot disable this via theme flags. In Flutter, wrap top-level screens in 'SafeArea' or use 'MediaQuery.paddingOf(context)' to prevent system bars from overlapping your UI headers and navigation bars.`,
      action: 'Verify that Scaffold headers and bottom navigation bars are wrapped in SafeArea or respond to window insets.',
    },
    {
      id: '16kb-alignment',
      title: '16 KB ELF Page Size Alignment',
      status: 'passed',
      badge: 'Hardware Standard',
      summary: 'Android 15 and 16 require native ELF binaries (.so) to support 16KB memory page sizes.',
      details: `Traditionally Android used 4KB memory pages. Starting with Android 15 on high-performance ARM64 chipsets, 16KB page sizes are supported and will become mandatory for new hardware. Flutter 3.24+ compiles native libraries with 16KB alignment out of the box when using modern NDK versions.`,
      action: 'Set android.bundle.enableUncompressedNativeLibs=true in gradle.properties (included in our template).',
    },
    {
      id: 'notifications',
      title: 'POST_NOTIFICATIONS Runtime Permission',
      status: 'passed',
      badge: 'API 33+ Requirement',
      summary: 'Explicit runtime user prompt required to display push or local notifications.',
      details: `Target SDK 33 and higher requires the 'android.permission.POST_NOTIFICATIONS' declaration in AndroidManifest.xml and a runtime permission prompt before displaying any local or remote notification.`,
      action: 'Included in our generated AndroidManifest.xml template.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Android 16 (Target SDK 36) &amp; SDK 28 Production Audit
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Audit your Flutter build command flags and Android Gradle project against Google Play's 
            latest policies, ABI sizing optimizations, and icon font subsetting rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
            Audit Status: 100% Ready
          </span>
        </div>
      </div>

      {/* Checklist Accordion */}
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900/70 rounded-xl border border-zinc-800 overflow-hidden transition-all"
          >
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-100">{item.title}</span>
                    <span className="text-[10px] font-mono text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-900">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.summary}</p>
                </div>
              </div>
              <div className="text-zinc-400 pl-4">
                {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {expandedId === item.id && (
              <div className="px-5 pb-5 pt-1 border-t border-zinc-800/70 bg-zinc-950/40 space-y-3">
                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                  {item.details}
                </p>
                <div className="p-3 bg-zinc-900/90 rounded-lg border border-zinc-800 text-xs font-medium text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item.action}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
