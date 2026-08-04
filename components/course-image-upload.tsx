"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  defaultUrl?: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function CourseImageUpload({ defaultUrl }: Props) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (uploading) return;
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Sono supportati soltanto JPG, PNG, WebP e AVIF.");
      return;
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      setError("L’immagine deve pesare meno di 5 MB.");
      return;
    }

    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload-image", { method: "POST", body });
      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          json &&
          typeof json === "object" &&
          "error" in json &&
          typeof json.error === "string"
            ? json.error
            : "Impossibile caricare l’immagine";
        throw new Error(message);
      }

      if (
        !json ||
        typeof json !== "object" ||
        !("url" in json) ||
        typeof json.url !== "string"
      ) {
        throw new Error("Risposta del server non valida");
      }

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

      <button
        type="button"
        disabled={uploading}
        aria-label={url ? "Cambia immagine di copertina" : "Scegli immagine di copertina"}
        aria-busy={uploading}
        className="relative block w-full rounded-lg border-2 border-dashed border-stroke overflow-hidden cursor-pointer min-h-44 bg-canvas disabled:cursor-wait"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}>
        {url ? (
          <div className="relative h-44 w-full">
            <Image
              src={url}
              alt="Anteprima della copertina del corso"
              fill
              sizes="(max-width: 768px) 100vw, 608px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-44 gap-2 select-none">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="stroke-subtle" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs text-muted tracking-wide">
              Clicca o trascina un&apos;immagine
            </span>
            <span className="text-[0.7rem] text-subtle">JPG, PNG, WebP, AVIF — max 5 MB</span>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/85">
            <span className="font-mono text-xs tracking-widest uppercase text-petrol animate-pulse">
              Caricamento…
            </span>
          </div>
        )}
      </button>

      {/* File input (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
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
            className="text-[0.7rem] text-muted hover:text-white transition-colors tracking-wide">
            Rimuovi
          </button>
        )}
      </div>

      {error && (
        <p className="text-[0.75rem] text-danger" role="alert">{error}</p>
      )}
    </div>
  );
}
