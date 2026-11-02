import React, { useState } from 'react';
import { 
  PieChart, 
  Layers, 
  HardDrive, 
  Cpu, 
  FileCode, 
  ShieldCheck, 
  ArrowDownRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { BuildConfig } from '../types/build';

interface ApkAnatomyVisualizerProps {
  config: BuildConfig;
}

export const ApkAnatomyVisualizer: React.FC<ApkAnatomyVisualizerProps> = ({ config }) => {
  const [selectedAbi, setSelectedAbi] = useState<'arm64' | 'split' | 'universal'>('arm64');

  const comparisons = {
    universal: {
      name: 'Universal "Fat" APK',
      size: 52.8,
      downloadSavings: '0%',
      abis: ['arm64-v8a', 'armeabi-v7a', 'x86_64'],
      description: 'Contains native binaries for all 3 architectures. Heavy download, but runs on any device.',
      breakdown: [
        { name: 'lib/arm64-v8a (64-bit engine & code)', size: 14.2, color: 'bg-emerald-500' },
        { name: 'lib/armeabi-v7a (32-bit legacy)', size: 12.8, color: 'bg-sky-500' },
        { name: 'lib/x86_64 (Emulator binary)', size: 13.9, color: 'bg-purple-500' },
        { name: 'assets/flutter_assets & fonts', size: 6.4, color: 'bg-amber-500' },
        { name: 'classes.dex (Plugins & Kotlin)', size: 3.8, color: 'bg-rose-500' },
        { name: 'resources.arsc & meta', size: 1.7, color: 'bg-zinc-500' },
      ],
    },
    arm64: {
      name: 'android-arm64 (User Specified)',
      size: 21.4,
      downloadSavings: '59.5% Smaller',
      abis: ['arm64-v8a only'],
      description: 'Contains solely 64-bit ARM binaries. High performance, rapid compilation, compact size.',
      breakdown: [
        { name: 'lib/arm64-v8a/libflutter.so (Engine)', size: 8.4, color: 'bg-emerald-500' },
        { name: 'lib/arm64-v8a/libapp.so (Dart AOT)', size: 5.8, color: 'bg-teal-500' },
        { name: 'assets/flutter_assets (Icons & Fonts)', size: 4.2, color: 'bg-amber-500' },
        { name: 'classes.dex (D8 / R8 Dalvik code)', size: 2.1, color: 'bg-rose-500' },
        { name: 'resources.arsc & Manifest', size: 0.9, color: 'bg-zinc-500' },
      ],
    },
    split: {
      name: 'Split-per-ABI APKs',
      size: 19.8,
      downloadSavings: '62.5% Smaller',
      abis: ['3 separate APK files'],
      description: 'Flutter builds 3 individual APKs. Users only download the exact APK matching their phone CPU.',
      breakdown: [
        { name: 'Target ABI lib/ folder', size: 12.6, color: 'bg-emerald-500' },
        { name: 'assets/flutter_assets', size: 4.2, color: 'bg-amber-500' },
        { name: 'classes.dex (Dalvik)', size: 2.1, color: 'bg-rose-500' },
        { name: 'resources & signatures', size: 0.9, color: 'bg-zinc-500' },
      ],
    },
  };

  const activeData = comparisons[selectedAbi];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              APK Anatomy &amp; Architecture Size Comparison
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Understand why <code className="text-emerald-400 font-mono">--target-platform=android-arm64</code> produces 
            a dramatically smaller and faster APK compared to universal fat builds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedAbi('arm64')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              selectedAbi === 'arm64'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
            }`}
          >
            android-arm64 (Prompt)
          </button>
          <button
            onClick={() => setSelectedAbi('split')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              selectedAbi === 'split'
                ? 'bg-sky-950/80 border-sky-600 text-sky-200'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
            }`}
          >
            Split per ABI
          </button>
          <button
            onClick={() => setSelectedAbi('universal')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              selectedAbi === 'universal'
                ? 'bg-purple-950/80 border-purple-600 text-purple-200'
                : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
            }`}
          >
            Universal (All ABIs)
          </button>
        </div>
      </div>

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Size Metric Card */}
        <div className="lg:col-span-5 bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Selected Configuration
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-900 px-2 py-0.5 rounded">
              {activeData.downloadSavings}
            </span>
          </div>

          <div>
            <div className="text-3xl font-bold font-mono text-zinc-100 flex items-baseline gap-2">
              <span>{activeData.size}</span>
              <span className="text-base font-normal text-zinc-400">MB</span>
            </div>
            <div className="text-xs text-zinc-300 font-semibold mt-1">{activeData.name}</div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{activeData.description}</p>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-2">
            <div className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Target CPU Architecture:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeData.abis.map((abi) => (
                <span
                  key={abi}
                  className="text-[11px] font-mono text-sky-300 bg-sky-950/60 border border-sky-900/80 px-2 py-0.5 rounded"
                >
                  {abi}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div className="text-zinc-200 font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Icon Subsetting Notice:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              With <code className="text-amber-300 font-mono">--no-tree-shake-icons</code>, 
              assets/flutter_assets includes full font tables. This adds negligible size (~200KB) 
              while guaranteeing zero missing icons or broken symbols.
            </p>
          </div>
        </div>

        {/* Right: Internal Anatomy Breakdown */}
        <div className="lg:col-span-7 bg-zinc-900/80 p-5 rounded-xl border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Internal APK Package Anatomy
            </h3>
            <span className="text-xs text-zinc-400">Compressed Payload</span>
          </div>

          {/* Segmented Visual Bar */}
          <div className="h-6 w-full rounded-lg overflow-hidden flex bg-zinc-950 border border-zinc-800">
            {activeData.breakdown.map((item, idx) => {
              const pct = (item.size / activeData.size) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  className={`${item.color} h-full transition-all duration-300 hover:opacity-80`}
                  title={`${item.name}: ${item.size} MB (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Breakdown Items List */}
          <div className="space-y-2.5">
            {activeData.breakdown.map((item, idx) => {
              const pct = ((item.size / activeData.size) * 100).toFixed(1);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-sm ${item.color}`} />
                    <span className="font-mono text-zinc-200">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono">{pct}%</span>
                    <span className="font-semibold text-zinc-100 font-mono w-16 text-right">
                      {item.size} MB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
