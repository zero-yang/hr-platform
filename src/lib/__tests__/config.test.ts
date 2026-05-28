import { afterEach, describe, expect, it, vi } from "vitest";

describe("config", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
    window.localStorage.clear();
  });

  it("loads Supabase settings from environment variables and model from local storage", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: " https://env.supabase.co/rest/v1/ ",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: " sb_publishable_env "
    };
    window.localStorage.setItem(
      "hr-platform-config",
      JSON.stringify({
        supabaseUrl: "https://stored.supabase.co",
        supabaseKey: "stored-key",
        deepseekApiKey: "stored-deepseek-key",
        deepseekModel: "deepseek-v4-pro"
      })
    );

    const { loadConfig } = await import("../config");

    expect(loadConfig()).toEqual({
      supabaseUrl: "https://env.supabase.co",
      supabaseKey: "sb_publishable_env",
      deepseekModel: "deepseek-v4-pro"
    });
  });

  it("checks Supabase environment variables separately from the model", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ""
    };

    const { defaultConfig, hasRequiredConfig, hasSupabaseConfig } = await import("../config");

    expect(hasSupabaseConfig(defaultConfig)).toBe(false);
    expect(hasRequiredConfig(defaultConfig)).toBe(false);
    expect(
      hasSupabaseConfig({
        supabaseUrl: "https://env.supabase.co",
        supabaseKey: "sb_publishable_env",
        deepseekModel: ""
      })
    ).toBe(true);
    expect(
      hasRequiredConfig({
        supabaseUrl: "https://env.supabase.co",
        supabaseKey: "sb_publishable_env",
        deepseekModel: "deepseek-v4-flash"
      })
    ).toBe(true);
  });

  it("falls back to the default model when local storage has an unsupported model", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: "https://env.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_env"
    };
    window.localStorage.setItem("hr-platform-config", JSON.stringify({ deepseekModel: "custom-model" }));

    const { loadConfig } = await import("../config");

    expect(loadConfig().deepseekModel).toBe("deepseek-v4-flash");
  });
});
