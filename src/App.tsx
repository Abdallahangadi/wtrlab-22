/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BuildConfig } from './types/build';
import { Header } from './components/Header';
import { CommandWorkbench } from './components/CommandWorkbench';
import { TerminalSimulator } from './components/TerminalSimulator';
import { GradleManifestInspector } from './components/GradleManifestInspector';
import { AutomationScripts } from './components/AutomationScripts';
import { Sdk36ReadinessChecker } from './components/Sdk36ReadinessChecker';
import { ApkAnatomyVisualizer } from './components/ApkAnatomyVisualizer';
import { BuildProvider, useBuild } from './context/BuildContext';
import { 
  generateBashScript, 
  generateKotlinGradle, 
  generateGradleProperties, 
  generateAndroidManifest,
  generateGitHubWorkflow 
} from './utils/commandGenerator';
import { Download, Terminal, Check, Info, ExternalLink, Play } from 'lucide-react';

function AppContent({
  config,
  setConfig,
  activeTab,
  setActiveTab,
  onOpenDownloadModal,
}: {
  config: BuildConfig;
  setConfig: React.Dispatch<React.SetStateAction<BuildConfig>>;
  activeTab: 'workbench' | 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer';
  setActiveTab: (tab: 'workbench' | 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer') => void;
  onOpenDownloadModal: () => void;
}) {
  const { buildState, startBuild } = useBuild();

  const handleRunSimulator = () => {
    startBuild();
    setActiveTab('terminal');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Application Header with Visual Step Progress Indicator */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportAll={onOpenDownloadModal}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sub-Header / Current Context Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400">Current Pipeline:</span>
              <code className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/80 px-2 py-0.5 rounded">
                flutter clean &amp;&amp; flutter pub get &amp;&amp; flutter build apk --release --target-platform={config.platform} {config.noTreeShakeIcons ? '--no-tree-shake-icons' : ''}
              </code>

              {buildState.status === 'running' && buildState.currentStep && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-sky-300 bg-sky-950/80 border border-sky-600/40 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{buildState.currentStep.label}</span>
                  <span className="text-zinc-400">({buildState.progress}%)</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`hover:text-zinc-200 transition-colors ${activeTab === 'analyzer' ? 'text-sky-400 font-semibold' : ''}`}
            >
              APK Anatomy (21.4MB)
            </button>
            <span aria-hidden="true" className="text-zinc-700">·</span>
            <button
              onClick={() => setActiveTab('readiness')}
              className={`hover:text-zinc-200 transition-colors ${activeTab === 'readiness' ? 'text-sky-400 font-semibold' : ''}`}
            >
              Target SDK 36 Check
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'workbench' && (
          <CommandWorkbench
            config={config}
            onConfigChange={setConfig}
            onRunSimulator={handleRunSimulator}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalSimulator config={config} />
        )}

        {activeTab === 'gradle' && (
          <GradleManifestInspector config={config} />
        )}

        {activeTab === 'ci-cd' && (
          <AutomationScripts config={config} />
        )}

        {activeTab === 'readiness' && (
          <Sdk36ReadinessChecker config={config} />
        )}

        {activeTab === 'analyzer' && (
          <ApkAnatomyVisualizer config={config} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/90 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>Flutter Android Release APK Architect</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-400">Target Platform: android-arm64</span>
            <span aria-hidden="true">·</span>
            <span className="text-zinc-400">Min SDK 28 / Target SDK 36</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-zinc-600">
              --no-tree-shake-icons active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer'>('workbench');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Initial config matching user's exact prompt:
  // flutter clean
  // flutter pub get
  // flutter build apk --release --target-platform=android-arm64 --no-tree-shake-icons (with minSdk 28 and targetSdk 36)
  const [config, setConfig] = useState<BuildConfig>({
    target: 'apk',
    mode: 'release',
    platform: 'android-arm64',
    noTreeShakeIcons: true,
    runClean: true,
    runPubGet: true,
    minSdk: 28,
    targetSdk: 36,
    compileSdk: 36,
    buildName: '1.0.0',
    buildNumber: '1',
    obfuscate: false,
    splitDebugInfo: './build/app/outputs/symbols',
    flavor: '',
    mainEntry: 'lib/main.dart',
    dartDefines: [],
    minifyEnabled: true,
    shrinkResources: true,
    enable16KbPages: true,
    offline: false,
    verbose: false,
    outputDirectory: '',
  });

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllArtifacts = () => {
    handleDownloadFile('build-release.sh', generateBashScript(config));
    setTimeout(() => {
      handleDownloadFile('build.gradle.kts', generateKotlinGradle(config));
    }, 200);
    setTimeout(() => {
      handleDownloadFile('gradle.properties', generateGradleProperties(config));
    }, 400);
    setTimeout(() => {
      handleDownloadFile('AndroidManifest.xml', generateAndroidManifest(config));
    }, 600);
    setTimeout(() => {
      handleDownloadFile('flutter-build.yml', generateGitHubWorkflow(config));
    }, 800);
    setDownloadModalOpen(false);
  };

  return (
    <BuildProvider config={config}>
      <AppContent
        config={config}
        setConfig={setConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* Download Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-zinc-100">
                  Export Project Files
                </h3>
              </div>
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Download the complete configuration files synchronized with your Min SDK 28, Target SDK 36, and android-arm64 flags.
            </p>

            <div className="space-y-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-300">
                <span>build-release.sh</span>
                <button
                  onClick={() => handleDownloadFile('build-release.sh', generateBashScript(config))}
                  className="text-sky-400 hover:text-sky-300"
                >
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>android/app/build.gradle.kts</span>
                <button
                  onClick={() => handleDownloadFile('build.gradle.kts', generateKotlinGradle(config))}
                  className="text-sky-400 hover:text-sky-300"
                >
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>android/gradle.properties</span>
                <button
                  onClick={() => handleDownloadFile('gradle.properties', generateGradleProperties(config))}
                  className="text-sky-400 hover:text-sky-300"
                >
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>AndroidManifest.xml</span>
                <button
                  onClick={() => handleDownloadFile('AndroidManifest.xml', generateAndroidManifest(config))}
                  className="text-sky-400 hover:text-sky-300"
                >
                  Download
                </button>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>.github/workflows/build-apk.yml</span>
                <button
                  onClick={() => handleDownloadFile('flutter-build.yml', generateGitHubWorkflow(config))}
                  className="text-sky-400 hover:text-sky-300"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDownloadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
              <button
                onClick={downloadAllArtifacts}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                Download All (5 Files)
              </button>
            </div>
          </div>
        </div>
      )}
    </BuildProvider>
  );
}
