import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    /** Set when the access token expired and could not be refreshed. */
    refreshError?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    refreshError?: string;
  }
}
