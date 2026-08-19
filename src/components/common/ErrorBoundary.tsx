/**
 * components/common/ErrorBoundary.tsx
 * ----------------------------------------------------------------------------
 * Catches uncaught React render exceptions in child component trees, logs them,
 * and renders a clean recovery fallback UI rather than letting the entire
 * application crash to a blank/black screen.
 * ----------------------------------------------------------------------------
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error caught in React tree:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg, #0f1420)',
            color: 'var(--color-text, #e6e9f0)',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2rem',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface, #171d2b)',
              border: '1px solid var(--color-border, #2a3142)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--color-text-muted, #9aa3b8)', marginBottom: '1.5rem', fontSize: '14px' }}>
              An unexpected error occurred while rendering the view. Click below to reload the app.
            </p>
            {this.state.error && (
              <pre
                style={{
                  fontSize: '12px',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: '#f87171',
                  overflowX: 'auto',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  maxHeight: '150px',
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <Button variant="primary" onClick={this.handleReset}>
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
