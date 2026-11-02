import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileCode, 
  Shield, 
  Key, 
  Download, 
  Settings, 
  FileText,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { BuildConfig } from '../types/build';
import { 
  generateKotlinGradle, 
  generateGroovyGradle, 
  generateGradleProperties, 
  generateAndroidManifest, 
  generateKeytoolCommand, 
  generateKeyProperties 
} from '../utils/commandGenerator';

interface GradleManifestInspectorProps {
  config: BuildConfig;
}

export const GradleManifestInspector: React.FC<GradleManifestInspectorProps> = ({ config }) => {
  const [activeFile, setActiveFile] = useState<'kotlin' | 'groovy' | 'properties' | 'manifest' | 'keystore'>('kotlin');
  const [copied, setCopied] = useState(false);

  const kotlinCode = generateKotlinGradle(config);
  const groovyCode = generateGroovyGradle(config);
  const propertiesCode = generateGradleProperties(config);
  const manifestCode = generateAndroidManifest(config);
  const keytoolCommand = generateKeytoolCommand();
  const keyPropertiesCode = generateKeyProperties();

  const getActiveContent = () => {
    switch (activeFile) {
      case 'kotlin':
        return kotlinCode;
      case 'groovy':
        return groovyCode;
      case 'properties':
        return propertiesCode;
      case 'manifest':
        return manifestCode;
      case 'keystore':
        return `# 1. Generate Keystore via keytool:\n${keytoolCommand}\n\n# 2. Place credentials into android/key.properties:\n${keyPropertiesCode}`;
      default:
        return '';
    }
  };

  const getFileName = () => {
    switch (activeFile) {
      case 'kotlin':
        return 'android/app/build.gradle.kts';
      case 'groovy':
        return 'android/app/build.gradle';
      case 'properties':
        return 'android/gradle.properties';
      case 'manifest':
        return 'android/app/src/main/AndroidManifest.xml';
      case 'keystore':
        return 'Keystore Signing & key.properties';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const fileName = getFileName().split('/').pop() || 'config.txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-100">Android Build Configuration Synchronization</h2>
            <span className="text-[11px] font-mono text-emerald-400 border border-emerald-900/80 bg-emerald-950/40 px-1.5 py-0.5 rounded">
              Synced: Min {config.minSdk} &amp; Target {config.targetSdk}
            </span>
            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${
              config.shrinkResources 
                ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800' 
                : 'text-zinc-500 bg-zinc-900 border-zinc-800'
            }`}>
              isShrinkResources = {config.shrinkResources.toString()}
            </span>
            <span className="text-[11px] font-mono text-sky-400 border border-sky-900/80 bg-sky-950/40 px-1.5 py-0.5 rounded">
              -PshrinkResources={config.shrinkResources.toString()}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ensure your Flutter project's Android source files match your release build flags to prevent Gradle compilation failures.
          </p>
        </div>


        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveFile('kotlin')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeFile === 'kotlin'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-sky-400" />
          <span>build.gradle.kts (Kotlin DSL)</span>
          <span className="text-[10px] font-mono text-sky-400 bg-sky-900/60 px-1.5 py-0.2 rounded">
            Recommended
          </span>
        </button>

        <button
          onClick={() => setActiveFile('groovy')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeFile === 'groovy'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
          <span>build.gradle (Groovy DSL)</span>
        </button>

        <button
          onClick={() => setActiveFile('properties')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeFile === 'properties'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>gradle.properties (16KB Align)</span>
        </button>

        <button
          onClick={() => setActiveFile('manifest')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeFile === 'manifest'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>AndroidManifest.xml</span>
        </button>

        <button
          onClick={() => setActiveFile('keystore')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeFile === 'keystore'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200 shadow-sm'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-purple-400" />
          <span>Keystore Signing Guide</span>
        </button>
      </div>

      {/* Code Editor Window */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono text-zinc-200">{getFileName()}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            {activeFile === 'kotlin' ? 'Kotlin Gradle DSL' : activeFile === 'groovy' ? 'Groovy Gradle' : 'Plain Text / XML'}
          </div>
        </div>

        <div className="p-5 overflow-x-auto max-h-[580px] bg-zinc-950/95">
          <pre className="font-mono text-xs text-zinc-300 leading-relaxed select-all">
            {getActiveContent()}
          </pre>
        </div>
      </div>

      {/* Contextual Technical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-1">
          <div className="text-zinc-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Target SDK 36 (Android 16)
          </div>
          <p className="text-[11px] leading-relaxed">
            Google Play requires apps targeting modern Android to enforce edge-to-edge window insets and use Java 17 toolchains.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-1">
          <div className="text-zinc-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Min SDK 28 (Android 9 Pie)
          </div>
          <p className="text-[11px] leading-relaxed">
            Guarantees modern 64-bit support, drops unneeded 32-bit legacy workarounds, and ensures hardware-accelerated rendering.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-1">
          <div className="text-zinc-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            16 KB Memory Page Size
          </div>
          <p className="text-[11px] leading-relaxed">
            Android 15 &amp; 16 require 16KB ELF page size alignment for native C/C++ libraries. The gradle properties configuration includes uncompressed native libs.
          </p>
        </div>
      </div>
    </div>
  );
};
