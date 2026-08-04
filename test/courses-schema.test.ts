import { describe, expect, it } from "vitest";

import { courseFormSchema } from "@/features/courses/schema";

const validInput = {
  title: "Corso di respirazione",
  description: "Percorso guidato",
  price: "49.99",
  coverImageUrl: "https://example.supabase.co/storage/image.webp",
};

describe("courseFormSchema", () => {
  it("converts the price to integer cents", () => {
    const parsed = courseFormSchema.parse(validInput);

    expect(parsed.price).toBe(4999);
  });

  it("accepts Italian decimal commas and surrounding spaces", () => {
    const parsed = courseFormSchema.parse({ ...validInput, price: " 49,99 " });

    expect(parsed.price).toBe(4999);
  });

  it("rejects prices below the Stripe minimum of 0,50 €", () => {
    const result = courseFormSchema.safeParse({ ...validInput, price: "0.49" });

    expect(result.success).toBe(false);
  });

  it("rejects absurdly high prices", () => {
    const result = courseFormSchema.safeParse({
      ...validInput,
      price: "100001",
    });

    expect(result.success).toBe(false);
  });

  it("requires a non-empty trimmed title", () => {
    expect(
      courseFormSchema.safeParse({ ...validInput, title: "   " }).success
    ).toBe(false);

    const parsed = courseFormSchema.parse({ ...validInput, title: "  Yoga  " });
    expect(parsed.title).toBe("Yoga");
  });

  it("normalizes an empty description to null", () => {
    const parsed = courseFormSchema.parse({ ...validInput, description: "  " });

    expect(parsed.description).toBeNull();
  });

  it("normalizes an empty cover image URL to null and rejects invalid URLs", () => {
    expect(
      courseFormSchema.parse({ ...validInput, coverImageUrl: "" }).coverImageUrl
    ).toBeNull();

    expect(
      courseFormSchema.safeParse({ ...validInput, coverImageUrl: "not-a-url" })
        .success
    ).toBe(false);
  });
});
