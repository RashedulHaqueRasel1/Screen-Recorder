import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Fail fast at boot if required environment variables are missing.
// (Imports validate-env for its side-effect; AUTH_SECRET is re-exported below.)
import { AUTH_SECRET } from "@/lib/validate-env";

/**
 * Refresh a Google access token using the stored refresh token.
 *
 * Google access tokens expire after ~1 hour. Without refresh, uploads break
 * for any user who has been signed in longer than an hour even though their
 * session is still valid. This runs server-side inside the `jwt` callback so
 * the refresh token never reaches the browser.
 */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
} | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[auth] Failed to refresh access token (${response.status}): ${text}`
      );
      return null;
    }

    const refreshed = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    return {
      accessToken: refreshed.access_token,
      // expires_in is seconds from now; convert to an absolute epoch ms.
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      // Google only returns a new refresh_token the first time; otherwise reuse.
      refreshToken: refreshed.refresh_token ?? refreshToken,
    };
  } catch (error) {
    console.error("[auth] Error refreshing access token:", error);
    return null;
  }
}

/**
 * Routes that require an authenticated session.
 * Recording and account-scoped pages require Google sign-in.
 */
const PROTECTED_PREFIXES = ["/record", "/dashboard", "/history", "/settings"];

export const authConfig = {
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // drive.file lets RecStudio create and manage the files it uploads.
          // We intentionally do NOT request drive.readonly (a Google restricted
          // scope) — it would require app verification and is unnecessary here.
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file",
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback (runs on the server for every session/JWT read).
     * - On first sign-in (`account` present): cache tokens from Google.
     * - On subsequent reads: refresh the access token proactively when it is
     *   near expiry, so uploads keep working past the 1-hour window.
     */
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens from Google onto the JWT.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // account.expires_at is an epoch-second value from Auth.js.
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : undefined;
        token.refreshError = undefined;
        return token;
      }

      // Token still valid (with a 5-minute safety margin) → keep as-is.
      const now = Date.now();
      const safetyMarginMs = 5 * 60 * 1000;
      const expiresAt =
        typeof token.expiresAt === "number" ? token.expiresAt : undefined;
      if (expiresAt && expiresAt - safetyMarginMs > now) {
        return token;
      }

      // Token expired or about to expire → refresh if we can.
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        if (refreshed) {
          token.accessToken = refreshed.accessToken;
          token.expiresAt = refreshed.expiresAt;
          token.refreshToken = refreshed.refreshToken;
          token.refreshError = undefined;
        } else {
          // Refresh failed — keep the user signed in (so they don't lose
          // their session) but flag it so the client can prompt reconnect.
          token.refreshError = "drive-reconnect-required";
          console.warn(
            "[auth] Access token expired and refresh failed; user should re-authenticate to continue using Drive."
          );
        }
      }
      return token;
    },

    /**
     * Session callback: expose tokens to the client session. The access token
     * is scoped to drive.file only (Drive files created by RecStudio).
     */
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.expiresAt = token.expiresAt as number | undefined;
      session.refreshError = token.refreshError as string | undefined;
      return session;
    },

    /**
     * Middleware authorization gate. Recording and account-scoped routes
     * require login; marketing pages remain public.
     */
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isProtected = PROTECTED_PREFIXES.some((p) =>
        pathname === p || pathname.startsWith(`${p}/`)
      );

      if (isProtected && !isLoggedIn) {
        // Redirect to /signin with a return path so login resumes where the
        // user left off. Handled by the middleware redirect default + signIn page.
        return Response.redirect(
          new URL(`/signin?callbackUrl=${encodeURIComponent(pathname)}`, request.nextUrl)
        );
      }
      return true;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: AUTH_SECRET,
  // Required by Auth.js v5 on any non-Vercel host; also auto-true on localhost.
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export type SessionWithToken = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  refreshError?: string;
};
