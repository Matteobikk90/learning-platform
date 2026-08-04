import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  module: {
    findUnique: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
}));

const muxMock = vi.hoisted(() => ({
  video: {
    uploads: {
      cancel: vi.fn(),
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
}));

const envMock = vi.hoisted(() => ({
  getAppUrl: vi.fn(() => "https://example.com"),
  requireEnv: vi.fn(() => "configured"),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/mux", () => ({
  getMux: () => muxMock,
  getNewAssetPlaybackPolicy: () => "SIGNED",
}));
vi.mock("@/lib/env", () => envMock);

import { MUX_ERROR_MESSAGES } from "@/constants/mux";
import { createDirectUpload } from "@/functions/mux/create-direct-upload";

const courseModule = {
  id: "module_1",
  title: "Modulo 1",
  muxUploadId: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  envMock.getAppUrl.mockReturnValue("https://example.com");
  envMock.requireEnv.mockReturnValue("configured");
  prismaMock.module.findUnique.mockResolvedValue(courseModule);
  prismaMock.module.updateMany.mockResolvedValue({ count: 1 });
  muxMock.video.uploads.cancel.mockResolvedValue(undefined);
});

describe("createDirectUpload", () => {
  it("returns not found without contacting Mux", async () => {
    prismaMock.module.findUnique.mockResolvedValue(null);

    await expect(createDirectUpload("missing", "admin_1")).resolves.toEqual({
      error: MUX_ERROR_MESSAGES.missingModule,
      status: 404,
    });
    expect(muxMock.video.uploads.create).not.toHaveBeenCalled();
  });

  it("reuses a waiting direct upload", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      ...courseModule,
      muxUploadId: "upload_1",
    });
    muxMock.video.uploads.retrieve.mockResolvedValue({
      id: "upload_1",
      status: "waiting",
      url: "https://storage.example/upload",
    });

    await expect(createDirectUpload("module_1", "admin_1")).resolves.toEqual({
      uploadUrl: "https://storage.example/upload",
    });
    expect(muxMock.video.uploads.create).not.toHaveBeenCalled();
  });

  it("blocks a second upload while Mux is processing", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      ...courseModule,
      muxUploadId: "upload_1",
    });
    muxMock.video.uploads.retrieve.mockResolvedValue({
      id: "upload_1",
      status: "asset_created",
    });

    await expect(createDirectUpload("module_1", "admin_1")).resolves.toEqual({
      error: MUX_ERROR_MESSAGES.alreadyProcessing,
      status: 409,
    });
  });

  it("cancels the losing upload when another request wins the race", async () => {
    muxMock.video.uploads.create.mockResolvedValue({
      id: "upload_2",
      url: "https://storage.example/upload-2",
    });
    prismaMock.module.updateMany.mockResolvedValue({ count: 0 });

    await expect(createDirectUpload("module_1", "admin_1")).resolves.toEqual({
      error: MUX_ERROR_MESSAGES.concurrentUpload,
      status: 409,
    });
    expect(muxMock.video.uploads.cancel).toHaveBeenCalledWith("upload_2");
  });
});
