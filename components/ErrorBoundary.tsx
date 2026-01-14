import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, RefreshCw, Check } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleCopy = () => {
    const { error } = this.state;
    const text = `Error: ${error?.toString()}\n\nStack Trace:\n${error?.stack || 'No stack trace available'}`;
    
    navigator.clipboard.writeText(text).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(err => console.error('Failed to copy error:', err));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6 font-mono selection:bg-red-500/30">
          <div className="w-full max-w-2xl flex flex-col items-center">
              <div className="bg-red-500/10 p-4 rounded-full mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
              
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Application Crashed</h1>
              <p className="text-gray-400 mb-8 text-center max-w-md">
                  We encountered an unexpected error. Please copy the details below and share them with the support team.
              </p>
              
              <div className="bg-black/50 backdrop-blur-sm p-5 rounded-xl border border-gray-800 w-full overflow-hidden flex flex-col mb-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-3 border-b border-gray-800 pb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    <span className="text-xs text-gray-500 ml-2">error.log</span>
                </div>
                <div className="overflow-auto max-h-[300px] text-xs font-mono text-red-200/90 whitespace-pre-wrap break-words leading-relaxed">
                    <span className="text-red-400 font-bold">{this.state.error?.toString()}</span>
                    <br/>
                    <br/>
                    <span className="opacity-50">{this.state.error?.stack}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl text-white font-bold transition-all shadow-lg shadow-red-600/20 w-full sm:w-auto"
                  >
                    <RefreshCw size={18} /> Reload App
                  </button>
                  
                  <button 
                    onClick={this.handleCopy}
                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all border active:scale-95 w-full sm:w-auto ${
                        this.state.copied 
                        ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-600/20' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {this.state.copied ? <Check size={18} /> : <Copy size={18} />} 
                    {this.state.copied ? "Copied!" : "Copy Error Details"}
                  </button>
              </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
