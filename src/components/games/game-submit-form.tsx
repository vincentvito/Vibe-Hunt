"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createGame } from "@/server/actions/games";
import { Sparkles, Loader2 } from "lucide-react";

const AI_TOOLS = [
  "cursor",
  "claude",
  "chatgpt",
  "copilot",
  "v0",
  "bolt",
  "replit",
  "windsurf",
];

const ENGINES = [
  { value: "unity_webgl", label: "Unity WebGL" },
  { value: "godot_web", label: "Godot Web" },
  { value: "custom_wasm", label: "Custom WASM" },
  { value: "html5_canvas", label: "HTML5 Canvas" },
  { value: "playcanvas", label: "PlayCanvas" },
  { value: "phaserjs", label: "Phaser.js" },
  { value: "threejs", label: "Three.js" },
  { value: "other", label: "Other" },
];

export function GameSubmitForm() {
  const [tagInput, setTagInput] = useState("");
  const tags = tagInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 5);

  const [error, formAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await createGame(formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Something went wrong";
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Game Title *
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={100}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="My Awesome Game"
        />
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="block text-sm font-medium">
          Tagline *
        </label>
        <input
          id="tagline"
          name="tagline"
          required
          maxLength={140}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="A short, catchy description (max 140 chars)"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Tell us about your game. Markdown supported."
        />
      </div>

      {/* Engine */}
      <div>
        <label htmlFor="engine" className="block text-sm font-medium">
          Game Engine *
        </label>
        <select
          id="engine"
          name="engine"
          required
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">Select engine...</option>
          {ENGINES.map((engine) => (
            <option key={engine.value} value={engine.value}>
              {engine.label}
            </option>
          ))}
        </select>
      </div>

      {/* Web Build URL */}
      <div>
        <label htmlFor="webBuildUrl" className="block text-sm font-medium">
          Web Build URL
        </label>
        <input
          id="webBuildUrl"
          name="webBuildUrl"
          type="url"
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="https://your-game-build.com/index.html"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          URL to your hosted web build (HTML5, WebGL, or WASM)
        </p>
      </div>

      {/* Media URLs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="thumbnailUrl" className="block text-sm font-medium">
            Thumbnail URL
          </label>
          <input
            id="thumbnailUrl"
            name="thumbnailUrl"
            type="url"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://..."
          />
        </div>
        <div>
          <label htmlFor="coverImageUrl" className="block text-sm font-medium">
            Cover Image URL
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Optional URLs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium">
            Trailer Video URL
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://youtube.com/..."
          />
        </div>
        <div>
          <label htmlFor="sourceCodeUrl" className="block text-sm font-medium">
            Source Code URL
          </label>
          <input
            id="sourceCodeUrl"
            name="sourceCodeUrl"
            type="url"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://github.com/..."
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tagInput" className="block text-sm font-medium">
          Tags
        </label>
        <input
          id="tagInput"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          maxLength={200}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="action, puzzle, roguelike (max 5)"
        />
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {tags.map((tag) => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}
      </div>

      {/* AI Section */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-medium">Vibecoding Details</h3>
        </div>
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="hidden" name="madeWithAi" value="false" />
            <input
              type="checkbox"
              name="madeWithAi"
              value="true"
              className="rounded border-border"
            />
            This game was made with AI assistance
          </label>
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium">AI Tools Used</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AI_TOOLS.map((tool) => (
              <label
                key={tool}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
              >
                <input
                  type="checkbox"
                  name="aiToolsUsed"
                  value={tool}
                  className="sr-only"
                />
                {tool.charAt(0).toUpperCase() + tool.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Launching...
          </>
        ) : (
          "Launch Game"
        )}
      </button>
    </form>
  );
}
