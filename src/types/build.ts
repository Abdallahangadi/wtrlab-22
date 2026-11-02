export type BuildTarget = 'apk' | 'appbundle';
export type TargetPlatform = 'android-arm64' | 'android-arm' | 'android-x64' | 'split-per-abi' | 'universal';
export type BuildMode = 'release' | 'profile' | 'debug';

export interface DartDefine {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface BuildConfig {
  target: BuildTarget;
  mode: BuildMode;
  platform: TargetPlatform;
  noTreeShakeIcons: boolean;
  runClean: boolean;
  runPubGet: boolean;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  buildName: string;
  buildNumber: string;
  obfuscate: boolean;
  splitDebugInfo: string;
  flavor: string;
  mainEntry: string;
  dartDefines: DartDefine[];
  minifyEnabled: boolean;
  shrinkResources: boolean;
  enable16KbPages: boolean;
  offline: boolean;
  verbose: boolean;
  outputDirectory: string;
}

export interface Preset {
  id: string;
  title: string;
  badge: string;
  description: string;
  config: Partial<BuildConfig>;
}

export type BuildStepId = 
  | 'idle'
  | 'prepare'
  | 'clean'
  | 'pub'
  | 'assets'
  | 'compile'
  | 'shrink'
  | 'package'
  | 'sign'
  | 'done';

export type BuildStatus = 'idle' | 'running' | 'completed' | 'cancelled';

export interface BuildStep {
  id: BuildStepId;
  label: string; // e.g. "Cleaning...", "Building Assets...", "Packaging APK..."
  shortLabel: string;
  description: string;
  progress: number; // 0 to 100
  durationMs: number;
}

export interface BuildLogEntry {
  id: string;
  timestamp: string;
  type: 'cmd' | 'info' | 'gradle' | 'success' | 'warn';
  text: string;
}

export interface BuildProgressState {
  status: BuildStatus;
  currentStep: BuildStep | null;
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  logs: BuildLogEntry[];
  apkName: string;
  apkSize: string;
  startedAt: number | null;
  elapsedSeconds: number;
}

