import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Terminal as TerminalIcon, 
  CheckCircle2, 
  Cpu, 
  HardDrive,
  FileCheck,
  X,
  Clock
} from 'lucide-react';
import { BuildConfig } from '../types/build';
import { useBuild } from '../context/BuildContext';

interface TerminalSimulatorProps {
  config: BuildConfig;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({ config }) => {
  const { buildState, startBuild, cancelBuild, allSteps } = useBuild();
  const { status, currentStep, currentStepIndex, totalSteps, progress, logs, apkName, apkSize, elapsedSeconds } = buildState;
  const isRunning = status === 'running';

  const [copiedLogs, setCopiedLogs] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopy = () => {
    const raw = logs.map((l) => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header & Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Target ABI</div>
            <div className="text-sm font-semibold text-zinc-100 font-mono mt-0.5">
              {config.platform === 'android-arm64' ? 'arm64-v8a' : config.platform}
            </div>
          </div>
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">SDK Levels</div>
            <div className="text-sm font-semibold text-zinc-100 font-mono mt-0.5">
              Min {config.minSdk} • Target {config.targetSdk}
            </div>
          </div>
          <FileCheck className="w-5 h-5 text-sky-400" />
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Icon Subsetting</div>
            <div className="text-sm font-semibold text-amber-300 font-mono mt-0.5">
              {config.noTreeShakeIcons ? 'Disabled (Safe)' : 'Enabled'}
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Output Est. Size</div>
            <div className="text-sm font-semibold text-emerald-300 font-mono mt-0.5">
              ~{apkSize}
            </div>
          </div>
          <HardDrive className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Terminal Window */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="px-4 py-3 bg-zinc-900/95 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-zinc-300">
                Flutter Build Console (zsh - flutter 3.29.0)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-sky-400 bg-sky-950/60 border border-sky-800/80 rounded">
                <Clock className="w-3 h-3" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>
            )}

            <button
              onClick={handleCopy}
              disabled={logs.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded transition-colors"
            >
              {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLogs ? 'Copied' : 'Copy Logs'}</span>
            </button>

            {isRunning ? (
              <button
                onClick={cancelBuild}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            ) : (
              <button
                onClick={startBuild}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors shadow-sm"
              >
                {logs.length > 0 ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-run Build</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Execute Pipeline</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pipeline Stepper Progress Bar */}
        <div className="bg-zinc-900/60 px-4 py-2.5 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-zinc-400">
            {allSteps.map((step, idx) => {
              const isPast = currentStepIndex > idx || status === 'completed';
              const isCurrent = currentStepIndex === idx && isRunning;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-mono text-xs transition-colors ${
                        isCurrent
                          ? 'text-sky-300 font-bold underline underline-offset-4 decoration-sky-400'
                          : isPast
                          ? 'text-emerald-400 font-medium'
                          : 'text-zinc-500'
                      }`}
                    >
                      {step.shortLabel}
                    </span>
                  </div>
                  {idx < allSteps.length - 1 && (
                    <span className="text-zinc-600 text-[10px]">&rarr;</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            {isRunning && currentStep && (
              <span className="text-sky-300 font-semibold animate-pulse">
                {currentStep.label}
              </span>
            )}
            <span className="text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-zinc-900 h-1.5">
          <div
            className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Console Log Area */}
        <div className="p-4 bg-zinc-950 font-mono text-xs text-zinc-300 h-96 overflow-y-auto space-y-1.5 select-text">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center space-y-3">
              <TerminalIcon className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
              <div className="text-zinc-400 font-medium">
                Ready to execute Flutter Android release build pipeline
              </div>
              <p className="text-xs text-zinc-600 max-w-md">
                Click <strong>"Execute Pipeline"</strong> to watch the terminal simulation with 
                Cleaning, Dependency Resolution, Asset compilation, Gradle AOT compilation, and Packaging.
              </p>
              <button
                onClick={startBuild}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Simulation Now</span>
              </button>
            </div>
          ) : (
            logs.map((log) => {
              if (log.type === 'cmd') {
                return (
                  <div key={log.id} className="pt-2 pb-1 text-emerald-400 font-semibold flex items-center gap-2 border-t border-zinc-900">
                    <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
                    <span>{log.text}</span>
                  </div>
                );
              }
              if (log.type === 'warn') {
                return (
                  <div key={log.id} className="text-amber-300 flex items-start gap-2 bg-amber-950/20 p-1.5 rounded border border-amber-900/40">
                    <span className="text-zinc-600 select-none text-[11px]">[{log.timestamp}]</span>
                    <span>⚠ {log.text}</span>
                  </div>
                );
              }
              if (log.type === 'gradle') {
                return (
                  <div key={log.id} className="text-sky-300/90 flex items-start gap-2">
                    <span className="text-zinc-600 select-none text-[11px]">[{log.timestamp}]</span>
                    <span>{log.text}</span>
                  </div>
                );
              }
              if (log.type === 'success') {
                return (
                  <div key={log.id} className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg text-emerald-300 font-bold my-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{log.text}</span>
                  </div>
                );
              }
              return (
                <div key={log.id} className="text-zinc-400 flex items-start gap-2">
                  <span className="text-zinc-600 select-none text-[11px]">[{log.timestamp}]</span>
                  <span>{log.text}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Artifact Summary Footer */}
        {status === 'completed' && (
          <div className="bg-zinc-900/90 border-t border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                APK
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                  <span>{apkName}</span>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                    Ready
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Path: build/app/outputs/flutter-apk/{apkName} • Size: {apkSize}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 border border-zinc-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Build Log</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
