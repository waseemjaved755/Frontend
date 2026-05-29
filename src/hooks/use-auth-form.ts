"use client";

import { useCallback, useState } from "react";

export function useAuthForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    error,
    success,
    loading,
    setError,
    setSuccess,
    clearMessages,
    run,
  };
}
