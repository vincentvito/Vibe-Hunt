"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

type MultiImageUploadProps = {
  label: string;
  name: string;
  maxFiles?: number;
  helperText?: string;
  maxSizeMb?: number;
};

type PreviewFile = {
  file: File;
  url: string;
};

export function MultiImageUpload({
  label,
  name,
  maxFiles = 5,
  helperText,
  maxSizeMb = 5,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    setError(null);
    if (!files) return;

    const newPreviews: PreviewFile[] = [...previews];

    for (const file of Array.from(files)) {
      if (newPreviews.length >= maxFiles) {
        setError(`Maximum ${maxFiles} screenshots`);
        break;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select image files only");
        continue;
      }

      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(`Each file must be under ${maxSizeMb}MB`);
        continue;
      }

      newPreviews.push({ file, url: URL.createObjectURL(file) });
    }

    setPreviews(newPreviews);
    // Reset input so the same files can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index: number) {
    setPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
    setError(null);
  }

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {previews.map((p, i) => (
          <div key={i} className="relative">
            <img
              src={p.url}
              alt={`Screenshot ${i + 1}`}
              className="h-20 w-full rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {previews.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Upload className="h-4 w-4" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>

      {/* Hidden file inputs for form submission */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleChange}
        className="sr-only"
      />
      {/* DataTransfer trick: attach actual files to hidden inputs for form submission */}
      {previews.map((p, i) => (
        <input key={i} type="file" name={name} className="sr-only" ref={(el) => {
          if (el) {
            const dt = new DataTransfer();
            dt.items.add(p.file);
            el.files = dt.files;
          }
        }} />
      ))}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
