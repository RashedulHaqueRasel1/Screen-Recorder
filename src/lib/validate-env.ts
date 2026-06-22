/**
 * Environment variable validation.
 *
 * Runs at boot (imported by `auth-config.ts`, which the NextAuth route handler
 * and middleware both load). Throws a clear, actionable error if any required
 * variable is missing so misconfiguration fails fast instead of producing
 * opaque OAuth errors at runtime.
 */

const REQUIRED_ENV = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

/**
 * Resolved Auth.js secret. Auth.js v5 prefers `AUTH_SECRET` but falls back to
 * the v4-era `NEXTAUTH_SECRET`. We accept either.
 */
export const AUTH_SECRET =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

/**
 * Validate all required environment variables. Call once at module load.
 * In non-production builds we throw so the developer sees the problem
 * immediately; in production we throw as well — a missing secret is fatal.
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (!AUTH_SECRET) {
    missing.push("AUTH_SECRET (or NEXTAUTH_SECRET)");
  }

  if (missing.length > 0) {
    const message =
      "[auth] Missing required environment variables:\n" +
      missing.map((k) => `  - ${k}`).join("\n") +
      "\n\n" +
      "Fix: copy .env.example to .env and fill in real values.\n" +
      "  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET: https://console.cloud.google.com/apis/credentials\n" +
      "  AUTH_SECRET: generate with `openssl rand -base64 32`\n" +
      "Authorized redirect URI in Google Cloud must be:\n" +
      "  http://localhost:3000/api/auth/callback/google (dev)\n" +
      "  https://<your-domain>/api/auth/callback/google (prod)";

    // eslint-disable-next-line no-console
    console.error(message);
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

// Run immediately on import so misconfiguration surfaces at boot.
validateEnv();
