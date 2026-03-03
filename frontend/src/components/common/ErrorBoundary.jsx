'use client';

import React from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback = null, onError = null } = this.props;

    if (hasError) {
      if (onError) {
        onError(error, errorInfo);
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Oops! Something went wrong
            </h2>

            <p className="text-gray-600 text-center text-sm mb-4">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-mono text-red-800 break-words">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <p className="text-xs font-mono text-red-600 mt-2 break-words">
                    {errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Async Error Handler Hook
export const useAsyncError = () => {
  const [, setError] = React.useState();

  return React.useCallback(
    (error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
};

// Error Logger Service
export const errorLogger = {
  log: (error, context = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    };

    console.error('Error logged:', logEntry);

    // Send to error tracking service (e.g., Sentry)
    // You can implement this in the future
    // Example: Sentry.captureException(error, { extra: context });
  },
};

export default ErrorBoundary;
