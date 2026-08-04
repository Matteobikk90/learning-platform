import { describe, expect, it } from "vitest";

import { readSignInBody } from "@/functions/auth/read-sign-in-body";

function jsonRequest(body: string) {
  return new Request("http://localhost/api/auth/signin/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

function formRequest(params: Record<string, string>) {
  return new Request("http://localhost/api/auth/signin/email", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
}

describe("readSignInBody", () => {
  it("reads email and json flag from a form-encoded body", async () => {
    const body = await readSignInBody(
      formRequest({ email: "user@example.com", json: "true", csrfToken: "x" })
    );

    expect(body).toEqual({ email: "user@example.com", json: "true" });
  });

  it("reads the localized callback URL when provided", async () => {
    const body = await readSignInBody(
      formRequest({
        email: "user@example.com",
        callbackUrl: "https://example.com/en/profile",
      })
    );

    expect(body.callbackUrl).toBe("https://example.com/en/profile");
  });

  it("reads email and json flag from a JSON body", async () => {
    const body = await readSignInBody(
      jsonRequest(JSON.stringify({ email: "user@example.com", json: "true" }))
    );

    expect(body).toEqual({ email: "user@example.com", json: "true" });
  });

  it("reads a multipart form body", async () => {
    const formData = new FormData();
    formData.set("email", "user@example.com");

    const body = await readSignInBody(
      new Request("http://localhost/api/auth/signin/email", {
        method: "POST",
        body: formData,
      })
    );

    expect(body.email).toBe("user@example.com");
  });

  it("ignores non-string fields in a JSON body", async () => {
    const body = await readSignInBody(
      jsonRequest(JSON.stringify({ email: 42, json: true }))
    );

    expect(body).toEqual({ email: undefined, json: undefined });
  });

  it("returns an empty result for malformed bodies", async () => {
    expect(await readSignInBody(jsonRequest("not-json"))).toEqual({});
    expect(await readSignInBody(jsonRequest("null"))).toEqual({});
  });

  it("does not consume the original request body", async () => {
    const request = formRequest({ email: "user@example.com" });

    await readSignInBody(request);

    const original = await request.formData();
    expect(original.get("email")).toBe("user@example.com");
  });
});
