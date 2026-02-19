import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";

interface SubmitResult {
  success?: boolean;
  error?: string;
  data?: unknown;
  redirect?: string;
}

interface UseFormSubmissionOptions {
  onSuccess?: () => void | Promise<void>;
  successMessage?: string;
  redirectUrl?: string;
  redirectDelay?: number;
  context?: Record<string, string | number | boolean | undefined>;
}

export function useFormSubmission(options: UseFormSubmissionOptions = {}) {
  const {
    onSuccess,
    successMessage = "Success! Redirecting...",
    redirectUrl,
    redirectDelay = 1500,
    context = {},
  } = options;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<SubmitResult>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await submitFn();

        if (!result.success && result.error) {
          setError(result.error);
          toast.error(result.error);
          Sentry.captureMessage(`Form submission failed: ${result.error}`, {
            level: "warning",
            contexts: {
              form_submission: context,
            },
          });
          return { success: false, error: result.error };
        }

        // Call custom onSuccess callback if provided
        if (onSuccess) {
          await onSuccess();
        }

        toast.success(successMessage);

        // Redirect after a short delay
        if (redirectUrl || result.redirect) {
          setTimeout(() => {
            router.push(redirectUrl || result.redirect || "/");
          }, redirectDelay);
        }

        return { success: true, data: result.data };
      } catch (err) {
        const errorMsg = extractErrorMessage(err);
        setError(errorMsg);
        toast.error(errorMsg);

        // Log to Sentry with context
        Sentry.captureException(err, {
          contexts: {
            form_submission: {
              ...context,
              error_message: errorMsg,
              timestamp: new Date().toISOString(),
            },
          },
          level: "error",
        });

        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, successMessage, redirectUrl, redirectDelay, context, router]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    handleSubmit,
    reset,
  };
}

/**
 * Extract error message from various error types
 */
function extractErrorMessage(err: unknown): string {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const firstError = err.issues[0];
    return firstError?.message || "Validation error";
  }

  // Handle Response errors (from API)
  if (err instanceof Response) {
    return `HTTP ${err.status}: ${err.statusText}`;
  }

  // Handle standard Error objects
  if (err instanceof Error) {
    return err.message;
  }

  // Handle string errors
  if (typeof err === "string") {
    return err;
  }

  // Fallback
  return "An unexpected error occurred";
}
