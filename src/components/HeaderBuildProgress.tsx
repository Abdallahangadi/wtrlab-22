import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  Terminal, 
  ChevronDown, 
  Clock, 
  Package, 
  Layers, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { useBuild } from '../context/BuildContext';
import { BuildStep } from '../types/build';

interface HeaderBuildProgressProps {
  onNavigateToTerminal: () => void;
}

export const HeaderBuildProgress: React.FC<HeaderBuildProgressProps> = ({
  onNavigateToTerminal,
}) => {
  const { buildState, startBuild, cancelBuild, resetBuild, allSteps } = useBuild();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const { status, currentStep, currentStepIndex, totalSteps, progress, elapsedSeconds, apkName, apkSize } = buildState;

  // Format elapsed time 00:00
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Visual Status Button in Header */}
      {status === 'running' && (
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-850 border border-sky-500/40 rounded-lg text-left transition-all shadow-lg shadow-sky-500/5 group"
          title="Click to view build step progress details"
        >
          {/* Animated pulsing spinner */}
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
            <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-sky-300 font-mono tracking-tight animate-pulse">
                {currentStep?.label || 'Building...'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-700/60">
                {progress}%
              </span>
            </div>

            {/* Micro progress bar */}
            <div className="w-36 sm:w-44 bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 group-hover:text-zinc-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {status === 'completed' && (
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-left transition-all shadow-sm group"
          title="Build completed successfully"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-emerald-300 font-mono">
                APK Built
              </span>
              <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-900/50 px-1 rounded">
                {apkSize}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
              arm64-v8a • Release
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-emerald-400/70 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {status === 'cancelled' && (
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-600/40 rounded-lg text-left transition-all"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-300 font-medium">Build Stopped</span>
          <ChevronDown className="w-3.5 h-3.5 text-amber-400/70" />
        </button>
      )}

      {status === 'idle' && (
        <button
          onClick={startBuild}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 rounded-lg text-xs font-medium transition-all shadow-sm group"
          title="Run full build pipeline (Clean, Pub Get, Gradle assembleRelease)"
        >
          <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Simulate Build</span>
        </button>
      )}

      {/* Floating Interactive Step Inspector Popover */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header of popover */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Build Pipeline Stages
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {status === 'running' && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Clock className="w-3 h-3 text-sky-400" />
                  {formatTime(elapsedSeconds)}
                </span>
              )}
              <button
                onClick={() => setDropdownOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Current Step Overview Banner */}
          <div className="py-2.5 my-2 px-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400">Current Step:</span>
              <span className="font-mono font-semibold text-sky-300">
                {status === 'running' ? currentStep?.label : status === 'completed' ? 'Build Complete' : 'Idle'}
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-1.5">
              <span>Progress: {progress}%</span>
              <span>
                {currentStepIndex >= 0 ? `Step ${currentStepIndex + 1} of ${totalSteps}` : `${totalSteps} Steps`}
              </span>
            </div>
          </div>

          {/* Step-by-Step List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 py-1 text-xs select-none">
            {allSteps.map((step, idx) => {
              const isPast = currentStepIndex > idx || status === 'completed';
              const isCurrent = currentStepIndex === idx && status === 'running';
              const isFuture = currentStepIndex < idx && status !== 'completed';

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-sky-950/40 border border-sky-500/30 text-sky-200'
                      : isPast
                      ? 'text-zinc-300 bg-zinc-950/30'
                      : 'text-zinc-600 bg-transparent'
                  }`}
                >
                  {/* Step status circle */}
                  <div className="shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] font-mono text-zinc-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-medium truncate ${isCurrent ? 'text-sky-300 font-bold' : ''}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 ml-2">
                        {step.progress}%
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Popover Action Buttons */}
          <div className="pt-3 mt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setDropdownOpen(false);
                onNavigateToTerminal();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Terminal</span>
            </button>

            <div className="flex items-center gap-2">
              {status === 'running' ? (
                <button
                  onClick={cancelBuild}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    startBuild();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{status === 'completed' ? 'Re-run Build' : 'Start Build'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
