"use client";

import React, { ReactNode, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  level?: "root" | "form" | "api";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        error_boundary: {
          level: this.props.level || "unknown",
          componentStack: info.componentStack,
        },
      },
      level: "error",
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, info);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            resetError={this.resetError}
            level={this.props.level}
          />
        )
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  level?: "root" | "form" | "api";
}

function ErrorFallback({ error, resetError, level }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = () => {
    switch (level) {
      case "form":
        return "Something went wrong while processing your form. Please try again.";
      case "api":
        return "Failed to load data. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-destructive" />
          <div className="flex-1">
            <h2 className="font-semibold text-destructive">Error</h2>
            <p className="mt-2 text-sm text-muted-foreground">{getErrorMessage()}</p>

            {showDetails && (
              <div className="mt-4 rounded bg-background p-3">
                <p className="overflow-auto text-xs font-mono text-muted-foreground">
                  {error.message}
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={resetError} size="sm" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                size="sm"
                variant="ghost"
              >
                {showDetails ? "Hide" : "Details"}
              </Button>
            </div>

            {level === "root" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Error ID: {Sentry.captureMessage("Error boundary triggered", "error")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
