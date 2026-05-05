"use client";

import { VideoUpload } from "@/components/video-upload";
import { createModule } from "@/features/modules/actions";
import { useState } from "react";

export function ModuleForm({ courseId }: { courseId: string }) {
  const [uploadId, setUploadId] = useState("");

  return (
    <form action={createModule} className="mt-8 space-y-6">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="uploadId" value={uploadId} />

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          name="title"
          required
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Order</label>
        <input
          name="order"
          type="number"
          min="1"
          required
          placeholder="1"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Video</label>
        <VideoUpload onUploaded={setUploadId} />
        {uploadId && (
          <p className="mt-2 text-xs text-gray-500">Upload ID: {uploadId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Duration seconds</label>
        <input
          name="durationSeconds"
          type="number"
          min="1"
          required
          placeholder="1200"
          className="mt-2 w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={!uploadId}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
        Create module
      </button>
    </form>
  );
}
