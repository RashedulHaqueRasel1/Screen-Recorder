export { auth as middleware } from "@/features/auth/services/auth-config";

export const config = {
  // Guests may record (/record) and edit (/editor) without an account.
  // Authentication is enforced only for account-scoped pages here; the
  // `authorized` callback in auth-config.ts performs the actual redirect.
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
};
