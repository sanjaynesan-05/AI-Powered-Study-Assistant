import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error strictly within ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl border border-red-200">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Something went wrong.</h2>
          <p className="text-red-600 mb-6 text-center">
            We encountered an unexpected rendering error. Please try again or refresh the page.
          </p>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
