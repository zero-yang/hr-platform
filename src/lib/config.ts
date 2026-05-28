import type { AppConfig } from "./types";

export const deepseekModelOptions = [
  { label: "DeepSeek V4 Flash", value: "deepseek-v4-flash" },
  { label: "DeepSeek V4 Pro", value: "deepseek-v4-pro" }
];

function normalizeSupabaseUrl(url: string): string {
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

export const defaultConfig: AppConfig = {
  supabaseUrl: normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || ""),
  supabaseKey: (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
  deepseekModel: "deepseek-v4-flash"
};

const storageKey = "hr-platform-config";

export function loadConfig(): AppConfig {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return defaultConfig;
  }

  try {
    const stored = JSON.parse(raw) as Partial<AppConfig>;
    const storedModel = stored.deepseekModel;
    const deepseekModel =
      storedModel && deepseekModelOptions.some((option) => option.value === storedModel)
        ? storedModel
        : defaultConfig.deepseekModel;

    return {
      ...defaultConfig,
      deepseekModel
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(config: AppConfig): void {
  window.localStorage.setItem(storageKey, JSON.stringify({ deepseekModel: config.deepseekModel }));
}

export function hasSupabaseConfig(config: AppConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseKey);
}

export function hasRequiredConfig(config: AppConfig): boolean {
  return Boolean(hasSupabaseConfig(config) && config.deepseekModel);
}
