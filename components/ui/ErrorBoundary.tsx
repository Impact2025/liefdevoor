'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Track error in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </motion.div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Oeps, er ging iets mis
            </h2>
            <p className="text-slate-600 mb-6">
              We werken eraan om dit op te lossen. Probeer het opnieuw of ga terug naar de startpagina.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left overflow-auto max-h-32">
                <p className="text-sm font-mono text-red-600">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {(this.props.showRetry ?? true) && (
                <motion.button
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Opnieuw proberen
                </motion.button>
              )}

              {(this.props.showHome ?? true) && (
                <motion.button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center gap-2"
                  whileTap={{ scale: 0.98 }}
                >
                  <Home className="w-4 h-4" />
                  Naar home
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook to trigger error boundary
export function useErrorHandler() {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

export default ErrorBoundary;
