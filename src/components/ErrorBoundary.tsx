'use client';

import React, { ReactNode } from 'react';
import ErrorCard from './ui/ErrorCard';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="w-full p-4">
            <ErrorCard
              title="Component Error"
              message="Something went wrong rendering this component"
              details={this.state.error?.message}
              severity="error"
              onDismiss={() => this.setState({ hasError: false })}
            />
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
