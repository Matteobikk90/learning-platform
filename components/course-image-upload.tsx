"use client";

import { useRef, useState } from "react";

type Props = {
  defaultUrl?: string | null;
};

export function CourseImageUpload({ defaultUrl }: Props) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload-image", { method: "POST", body });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Upload failed");

      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden input carries the URL into the form submission */}
      <input type="hidden" name="coverImageUrl" value={url} />

      {/* Preview / drop zone */}
      <div
        className="relative rounded-lg border-2 border-dashed border-stroke overflow-hidden cursor-pointer"
        style={{ minHeight: "11rem", background: "var(--color-canvas)" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}>
        {url ? (
          <img
            src={url}
            alt="Cover preview"
            className="w-full h-44 object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-44 gap-2 select-none">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs text-muted tracking-wide">
              Clicca o trascina un&apos;immagine
            </span>
            <span className="text-[0.7rem] text-subtle">JPG, PNG, WebP — max 5 MB</span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(247,250,250,0.85)" }}>
            <span className="font-mono text-xs tracking-widest uppercase text-petrol animate-pulse">
              Caricamento…
            </span>
          </div>
        )}
      </div>

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Actions row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-[0.7rem]">
          {url ? "Cambia immagine" : "Scegli file"}
        </button>
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-[0.7rem] text-muted hover:text-navy transition-colors tracking-wide">
            Rimuovi
          </button>
        )}
      </div>

      {error && (
        <p className="text-[0.75rem] text-red-600">{error}</p>
      )}
    </div>
  );
}
