import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  GitBranch, 
  Code2, 
  FolderDown, 
  FileCode,
  Layers,
  Box
} from 'lucide-react';
import { BuildConfig } from '../types/build';
import { 
  generateBashScript, 
  generatePowerShellScript, 
  generateGitHubWorkflow,
  generateFlutterBuildArgs
} from '../utils/commandGenerator';

interface AutomationScriptsProps {
  config: BuildConfig;
}

export const AutomationScripts: React.FC<AutomationScriptsProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<'bash' | 'powershell' | 'github' | 'makefile' | 'docker'>('bash');
  const [copied, setCopied] = useState(false);

  const bashScript = generateBashScript(config);
  const powerShellScript = generatePowerShellScript(config);
  const githubWorkflow = generateGitHubWorkflow(config);

  const makefileContent = `# Makefile for Flutter Android Release
.PHONY: all clean pub build-arm64 build-split release

all: release

clean:
\t@echo "🧹 Cleaning previous build..."
\tflutter clean

pub:
\t@echo "📦 Resolving pub dependencies..."
\tflutter pub get

build-arm64: clean pub
\t@echo "🚀 Compiling 64-bit ARM release APK..."
\tflutter build apk --release --target-platform=android-arm64 --no-tree-shake-icons

build-split: clean pub
\t@echo "🚀 Compiling split-per-ABI release APKs..."
\tflutter build apk --release --split-per-abi --no-tree-shake-icons

release: clean pub
\t@echo "🚀 Compiling according to configured parameters..."
\tflutter ${generateFlutterBuildArgs(config).join(' ')}
`;

  const dockerContent = `# Dockerfile for Hermetic Flutter Android Build
FROM ghcr.io/cirruslabs/flutter:3.29.0

WORKDIR /app
COPY . .

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Run clean and pub get
RUN flutter clean && flutter pub get

# Build APK
RUN flutter ${generateFlutterBuildArgs(config).join(' ')}

CMD ["cp", "-r", "build/app/outputs/flutter-apk", "/output"]
`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'bash':
        return bashScript;
      case 'powershell':
        return powerShellScript;
      case 'github':
        return githubWorkflow;
      case 'makefile':
        return makefileContent;
      case 'docker':
        return dockerContent;
      default:
        return '';
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case 'bash':
        return 'build-release.sh';
      case 'powershell':
        return 'build-release.ps1';
      case 'github':
        return '.github/workflows/flutter-apk.yml';
      case 'makefile':
        return 'Makefile';
      case 'docker':
        return 'Dockerfile';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const fileName = getFileName().split('/').pop() || 'script.sh';
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
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-400" />
            Automated CI/CD &amp; Developer Scripts
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Pre-configured production pipelines ready to drop into GitHub Actions, local terminal scripts, or Docker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('bash')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeTab === 'bash'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>build-release.sh (Bash / macOS / Linux)</span>
        </button>

        <button
          onClick={() => setActiveTab('powershell')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeTab === 'powershell'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span>build-release.ps1 (Windows PowerShell)</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeTab === 'github'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5 text-purple-400" />
          <span>GitHub Actions Workflow</span>
        </button>

        <button
          onClick={() => setActiveTab('makefile')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeTab === 'makefile'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span>Makefile</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all ${
            activeTab === 'docker'
              ? 'bg-sky-950/70 border-sky-600 text-sky-200'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-sky-400" />
          <span>Dockerfile</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-200">
            <span>{getFileName()}</span>
          </div>
          <span className="text-[11px] text-zinc-400">Executable Script</span>
        </div>

        <div className="p-5 overflow-x-auto max-h-[560px] bg-zinc-950/95">
          <pre className="font-mono text-xs text-zinc-300 leading-relaxed select-all">
            {getActiveContent()}
          </pre>
        </div>
      </div>
    </div>
  );
};
