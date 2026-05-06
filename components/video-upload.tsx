"use client";

import { attachMuxUploadToModule } from "@/features/modules/actions";
import { useState } from "react";

type VideoUploadProps = {
  moduleId: string;
};

export function VideoUpload({ moduleId }: VideoUploadProps) {
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

      await attachMuxUploadToModule(moduleId, uploadId);

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

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
