import React from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    window.location.href = "/";
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface dark:bg-surface-dark text-ink dark:text-ink-dark flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted dark:text-muted-dark max-w-md mb-6">
            An unforeseen error occurred in the application display. Click below to reload and continue.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
            >
              <RefreshCw size={16} /> Reload Application
            </button>

            {this.state.error && (
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-1.5 text-xs text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark px-3 py-2 rounded-lg border border-border-subtle dark:border-border-subtle-dark transition-colors"
              >
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {this.state.showDetails ? "Hide Error Details" : "Show Error Details"}
              </button>
            )}
          </div>

          {this.state.showDetails && this.state.error && (
            <div className="w-full max-w-xl text-left bg-elevated dark:bg-elevated-dark border border-red-500/20 rounded-xl p-4 text-xs font-mono text-red-400 overflow-x-auto max-h-60">
              <p className="font-semibold text-red-500 mb-1">{this.state.error.toString()}</p>
              {this.state.error.stack && (
                <pre className="whitespace-pre-wrap text-[11px] text-muted dark:text-muted-dark leading-relaxed">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
