"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

type ImageUploadProps = {
  label: string;
  name: string;
  helperText?: string;
  maxSizeMb?: number;
};

export function ImageUpload({
  label,
  name,
  helperText,
  maxSizeMb = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      clearFile();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMb}MB)`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
  }

  function clearFile() {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-full rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {fileName}
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Click to upload</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleChange}
          className="sr-only"
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
