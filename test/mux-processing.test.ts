import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  module: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const muxMock = vi.hoisted(() => ({
  video: {
    uploads: { retrieve: vi.fn() },
    assets: { retrieve: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/mux", () => ({ getMux: () => muxMock }));

import { reconcileMuxUpload } from "@/functions/mux/process-upload";

const pendingModule = {
  id: "module_1",
  courseId: "course_1",
  muxAssetId: "old_asset",
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.module.findUnique.mockResolvedValue(pendingModule);
  prismaMock.module.updateMany.mockResolvedValue({ count: 1 });
});

describe("reconcileMuxUpload", () => {
  it("keeps a waiting upload in processing without touching the database", async () => {
    muxMock.video.uploads.retrieve.mockResolvedValue({ status: "waiting" });

    await expect(reconcileMuxUpload("upload_1")).resolves.toBeNull();
    expect(muxMock.video.assets.retrieve).not.toHaveBeenCalled();
    expect(prismaMock.module.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.module.updateMany).not.toHaveBeenCalled();
  });

  it("stores a ready signed asset and clears the pending upload", async () => {
    muxMock.video.uploads.retrieve.mockResolvedValue({
      status: "asset_created",
      asset_id: "new_asset",
    });
    muxMock.video.assets.retrieve.mockResolvedValue({
      id: "new_asset",
      status: "ready",
      duration: 91.2,
      playback_ids: [{ id: "signed_playback", policy: "signed" }],
    });

    await expect(reconcileMuxUpload("upload_1")).resolves.toEqual({
      moduleId: "module_1",
      courseId: "course_1",
      assetIdsToDelete: ["old_asset"],
    });
    expect(prismaMock.module.updateMany).toHaveBeenCalledWith({
      where: { id: "module_1", muxUploadId: "upload_1" },
      data: {
        muxUploadId: null,
        muxAssetId: "new_asset",
        videoPlaybackId: "signed_playback",
        videoPlaybackPolicy: "SIGNED",
        videoError: null,
        durationSeconds: 92,
      },
    });
  });

  it("does not report success when another request won the database race", async () => {
    muxMock.video.uploads.retrieve.mockResolvedValue({
      status: "asset_created",
      asset_id: "new_asset",
    });
    muxMock.video.assets.retrieve.mockResolvedValue({
      id: "new_asset",
      status: "ready",
      duration: 90,
      playback_ids: [{ id: "playback_1", policy: "public" }],
    });
    prismaMock.module.updateMany.mockResolvedValue({ count: 0 });

    await expect(reconcileMuxUpload("upload_1")).resolves.toBeNull();
  });

  it("records an errored asset and returns it for cleanup", async () => {
    muxMock.video.uploads.retrieve.mockResolvedValue({
      status: "asset_created",
      asset_id: "broken_asset",
    });
    muxMock.video.assets.retrieve.mockResolvedValue({
      id: "broken_asset",
      status: "errored",
      errors: { messages: ["Unsupported video"] },
    });

    await expect(reconcileMuxUpload("upload_1")).resolves.toEqual({
      moduleId: "module_1",
      courseId: "course_1",
      assetIdsToDelete: ["broken_asset"],
    });
    expect(prismaMock.module.updateMany).toHaveBeenCalledWith({
      where: { id: "module_1", muxUploadId: "upload_1" },
      data: {
        muxUploadId: null,
        videoError: "Unsupported video",
      },
    });
  });

  it("clears a dangling upload that Mux no longer knows", async () => {
    muxMock.video.uploads.retrieve.mockRejectedValue(
      Object.assign(new Error("Not found"), { status: 404 })
    );

    await expect(reconcileMuxUpload("upload_1")).resolves.toEqual({
      moduleId: "module_1",
      courseId: "course_1",
      assetIdsToDelete: [],
    });
    expect(prismaMock.module.updateMany).toHaveBeenCalledWith({
      where: { id: "module_1", muxUploadId: "upload_1" },
      data: {
        muxUploadId: null,
        videoError: "Mux non trova più il caricamento associato al modulo.",
      },
    });
  });

  it("fails safely when a ready asset has no supported playback ID", async () => {
    muxMock.video.uploads.retrieve.mockResolvedValue({
      status: "asset_created",
      asset_id: "asset_without_playback",
    });
    muxMock.video.assets.retrieve.mockResolvedValue({
      id: "asset_without_playback",
      status: "ready",
      playback_ids: [{ id: "drm_playback", policy: "drm" }],
    });

    await expect(reconcileMuxUpload("upload_1")).resolves.toEqual({
      moduleId: "module_1",
      courseId: "course_1",
      assetIdsToDelete: ["asset_without_playback"],
    });
    expect(prismaMock.module.updateMany).toHaveBeenCalledWith({
      where: { id: "module_1", muxUploadId: "upload_1" },
      data: {
        muxUploadId: null,
        videoError: "Mux non ha generato un identificativo di riproduzione.",
      },
    });
  });
});
