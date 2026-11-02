import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Info, 
  Cpu, 
  Sliders, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  FileCode2,
  Terminal,
  Zap,
  ArrowRight,
  Minimize2
} from 'lucide-react';
import { BuildConfig, TargetPlatform } from '../types/build';
import { generateFlutterBuildArgs, generateFullScript, generateGradleBuildCommand } from '../utils/commandGenerator';

interface CommandWorkbenchProps {
  config: BuildConfig;
  onConfigChange: (updated: BuildConfig) => void;
  onRunSimulator: () => void;
  onNavigateToTab: (tab: 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer') => void;
}

export const CommandWorkbench: React.FC<CommandWorkbenchProps> = ({
  config,
  onConfigChange,
  onRunSimulator,
  onNavigateToTab
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedOneLiner, setCopiedOneLiner] = useState(false);
  const [copiedGradleCommand, setCopiedGradleCommand] = useState(false);
  const [commandViewMode, setCommandViewMode] = useState<'flutter' | 'gradle'>('flutter');
  const [newDefineKey, setNewDefineKey] = useState('');
  const [newDefineVal, setNewDefineVal] = useState('');

  const fullScript = generateFullScript(config);
  const gradleBuildCmd = generateGradleBuildCommand(config);
  const singleLineBuild = `flutter ${generateFlutterBuildArgs(config).join(' ')}`;
  const combinedOneLiner = `${config.runClean ? 'flutter clean && ' : ''}${config.runPubGet ? 'flutter pub get && ' : ''}${singleLineBuild}`;
  const combinedGradleOneLiner = `cd android && ${gradleBuildCmd}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(fullScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyOneLiner = () => {
    navigator.clipboard.writeText(combinedOneLiner);
    setCopiedOneLiner(true);
    setTimeout(() => setCopiedOneLiner(false), 2000);
  };

  const handlePlatformChange = (platform: TargetPlatform) => {
    onConfigChange({ ...config, platform });
  };

  const handleAddDartDefine = () => {
    if (!newDefineKey.trim()) return;
    const newDefines = [
      ...config.dartDefines,
      {
        id: Date.now().toString(),
        key: newDefineKey.trim(),
        value: newDefineVal.trim(),
        enabled: true,
      },
    ];
    onConfigChange({ ...config, dartDefines: newDefines });
    setNewDefineKey('');
    setNewDefineVal('');
  };

  const handleRemoveDartDefine = (id: string) => {
    onConfigChange({
      ...config,
      dartDefines: config.dartDefines.filter((d) => d.id !== id),
    });
  };

  const handleToggleDartDefine = (id: string) => {
    onConfigChange({
      ...config,
      dartDefines: config.dartDefines.map((d) =>
        d.id === id ? { ...d, enabled: !d.enabled } : d
      ),
    });
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === 'user-arm64') {
      onConfigChange({
        ...config,
        target: 'apk',
        mode: 'release',
        platform: 'android-arm64',
        noTreeShakeIcons: true,
        runClean: true,
        runPubGet: true,
        minSdk: 28,
        targetSdk: 36,
        compileSdk: 36,
        obfuscate: false,
        minifyEnabled: true,
      });
    } else if (presetKey === 'split-abi') {
      onConfigChange({
        ...config,
        target: 'apk',
        mode: 'release',
        platform: 'split-per-abi',
        noTreeShakeIcons: true,
        runClean: true,
        runPubGet: true,
        minSdk: 28,
        targetSdk: 36,
        compileSdk: 36,
        minifyEnabled: true,
      });
    } else if (presetKey === 'obfuscated') {
      onConfigChange({
        ...config,
        target: 'apk',
        mode: 'release',
        platform: 'android-arm64',
        noTreeShakeIcons: true,
        runClean: true,
        runPubGet: true,
        minSdk: 28,
        targetSdk: 36,
        compileSdk: 36,
        obfuscate: true,
        splitDebugInfo: './build/app/outputs/symbols',
        minifyEnabled: true,
      });
    } else if (presetKey === 'appbundle') {
      onConfigChange({
        ...config,
        target: 'appbundle',
        mode: 'release',
        platform: 'universal',
        noTreeShakeIcons: true,
        runClean: true,
        runPubGet: true,
        minSdk: 28,
        targetSdk: 36,
        compileSdk: 36,
        minifyEnabled: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Presets:
        </span>
        <button
          onClick={() => applyPreset('user-arm64')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            config.platform === 'android-arm64' && config.noTreeShakeIcons && config.minSdk === 28
              ? 'bg-sky-950/70 border-sky-600/70 text-sky-200'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          Target arm64 + No-Tree-Shake (Your Prompt)
        </button>
        <button
          onClick={() => applyPreset('split-abi')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            config.platform === 'split-per-abi'
              ? 'bg-sky-950/70 border-sky-600/70 text-sky-200'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          Split-per-ABI Multi APK
        </button>
        <button
          onClick={() => applyPreset('obfuscated')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            config.obfuscate
              ? 'bg-sky-950/70 border-sky-600/70 text-sky-200'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          Release + Symbol Obfuscation
        </button>
        <button
          onClick={() => applyPreset('appbundle')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            config.target === 'appbundle'
              ? 'bg-sky-950/70 border-sky-600/70 text-sky-200'
              : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:border-zinc-500'
          }`}
        >
          Google Play AAB (.aab)
        </button>
      </div>

      {/* Main Grid: Left Configurator / Right Live Script Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Pre-Build & Target Mode */}
          <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Pipeline Lifecycle &amp; Target
              </h2>
              <span className="text-xs text-zinc-400">Step 1 &amp; 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 cursor-pointer hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.runClean}
                  onChange={(e) => onConfigChange({ ...config, runClean: e.target.checked })}
                  className="mt-1 rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-900"
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">flutter clean</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Deletes previous build cache, ephemeral build artifacts, and gradle build cache.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-950/60 cursor-pointer hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.runPubGet}
                  onChange={(e) => onConfigChange({ ...config, runPubGet: e.target.checked })}
                  className="mt-1 rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-900"
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">flutter pub get</div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Resolves dependencies, generates package config, and ensures plugins are ready.
                  </p>
                </div>
              </label>
            </div>

            {/* Target Type & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Build Output Target
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onConfigChange({ ...config, target: 'apk' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      config.target === 'apk'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    APK (.apk)
                  </button>
                  <button
                    type="button"
                    onClick={() => onConfigChange({ ...config, target: 'appbundle' })}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      config.target === 'appbundle'
                        ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    App Bundle (.aab)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Build Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['release', 'profile', 'debug'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onConfigChange({ ...config, mode: m })}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center capitalize transition-all ${
                        config.mode === m
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Platform Architecture & ABI */}
          <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Target Architecture &amp; ABI Strategy
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">
                {config.platform === 'android-arm64' ? '18MB ~ 22MB APK' : config.platform === 'split-per-abi' ? '3 distinct APKs' : 'Universal (48MB+)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handlePlatformChange('android-arm64')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  config.platform === 'android-arm64'
                    ? 'border-emerald-500/80 bg-emerald-950/30 text-zinc-100 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    --target-platform=android-arm64
                  </span>
                  <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900">
                    Prompt Default
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Compiles strictly for 64-bit ARM (arm64-v8a). Covers 99% of modern Android physical phones.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('split-per-abi')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  config.platform === 'split-per-abi'
                    ? 'border-emerald-500/80 bg-emerald-950/30 text-zinc-100 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    --split-per-abi
                  </span>
                  <span className="text-[10px] uppercase font-mono text-sky-400 bg-sky-950 px-1.5 py-0.5 rounded border border-sky-900">
                    Sideload/Alt
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Emits 3 individual APKs: arm64-v8a, armeabi-v7a, and x86_64 for sideloading/direct links.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('universal')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  config.platform === 'universal'
                    ? 'border-emerald-500/80 bg-emerald-950/30 text-zinc-100 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">Universal Fat APK</span>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">All ABIs</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Bundles all binaries into one large APK (~48MB-55MB). Works everywhere, heavy download.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handlePlatformChange('android-x64')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  config.platform === 'android-x64'
                    ? 'border-emerald-500/80 bg-emerald-950/30 text-zinc-100 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-200">android-x64</span>
                  <span className="text-[10px] uppercase font-mono text-zinc-500">Emulator</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  For Intel/AMD PC Android Studio emulators and ChromeOS tablets.
                </p>
              </button>
            </div>
          </div>

          {/* Section 3: SDK Levels (Min 28, Target 36) & Flags */}
          <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                SDK Levels &amp; Flutter Flags
              </h2>
              <button
                type="button"
                onClick={() => onNavigateToTab('readiness')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                View Android 16 (SDK 36) Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-300 font-medium">Minimum SDK</label>
                  <span className="text-[11px] font-mono text-sky-400">Android 9</span>
                </div>
                <select
                  value={config.minSdk}
                  onChange={(e) => onConfigChange({ ...config, minSdk: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-1.5 px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={21}>21 - Android 5.0 (Legacy)</option>
                  <option value={24}>24 - Android 7.0</option>
                  <option value={26}>26 - Android 8.0</option>
                  <option value={28}>28 - Android 9.0 (User Prompt)</option>
                  <option value={30}>30 - Android 11.0</option>
                  <option value={33}>33 - Android 13.0</option>
                  <option value={34}>34 - Android 14.0</option>
                </select>
                <div className="text-[10px] text-zinc-500 mt-1">Guarantees modern AndroidX runtime.</div>
              </div>

              <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-300 font-medium">Target SDK</label>
                  <span className="text-[11px] font-mono text-purple-400">Android 16</span>
                </div>
                <select
                  value={config.targetSdk}
                  onChange={(e) =>
                    onConfigChange({
                      ...config,
                      targetSdk: Number(e.target.value),
                      compileSdk: Math.max(config.compileSdk, Number(e.target.value)),
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-1.5 px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={33}>33 - Android 13 (Tiramisu)</option>
                  <option value={34}>34 - Android 14 (UpsideDownCake)</option>
                  <option value={35}>35 - Android 15 (VanillaIceCream)</option>
                  <option value={36}>36 - Android 16 (Baklava - User Prompt)</option>
                </select>
                <div className="text-[10px] text-zinc-500 mt-1">Latest Google Play standard target.</div>
              </div>

              <div className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-300 font-medium">Compile SDK</label>
                  <span className="text-[11px] font-mono text-zinc-400">Gradle API</span>
                </div>
                <select
                  value={config.compileSdk}
                  onChange={(e) => onConfigChange({ ...config, compileSdk: Number(e.target.value) })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md py-1.5 px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500"
                >
                  <option value={34}>34 - Android 14 SDK</option>
                  <option value={35}>35 - Android 15 SDK</option>
                  <option value={36}>36 - Android 16 SDK (Recommended)</option>
                </select>
                <div className="text-[10px] text-zinc-500 mt-1">Must be &gt;= Target SDK.</div>
              </div>
            </div>

            {/* Tree Shaking & Obfuscation Toggles */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-lg border border-amber-900/40 bg-amber-950/20 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="noTreeShake"
                  checked={config.noTreeShakeIcons}
                  onChange={(e) => onConfigChange({ ...config, noTreeShakeIcons: e.target.checked })}
                  className="mt-1 rounded border-zinc-700 text-amber-500 focus:ring-amber-500/20 bg-zinc-900"
                />
                <div className="flex-1">
                  <label htmlFor="noTreeShake" className="text-xs font-semibold text-amber-200 cursor-pointer flex items-center gap-2">
                    --no-tree-shake-icons
                    <span className="text-[10px] font-mono bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">
                      Included in Prompt
                    </span>
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Bypasses Flutter font subsetting. Fixes runtime blank/missing icon glyphs `[?]` when using 
                    FontAwesome, custom icon TTF/OTF packs, or dynamically generated icon identifiers.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/50 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="obfuscate"
                  checked={config.obfuscate}
                  onChange={(e) => onConfigChange({ ...config, obfuscate: e.target.checked })}
                  className="mt-1 rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-900"
                />
                <div className="flex-1">
                  <label htmlFor="obfuscate" className="text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-2">
                    --obfuscate &amp; --split-debug-info
                  </label>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Scrambles Dart function and class names into unreadable symbols. Drops debug symbols into a separate folder for crash de-symbolication.
                  </p>
                  {config.obfuscate && (
                    <input
                      type="text"
                      value={config.splitDebugInfo}
                      onChange={(e) => onConfigChange({ ...config, splitDebugInfo: e.target.value })}
                      placeholder="./build/app/outputs/symbols"
                      className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs font-mono text-zinc-300 focus:outline-none focus:border-sky-500"
                    />
                  )}
                </div>
              </div>

              {/* R8 Code Shrinking (minifyEnabled) Toggle */}
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/50 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="minifyEnabled"
                  checked={config.minifyEnabled}
                  onChange={(e) => {
                    const isMinify = e.target.checked;
                    onConfigChange({
                      ...config,
                      minifyEnabled: isMinify,
                      shrinkResources: isMinify ? config.shrinkResources : false,
                    });
                  }}
                  className="mt-1 rounded border-zinc-700 text-sky-500 focus:ring-sky-500/20 bg-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label htmlFor="minifyEnabled" className="text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-2">
                      <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>R8 Code Shrinking (minifyEnabled / isMinifyEnabled)</span>
                    </label>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                        config.minifyEnabled
                          ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900'
                          : 'text-zinc-500 bg-zinc-900 border-zinc-800'
                      }`}
                    >
                      {config.minifyEnabled ? 'isMinifyEnabled = true' : 'isMinifyEnabled = false'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Controls <code className="text-sky-300 font-mono">isMinifyEnabled</code> in Kotlin DSL 
                    and <code className="text-sky-300 font-mono">minifyEnabled</code> in Groovy Gradle. 
                    Strips unused Java/Kotlin code, dead methods, and applies ProGuard optimization rules.
                  </p>
                </div>
              </div>

              {/* Resource Shrinking (shrinkResources) Standalone Toggle */}
              <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/50 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="shrinkResources"
                  checked={config.shrinkResources}
                  onChange={(e) => {
                    const isShrink = e.target.checked;
                    onConfigChange({
                      ...config,
                      shrinkResources: isShrink,
                      // In Android Gradle Plugin, resource shrinking requires code shrinking
                      minifyEnabled: isShrink ? true : config.minifyEnabled,
                    });
                  }}
                  className="mt-1 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/20 bg-zinc-900"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label htmlFor="shrinkResources" className="text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resource Shrinking (shrinkResources / isShrinkResources)</span>
                    </label>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded border transition-colors ${
                          config.shrinkResources
                            ? 'text-emerald-400 bg-emerald-950/60 border-emerald-900'
                            : 'text-zinc-500 bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        {config.shrinkResources ? 'isShrinkResources = true' : 'isShrinkResources = false'}
                      </span>
                      <span className="text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        -PshrinkResources={config.shrinkResources.toString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Passed to the Gradle build command via <code className="text-emerald-300 font-mono">-PshrinkResources={config.shrinkResources.toString()}</code> and 
                    configured directly in <code className="text-sky-300 font-mono">android/app/build.gradle.kts</code> and <code className="text-sky-300 font-mono">gradle.properties</code>. 
                    Strips unreferenced drawables, layouts, mipmaps, strings, and raw assets from the release APK.
                    <span className="text-zinc-300 block mt-0.5">
                      ✓ Automatically enforces code shrinking (<code className="text-zinc-200 font-mono">isMinifyEnabled = true</code>) as required by Android Gradle Plugin (AGP).
                    </span>
                  </p>
                </div>
              </div>
            </div>


            {/* Versioning & Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Build Name (--build-name)
                </label>
                <input
                  type="text"
                  value={config.buildName}
                  onChange={(e) => onConfigChange({ ...config, buildName: e.target.value })}
                  placeholder="1.0.0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Build Number (--build-number)
                </label>
                <input
                  type="text"
                  value={config.buildNumber}
                  onChange={(e) => onConfigChange({ ...config, buildNumber: e.target.value })}
                  placeholder="1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dart Defines (Environment Variables) */}
          <div className="bg-zinc-900/80 rounded-xl p-5 border border-zinc-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                Compile-Time Environment (--dart-define)
              </h2>
              <span className="text-[11px] text-zinc-400">String.fromEnvironment()</span>
            </div>

            <div className="space-y-2">
              {config.dartDefines.map((d) => (
                <div key={d.id} className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={() => handleToggleDartDefine(d.id)}
                    className="rounded border-zinc-700 text-sky-500 bg-zinc-900"
                  />
                  <span className="text-xs font-mono text-sky-300 font-semibold">{d.key}</span>
                  <span className="text-xs text-zinc-600">=</span>
                  <span className="text-xs font-mono text-zinc-300 truncate flex-1">{d.value}</span>
                  <button
                    onClick={() => handleRemoveDartDefine(d.id)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newDefineKey}
                  onChange={(e) => setNewDefineKey(e.target.value)}
                  placeholder="KEY (e.g. API_URL)"
                  className="w-1/3 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200"
                />
                <input
                  type="text"
                  value={newDefineVal}
                  onChange={(e) => setNewDefineVal(e.target.value)}
                  placeholder="VALUE (e.g. https://api.prod.com)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-200"
                />
                <button
                  type="button"
                  onClick={handleAddDartDefine}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Executable Commands & Terminal Action (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Executable Script Box */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl sticky top-20">
            {/* Header with Switcher between Flutter CLI and Gradle Build Command */}
            <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
                  <button
                    onClick={() => setCommandViewMode('flutter')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      commandViewMode === 'flutter'
                        ? 'bg-zinc-800 text-sky-300 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Flutter CLI Script
                  </button>
                  <button
                    onClick={() => setCommandViewMode('gradle')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 ${
                      commandViewMode === 'gradle'
                        ? 'bg-zinc-800 text-emerald-300 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>Gradle Build Command</span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-1 rounded font-mono">
                      ./gradlew
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const textToCopy = commandViewMode === 'flutter' ? fullScript : combinedGradleOneLiner;
                    navigator.clipboard.writeText(textToCopy);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
            </div>

            {/* Script Viewer */}
            <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-200 overflow-x-auto space-y-2 select-all leading-relaxed">
              {commandViewMode === 'flutter' ? (
                <pre className="text-zinc-400">
                  <span className="text-zinc-500"># Clean previous build artifacts</span>{'\n'}
                  {config.runClean && <span className="text-emerald-400 font-bold">flutter clean{'\n'}</span>}
                  {config.runPubGet && (
                    <>
                      <span className="text-zinc-500"># Resolve dependencies</span>{'\n'}
                      <span className="text-emerald-400 font-bold">flutter pub get{'\n'}</span>
                    </>
                  )}
                  {'\n'}
                  <span className="text-zinc-500"># Compile {config.platform} release APK (Min SDK {config.minSdk}, Target SDK {config.targetSdk})</span>{'\n'}
                  <span className="text-sky-300 font-semibold">flutter</span>{' '}
                  <span className="text-amber-300">build</span>{' '}
                  <span className="text-purple-300">{config.target}</span>{' '}
                  <span className="text-emerald-300">--{config.mode}</span>{' '}
                  {config.platform === 'split-per-abi' ? (
                    <span className="text-yellow-300 font-bold">--split-per-abi</span>
                  ) : config.platform !== 'universal' ? (
                    <span className="text-yellow-300 font-bold">--target-platform={config.platform}</span>
                  ) : null}{' '}
                  {config.noTreeShakeIcons && (
                    <span className="text-pink-400 font-bold">--no-tree-shake-icons</span>
                  )}{' '}
                  {config.obfuscate && (
                    <span className="text-orange-400">--obfuscate --split-debug-info={config.splitDebugInfo}</span>
                  )}{' '}
                  {config.buildName && <span className="text-blue-300">--build-name={config.buildName}</span>}{' '}
                  {config.buildNumber && <span className="text-blue-300">--build-number={config.buildNumber}</span>}{' '}
                  {config.dartDefines
                    .filter((d) => d.enabled && d.key)
                    .map((d) => (
                      <span key={d.id} className="text-teal-300">--dart-define={d.key}={d.value} </span>
                    ))}
                </pre>
              ) : (
                <pre className="text-zinc-400">
                  <span className="text-zinc-500"># Direct Android Gradle Release Build Command</span>{'\n'}
                  <span className="text-zinc-500"># Passes resource &amp; code shrinking flags directly to Gradle assembleRelease</span>{'\n'}
                  <span className="text-emerald-400 font-bold">cd android{'\n'}</span>
                  <span className="text-sky-300 font-semibold">./gradlew</span>{' '}
                  <span className="text-amber-300 font-bold">assembleRelease</span>{' '}
                  <span className="text-emerald-300 font-bold">-PshrinkResources={config.shrinkResources.toString()}</span>{' '}
                  <span className="text-purple-300">-PminifyEnabled={config.minifyEnabled.toString()}</span>
                  {'\n\n'}
                  <span className="text-zinc-500"># Output APK artifact:</span>{'\n'}
                  <span className="text-zinc-400">build/app/outputs/flutter-apk/app-{config.platform === 'android-arm64' ? 'arm64-v8a' : config.platform === 'split-per-abi' ? 'arm64-v8a' : 'release'}.apk</span>
                </pre>
              )}
            </div>

            {/* Quick Single Line Copy Strip */}
            <div className="px-4 py-2.5 bg-zinc-900/40 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="truncate w-full sm:w-auto font-mono text-zinc-400 text-[11px]">
                {commandViewMode === 'flutter' ? combinedOneLiner : combinedGradleOneLiner}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={commandViewMode === 'flutter' ? handleCopyOneLiner : () => {
                    navigator.clipboard.writeText(combinedGradleOneLiner);
                    setCopiedGradleCommand(true);
                    setTimeout(() => setCopiedGradleCommand(false), 2000);
                  }}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium"
                >
                  {(commandViewMode === 'flutter' ? copiedOneLiner : copiedGradleCommand) ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{commandViewMode === 'flutter' ? 'Copy 1-Liner' : 'Copy Gradle Command'}</span>
                </button>
              </div>
            </div>


            {/* Simulation Trigger CTA */}
            <div className="p-4 bg-zinc-900/70 border-t border-zinc-800 space-y-3">
              <button
                onClick={onRunSimulator}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-medium text-xs rounded-lg shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Complete Build Pipeline</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>Output APK:</span>
                <span className="font-mono text-zinc-200">
                  build/app/outputs/flutter-apk/app-{config.platform === 'android-arm64' ? 'arm64-v8a' : config.platform === 'split-per-abi' ? 'arm64-v8a' : 'release'}.apk
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice about Target SDK 36 and Min SDK 28 */}
          <div className="bg-zinc-900/60 rounded-xl p-4 border border-zinc-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Android Gradle Sync Notice</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              When specifying <strong className="text-zinc-200">minSdk = 28</strong> and <strong className="text-zinc-200">targetSdk = 36</strong>, 
              the matching Gradle file (<code className="text-sky-300 font-mono">android/app/build.gradle.kts</code>) 
              must have <code className="text-sky-300 font-mono">compileSdk = 36</code> and Java 17 compatibility.
            </p>
            <button
              onClick={() => onNavigateToTab('gradle')}
              className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 text-[11px]"
            >
              Inspect synchronized build.gradle.kts <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
