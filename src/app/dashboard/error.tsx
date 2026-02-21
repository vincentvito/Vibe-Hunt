"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h1 className="mt-4 text-2xl font-bold">Dashboard Error</h1>
      <p className="mt-2 text-muted-foreground">
        Something went wrong loading this section.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
}
