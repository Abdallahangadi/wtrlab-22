import React from 'react';
import { Layers, Terminal, Sparkles, BookOpen, ShieldCheck, Download } from 'lucide-react';
import { HeaderBuildProgress } from './HeaderBuildProgress';
import { useBuild } from '../context/BuildContext';

interface HeaderProps {
  activeTab: 'workbench' | 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer';
  onTabChange: (tab: 'workbench' | 'terminal' | 'gradle' | 'ci-cd' | 'readiness' | 'analyzer') => void;
  onExportAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onExportAll }) => {
  const { buildState } = useBuild();

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/10 border border-sky-400/20 text-white font-bold font-mono text-base">
              F⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                  Flutter APK Build Studio
                </h1>
                <span className="text-[11px] font-mono text-zinc-400 border border-zinc-800 bg-zinc-900/90 px-1.5 py-0.5 rounded hidden xs:inline">
                  SDK 28-36
                </span>
                <span className="text-[11px] font-mono text-emerald-400 border border-emerald-900/60 bg-emerald-950/40 px-1.5 py-0.5 rounded hidden sm:inline">
                  arm64-v8a
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden lg:block">
                Production Release Architect &amp; Gradle CI/CD Pipeline
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800/80">
            <button
              onClick={() => onTabChange('workbench')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'workbench'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workbench</span>
            </button>

            <button
              onClick={() => onTabChange('terminal')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'terminal'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Terminal className="w-3.5 h-3.5" />
                {buildState.status === 'running' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                )}
              </div>
              <span>CLI Terminal</span>
            </button>

            <button
              onClick={() => onTabChange('gradle')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'gradle'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Gradle &amp; Manifest</span>
            </button>

            <button
              onClick={() => onTabChange('ci-cd')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'ci-cd'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CI/CD</span>
            </button>

            <button
              onClick={() => onTabChange('readiness')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'readiness'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SDK 36</span>
            </button>
          </nav>

          {/* Right Section: Visual Progress Indicator & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Visual Build Step Progress Indicator */}
            <HeaderBuildProgress onNavigateToTerminal={() => onTabChange('terminal')} />

            {/* Quick Actions */}
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm shrink-0"
              title="Download scripts and gradle files"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Download Scripts</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-zinc-850/80 -mx-4 px-4 scrollbar-none">
          <button
            onClick={() => onTabChange('workbench')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'workbench' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Workbench
          </button>
          <button
            onClick={() => onTabChange('terminal')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'terminal' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'
            }`}
          >
            <span>CLI Terminal</span>
            {buildState.status === 'running' && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => onTabChange('gradle')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'gradle' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            Gradle
          </button>
          <button
            onClick={() => onTabChange('ci-cd')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'ci-cd' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            CI/CD
          </button>
          <button
            onClick={() => onTabChange('readiness')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
              activeTab === 'readiness' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
            }`}
          >
            SDK 36
          </button>
        </div>
      </div>

      {/* Visual Ambient Bottom Progress Line (Full-Width Header Edge) */}
      {buildState.status === 'running' && (
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-zinc-900/80 overflow-hidden pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.9)]"
            style={{ width: `${buildState.progress}%` }}
          />
        </div>
      )}
    </header>
  );
};

