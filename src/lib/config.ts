import "server-only";
import { z } from "zod";

/**
 * Server configuration from environment variables (documented in .env.example).
 * Every external service is opt-in: with no variables set, the app runs fully
 * offline with the local data store, the local demo extractor (no AI), local
 * text extraction (no OCR) and the payment stub.
 */
const bool = z
  .enum(["true", "false", "1", "0"])
  .optional()
  .transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.string().optional(),
  DATA_BACKEND: z.enum(["local", "supabase"]).default("local"),
  LOCAL_DATA_DIR: z.string().default(".data"),
  LOCAL_DATA_KEY: z.string().optional(),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("case-files"),

  AI_PROVIDER: z.enum(["mock", "anthropic"]).default("mock"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-opus-5-5"),

  OCR_PROVIDER: z.enum(["local", "textract"]).default("local"),
  AWS_REGION: z.string().default("ca-central-1"),

  PAYMENTS_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_CASE_PASS: z.string().optional(),
  STRIPE_PRICE_CASE_PASS_PLUS: z.string().optional(),

  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  FEATURE_CRIMINAL_CASES: bool,
  DEMO_MODE: z.enum(["true", "false"]).optional(),
  COOKIE_SECURE: z.enum(["true", "false"]).optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(14),
  MAX_UPLOAD_MB: z.coerce.number().int().min(1).max(100).default(20),
});

export type AppConfig = z.infer<typeof schema> & {
  demoMode: boolean;
  cookieSecure: boolean;
};

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Name the variables only, never their values.
    const names = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid environment configuration: ${names}. See .env.example.`);
  }
  const c = parsed.data;
  cached = {
    ...c,
    demoMode: c.DEMO_MODE ? c.DEMO_MODE === "true" : c.DATA_BACKEND === "local",
    cookieSecure: c.COOKIE_SECURE ? c.COOKIE_SECURE === "true" : c.NODE_ENV === "production" && c.APP_BASE_URL.startsWith("https://"),
  };
  return cached;
}

/** Feature flags. Criminal cases stay gated until a lawyer's opinion arrives (decision 0001). */
export function criminalEnabled(): boolean {
  return getConfig().FEATURE_CRIMINAL_CASES;
}

/** What is real and what is mocked right now. Shown on the safety and settings pages. */
export function providerStatus() {
  const c = getConfig();
  return {
    data: c.DATA_BACKEND === "supabase" ? "Supabase (Postgres with row-level security)" : "Local encrypted file store (demo)",
    ai:
      c.AI_PROVIDER === "anthropic" && c.ANTHROPIC_API_KEY
        ? `Anthropic Claude (${c.ANTHROPIC_MODEL})`
        : "Local demo extractor (no AI, runs on this server)",
    ocr: c.OCR_PROVIDER === "textract" ? `AWS Textract (${c.AWS_REGION})` : "Local text extraction (no OCR for scans)",
    payments: c.PAYMENTS_PROVIDER === "stripe" && c.STRIPE_SECRET_KEY ? "Stripe Checkout" : "Payment stub (no charges)",
    aiIsExternal: c.AI_PROVIDER === "anthropic" && Boolean(c.ANTHROPIC_API_KEY),
  };
}
