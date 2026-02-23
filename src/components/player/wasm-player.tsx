"use client";

import { useState } from "react";
import { Maximize2, Minimize2, Play, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type WasmPlayerProps = {
  buildUrl: string;
  title: string;
  className?: string;
};

export function WasmPlayer({ buildUrl, title, className }: WasmPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  function toggleFullscreen() {
    const container = document.getElementById("wasm-player-container");
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }

  if (!buildUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-border bg-muted",
          className
        )}
        style={{ aspectRatio: "16/9" }}
      >
        <div className="text-center text-muted-foreground">
          <Play className="mx-auto h-12 w-12" />
          <p className="mt-2 text-sm">No web build available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="wasm-player-container"
      className={cn("relative overflow-hidden rounded-xl border border-border bg-black", className)}
    >
      {!isLoaded && !error && (
        <div
          className="flex items-center justify-center bg-muted"
          style={{ aspectRatio: "16/9" }}
        >
          <button
            onClick={() => setIsLoaded(true)}
            className="flex flex-col items-center gap-3 text-foreground transition-transform hover:scale-105"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-sm font-medium">Click to Play</span>
          </button>
        </div>
      )}

      {error && (
        <div
          className="flex items-center justify-center bg-muted"
          style={{ aspectRatio: "16/9" }}
        >
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <p className="mt-2 text-sm">Failed to load game</p>
          </div>
        </div>
      )}

      {isLoaded && !error && (
        <>
          <iframe
            src={buildUrl}
            title={`Play ${title}`}
            className="h-full w-full"
            style={{ aspectRatio: "16/9" }}
            allow="autoplay; fullscreen; gamepad"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onError={() => setError(true)}
          />
          <div className="absolute right-2 top-2">
            <button
              onClick={toggleFullscreen}
              className="rounded-lg bg-black/60 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
