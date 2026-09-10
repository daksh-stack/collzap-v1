import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload(); // Hard reset for simplicity in recovery
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-4">
          <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center shadow-lg">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-bad/10 text-bad">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-ink">
              Something went wrong
            </h1>
            <div className="mb-6 text-sm text-mute">
              <p>An unexpected error stopped this page from loading.</p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-4 max-h-32 overflow-auto rounded bg-surface-2 p-2 text-left font-mono text-[11px] text-bad">
                  {this.state.error.toString()}
                </pre>
              )}
            </div>
            <Button onClick={this.handleReset} className="w-full">
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
