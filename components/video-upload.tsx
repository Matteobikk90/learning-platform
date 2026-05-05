"use client";

import { useState } from "react";

export function VideoUpload({
  onUploaded,
}: {
  onUploaded?: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpload(file: File) {
    setLoading(true);

    try {
      const res = await fetch("/api/mux/upload", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create Mux upload URL");
      }

      const { uploadUrl, uploadId } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",

        body: file,
      });

      onUploaded?.(uploadId);

      alert("Upload completed. Mux is processing the video.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <input
        type="file"
        accept="video/*"
        disabled={loading}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) handleUpload(file);
        }}
      />

      {loading && <p className="mt-2 text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}
