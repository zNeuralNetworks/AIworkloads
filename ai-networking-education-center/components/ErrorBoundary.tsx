import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { clearAppStorage } from '../utils/safeStorage';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;

  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    clearAppStorage();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-6 text-center">
          <div className="bg-[#161b22] border border-red-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
              The application encountered an unexpected error. This is likely due to a data mismatch
              or a temporary glitch.
            </p>

            <div className="bg-black/30 p-3 rounded text-xs font-mono text-red-300 mb-6 text-left overflow-auto max-h-32 border border-red-900/30">
              {this.state.error?.message || 'Unknown error'}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={18} />
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;
