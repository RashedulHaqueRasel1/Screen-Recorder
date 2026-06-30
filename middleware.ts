export { auth as middleware } from "@/features/auth/services/auth-config";

export const config = {
  // The `authorized` callback in auth-config.ts performs the actual redirect.
  matcher: [
    "/record/:path*",
    "/dashboard/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
};
