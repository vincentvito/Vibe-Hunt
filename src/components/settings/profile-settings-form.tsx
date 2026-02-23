"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/server/actions/profile";
import { Check, Loader2 } from "lucide-react";

type ProfileSettingsFormProps = {
  initialData: {
    bio: string;
    websiteUrl: string;
    githubUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    discordHandle: string;
  };
};

const INPUT_CLASS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [form, setForm] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateProfile(form);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          maxLength={500}
          rows={3}
          className={INPUT_CLASS + " mt-1"}
          placeholder="Game developer, pixel art enthusiast..."
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {form.bio.length}/500
        </p>
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium">
          Website
        </label>
        <input
          id="websiteUrl"
          type="url"
          value={form.websiteUrl}
          onChange={(e) => handleChange("websiteUrl", e.target.value)}
          placeholder="https://yoursite.com"
          className={INPUT_CLASS + " mt-1"}
        />
      </div>

      {/* GitHub URL */}
      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium">
          GitHub
        </label>
        <input
          id="githubUrl"
          type="url"
          value={form.githubUrl}
          onChange={(e) => handleChange("githubUrl", e.target.value)}
          placeholder="https://github.com/username"
          className={INPUT_CLASS + " mt-1"}
        />
      </div>

      {/* Twitter/X URL */}
      <div>
        <label htmlFor="twitterUrl" className="block text-sm font-medium">
          X (Twitter)
        </label>
        <input
          id="twitterUrl"
          type="url"
          value={form.twitterUrl}
          onChange={(e) => handleChange("twitterUrl", e.target.value)}
          placeholder="https://x.com/username"
          className={INPUT_CLASS + " mt-1"}
        />
      </div>

      {/* Instagram URL */}
      <div>
        <label htmlFor="instagramUrl" className="block text-sm font-medium">
          Instagram
        </label>
        <input
          id="instagramUrl"
          type="url"
          value={form.instagramUrl}
          onChange={(e) => handleChange("instagramUrl", e.target.value)}
          placeholder="https://instagram.com/username"
          className={INPUT_CLASS + " mt-1"}
        />
      </div>

      {/* Discord Handle */}
      <div>
        <label htmlFor="discordHandle" className="block text-sm font-medium">
          Discord
        </label>
        <input
          id="discordHandle"
          type="text"
          value={form.discordHandle}
          onChange={(e) => handleChange("discordHandle", e.target.value)}
          placeholder="username"
          className={INPUT_CLASS + " mt-1"}
        />
      </div>

      {/* Feedback */}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 text-sm text-green-600">
          <Check className="h-4 w-4" /> Profile updated successfully
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
