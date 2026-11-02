import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { BuildConfig, BuildLogEntry, BuildProgressState, BuildStep, BuildStepId } from '../types/build';
import { generateFlutterBuildArgs } from '../utils/commandGenerator';

interface BuildContextType {
  buildState: BuildProgressState;
  startBuild: () => void;
  cancelBuild: () => void;
  resetBuild: () => void;
  clearLogs: () => void;
  allSteps: BuildStep[];
}

const BuildContext = createContext<BuildContextType | undefined>(undefined);

interface BuildProviderProps {
  children: ReactNode;
  config: BuildConfig;
}

export const BuildProvider: React.FC<BuildProviderProps> = ({ children, config }) => {
  const apkName = config.platform === 'android-arm64' 
    ? 'app-arm64-v8a-release.apk' 
    : config.platform === 'split-per-abi'
    ? 'app-arm64-v8a-release.apk'
    : 'app-release.apk';

  const apkSize = config.platform === 'android-arm64' 
    ? '21.4 MB' 
    : config.platform === 'split-per-abi' 
    ? '19.8 MB' 
    : '48.6 MB';

  // Construct dynamic step list based on user build config
  const getStepsForConfig = useCallback((cfg: BuildConfig): BuildStep[] => {
    const steps: BuildStep[] = [
      {
        id: 'prepare',
        label: 'Preparing Environment...',
        shortLabel: 'Setup',
        description: `Target ABI: ${cfg.platform === 'android-arm64' ? 'arm64-v8a' : cfg.platform} • SDK 28-${cfg.targetSdk}`,
        progress: 8,
        durationMs: 700,
      },
    ];

    if (cfg.runClean) {
      steps.push({
        id: 'clean',
        label: 'Cleaning...',
        shortLabel: 'Clean',
        description: 'flutter clean • deleting build/ and .dart_tool/ caches',
        progress: 22,
        durationMs: 1100,
      });
    }

    if (cfg.runPubGet) {
      steps.push({
        id: 'pub',
        label: 'Resolving Packages...',
        shortLabel: 'Pub Get',
        description: 'flutter pub get • resolving 48 packages from pubspec.yaml',
        progress: 38,
        durationMs: 1000,
      });
    }

    steps.push({
      id: 'assets',
      label: 'Building Assets...',
      shortLabel: 'Assets',
      description: cfg.noTreeShakeIcons 
        ? 'Compiling assets & font maps with --no-tree-shake-icons' 
        : 'Compiling assets and tree-shaking icon fonts',
      progress: 52,
      durationMs: 1200,
    });

    steps.push({
      id: 'compile',
      label: 'Compiling Dart (AOT)...',
      shortLabel: 'Dart AOT',
      description: `AOT compilation for ${cfg.platform} architecture`,
      progress: 68,
      durationMs: 1400,
    });

    steps.push({
      id: 'shrink',
      label: cfg.minifyEnabled 
        ? (cfg.shrinkResources ? 'Shrinking Code & Resources (R8)...' : 'Shrinking Code (R8)...') 
        : 'Merging DEX Bytecode...',
      shortLabel: cfg.shrinkResources ? 'R8 + Shrink' : cfg.minifyEnabled ? 'R8 Shrunk' : 'D8 DEX',
      description: cfg.minifyEnabled 
        ? (cfg.shrinkResources 
            ? 'R8 dead-code elimination & resource shrinking (-PshrinkResources=true)' 
            : 'R8 dead-code elimination & Java 17 bytecode optimization')
        : 'D8 DEX bytecode generation without R8 minification',
      progress: 82,
      durationMs: 1100,
    });

    steps.push({
      id: 'package',
      label: 'Packaging APK...',
      shortLabel: 'Packaging',
      description: 'Packaging 16KB-aligned native libs & assets into release APK',
      progress: 93,
      durationMs: 1000,
    });

    steps.push({
      id: 'sign',
      label: 'Signing APK...',
      shortLabel: 'Signing',
      description: 'Applying v2 & v3 APK signing block with release keystore',
      progress: 98,
      durationMs: 700,
    });

    steps.push({
      id: 'done',
      label: 'Build Complete',
      shortLabel: 'Done',
      description: `Generated build/app/outputs/flutter-apk/${apkName} (${apkSize})`,
      progress: 100,
      durationMs: 0,
    });

    return steps;
  }, [apkName, apkSize]);

  const [allSteps, setAllSteps] = useState<BuildStep[]>(() => getStepsForConfig(config));

  // Keep step definitions synchronized when config changes (if not running)
  useEffect(() => {
    setAllSteps(getStepsForConfig(config));
  }, [config, getStepsForConfig]);

  const [buildState, setBuildState] = useState<BuildProgressState>({
    status: 'idle',
    currentStep: null,
    currentStepIndex: -1,
    totalSteps: allSteps.length,
    progress: 0,
    logs: [],
    apkName,
    apkSize,
    startedAt: null,
    elapsedSeconds: 0,
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  const cancelBuild = useCallback(() => {
    clearAllTimeouts();
    setBuildState((prev) => ({
      ...prev,
      status: 'cancelled',
      logs: [
        ...prev.logs,
        {
          id: `cancel-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'warn',
          text: 'Build execution cancelled by user.',
        },
      ],
    }));
  }, [clearAllTimeouts]);

  const resetBuild = useCallback(() => {
    clearAllTimeouts();
    setBuildState({
      status: 'idle',
      currentStep: null,
      currentStepIndex: -1,
      totalSteps: allSteps.length,
      progress: 0,
      logs: [],
      apkName,
      apkSize,
      startedAt: null,
      elapsedSeconds: 0,
    });
  }, [clearAllTimeouts, allSteps.length, apkName, apkSize]);

  const clearLogs = useCallback(() => {
    setBuildState((prev) => ({ ...prev, logs: [] }));
  }, []);

  const startBuild = useCallback(() => {
    clearAllTimeouts();

    const activeSteps = getStepsForConfig(config);
    setAllSteps(activeSteps);

    const now = Date.now();
    setBuildState({
      status: 'running',
      currentStep: activeSteps[0],
      currentStepIndex: 0,
      totalSteps: activeSteps.length,
      progress: activeSteps[0].progress,
      logs: [
        {
          id: `log-init-${now}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          text: 'Flutter 3.29.0 • channel stable • Android SDK 36 • Target ABI: ' + config.platform,
        },
      ],
      apkName,
      apkSize,
      startedAt: now,
      elapsedSeconds: 0,
    });

    // Elapsed timer
    elapsedIntervalRef.current = setInterval(() => {
      setBuildState((prev) => {
        if (prev.status !== 'running') return prev;
        return {
          ...prev,
          elapsedSeconds: prev.startedAt ? Math.floor((Date.now() - prev.startedAt) / 1000) : prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    // Schedule steps and corresponding logs
    let accumulatedTime = 0;

    activeSteps.forEach((step, index) => {
      accumulatedTime += step.durationMs;

      const t = setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString();
        const newLogs: BuildLogEntry[] = [];

        // Generate context-aware terminal logs for each step
        switch (step.id) {
          case 'prepare':
            newLogs.push(
              { id: `log-prep-1-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Framework • revision 3.29.0 (2026) • Engine • revision e7f9b8c0' },
              { id: `log-prep-2-${Date.now()}`, timestamp: timeStr, type: 'info', text: `Tools • Dart 3.7.0 • Android SDK 36 • compileSdk=${config.compileSdk}, minSdk=${config.minSdk}, targetSdk=${config.targetSdk}` }
            );
            break;

          case 'clean':
            newLogs.push(
              { id: `log-clean-1-${Date.now()}`, timestamp: timeStr, type: 'cmd', text: '$ flutter clean' },
              { id: `log-clean-2-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Deleting "build/" directory and temporary build caches...' },
              { id: `log-clean-3-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Clearing .dart_tool/ and Gradle android/.gradle cache...' }
            );
            break;

          case 'pub':
            newLogs.push(
              { id: `log-pub-1-${Date.now()}`, timestamp: timeStr, type: 'cmd', text: '$ flutter pub get' },
              { id: `log-pub-2-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Resolving dependencies in pubspec.yaml...' },
              { id: `log-pub-3-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Got dependencies! (48 packages resolved in 1.2s)' }
            );
            break;

          case 'assets': {
            const buildArgs = generateFlutterBuildArgs(config).join(' ');
            newLogs.push(
              { id: `log-ast-1-${Date.now()}`, timestamp: timeStr, type: 'cmd', text: `$ flutter ${buildArgs}` }
            );
            if (config.noTreeShakeIcons) {
              newLogs.push({
                id: `log-ast-2-${Date.now()}`,
                timestamp: timeStr,
                type: 'warn',
                text: 'Font tree-shaking disabled (--no-tree-shake-icons). Preserving complete icon glyph maps & custom fonts.',
              });
            }
            newLogs.push(
              { id: `log-ast-3-${Date.now()}`, timestamp: timeStr, type: 'info', text: 'Bundling Flutter assets, fonts, shaders and flutter_assets manifest...' }
            );
            break;
          }

          case 'compile':
            newLogs.push(
              { id: `log-comp-1-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `Running Gradle task 'assembleRelease' in android/...` },
              { id: `log-comp-2-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:compileFlutterBuildRelease: Compiling Dart snapshot (AOT Ahead-Of-Time compile for ${config.platform})...` }
            );
            if (config.obfuscate) {
              newLogs.push({
                id: `log-comp-3-${Date.now()}`,
                timestamp: timeStr,
                type: 'info',
                text: `> Task :app:obfuscateRelease: Stripping symbols & writing debug map to ${config.splitDebugInfo}...`,
              });
            }
            break;

          case 'shrink':
            if (config.minifyEnabled) {
              newLogs.push(
                { id: `log-shrk-1-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:minifyReleaseWithR8: Running R8 code shrinking & dead-code elimination...` },
                { id: `log-shrk-2-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:mergeDexRelease: Merging shrunk dex classes with Android R8 (Java 17 runtime)...` }
              );
              if (config.shrinkResources) {
                newLogs.push({
                  id: `log-shrk-3-${Date.now()}`,
                  timestamp: timeStr,
                  type: 'gradle',
                  text: `> Task :app:shrinkReleaseResources: Stripping unreferenced layout XMLs, drawables, and raw assets (shrinkResources = true, -PshrinkResources=true)...`,
                });
              }
            } else {
              newLogs.push(
                { id: `log-shrk-1-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:mergeDexRelease: Merging dex classes with Android D8 (R8 code shrinking disabled)...` }
              );
            }
            break;

          case 'package':
            newLogs.push(
              { id: `log-pkg-1-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:packageRelease: Packaging uncompressed assets & 16KB-aligned native libs into APK...` },
              { id: `log-pkg-2-${Date.now()}`, timestamp: timeStr, type: 'info', text: `Target ABI packaged: ${config.platform === 'android-arm64' ? 'lib/arm64-v8a' : config.platform} (Page alignment: 16KB compliant for Android 15/16 SDK 36)` }
            );
            break;

          case 'sign':
            newLogs.push(
              { id: `log-sgn-1-${Date.now()}`, timestamp: timeStr, type: 'gradle', text: `> Task :app:signReleaseBundle: Signing APK with release keystore (v2/v3 signatures)...` }
            );
            break;

          case 'done':
            newLogs.push(
              { id: `log-done-1-${Date.now()}`, timestamp: timeStr, type: 'success', text: `✓ Built build/app/outputs/flutter-apk/${apkName} (${apkSize})` }
            );
            break;
        }

        setBuildState((prev) => {
          const isFinished = step.id === 'done' || index === activeSteps.length - 1;
          if (isFinished && elapsedIntervalRef.current) {
            clearInterval(elapsedIntervalRef.current);
            elapsedIntervalRef.current = null;
          }

          return {
            ...prev,
            status: isFinished ? 'completed' : 'running',
            currentStep: step,
            currentStepIndex: index,
            progress: step.progress,
            logs: [...prev.logs, ...newLogs],
          };
        });
      }, accumulatedTime);

      timeoutsRef.current.push(t);
    });
  }, [clearAllTimeouts, getStepsForConfig, config, apkName, apkSize]);

  return (
    <BuildContext.Provider
      value={{
        buildState,
        startBuild,
        cancelBuild,
        resetBuild,
        clearLogs,
        allSteps,
      }}
    >
      {children}
    </BuildContext.Provider>
  );
};

export const useBuild = () => {
  const context = useContext(BuildContext);
  if (!context) {
    throw new Error('useBuild must be used within a BuildProvider');
  }
  return context;
};
