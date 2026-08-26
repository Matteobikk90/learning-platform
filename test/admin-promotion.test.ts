import { beforeEach, describe, expect, it, vi } from "vitest";

import { promoteVerifiedUserToAdmin } from "@/functions/admin/promote-verified-user-to-admin";
import { getAdminEmailArgument } from "@/functions/scripts/get-admin-email-argument";
import type { AdminPromotionClient } from "@/types/admin";

const user = {
  findUnique: vi.fn(),
  updateMany: vi.fn(),
};
const client = { user } as unknown as AdminPromotionClient;
const verifiedUser = {
  emailVerified: new Date("2026-08-26T10:00:00.000Z"),
  id: "user_1",
  role: "USER",
};
const invalidAdminArgumentCases = [
  { args: [] },
  { args: ["--email=invalid"] },
  { args: ["--email=one@example.com", "--email=two@example.com"] },
  { args: ["--email=admin@example.com", "--unknown"] },
];

beforeEach(() => {
  vi.clearAllMocks();
  user.findUnique.mockResolvedValue(verifiedUser);
  user.updateMany.mockResolvedValue({ count: 1 });
});

describe("admin promotion arguments", () => {
  it("normalizes one explicit email", () => {
    expect(getAdminEmailArgument(["--email= Admin@Example.com "])).toBe(
      "admin@example.com"
    );
  });

  it.each(invalidAdminArgumentCases)(
    "rejects unsafe arguments %#",
    ({ args }) => {
      expect(() => getAdminEmailArgument(args)).toThrow();
    }
  );
});

describe("admin promotion", () => {
  it("requires an existing user", async () => {
    user.findUnique.mockResolvedValue(null);

    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).rejects.toThrow(/non trovato/);
    expect(user.updateMany).not.toHaveBeenCalled();
  });

  it("requires a verified email", async () => {
    user.findUnique.mockResolvedValue({
      ...verifiedUser,
      emailVerified: null,
    });

    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).rejects.toThrow(/non verificato/);
    expect(user.updateMany).not.toHaveBeenCalled();
  });

  it("previews without changing any administrator", async () => {
    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", false)
    ).resolves.toBe("wouldPromote");
    expect(user.updateMany).not.toHaveBeenCalled();
  });

  it("promotes only the selected verified user", async () => {
    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).resolves.toBe("promoted");
    expect(user.updateMany).toHaveBeenCalledWith({
      where: {
        email: "admin@example.com",
        emailVerified: { not: null },
        id: "user_1",
        role: "USER",
      },
      data: { role: "ADMIN" },
    });
  });

  it("keeps existing administrators unchanged", async () => {
    user.findUnique.mockResolvedValue({
      ...verifiedUser,
      role: "ADMIN",
    });

    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).resolves.toBe("alreadyAdmin");
    expect(user.updateMany).not.toHaveBeenCalled();
  });

  it("handles a concurrent promotion idempotently", async () => {
    user.findUnique
      .mockResolvedValueOnce(verifiedUser)
      .mockResolvedValueOnce({ role: "ADMIN" });
    user.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).resolves.toBe("alreadyAdmin");
  });

  it("stops when the selected user changes during promotion", async () => {
    user.findUnique
      .mockResolvedValueOnce(verifiedUser)
      .mockResolvedValueOnce({ role: "USER" });
    user.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      promoteVerifiedUserToAdmin(client, "admin@example.com", true)
    ).rejects.toThrow(/stato/);
  });
});
