import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible subset of the auth config. Middleware runs on the Edge
 * Runtime, which cannot load Prisma's Node-API query engine — so this file
 * must never import `@/lib/prisma`, `bcryptjs`, or the Credentials
 * provider. It only knows how to read/validate the session JWT.
 *
 * The full config (with the database adapter and real login logic) lives
 * in `auth.ts` and is used everywhere except middleware.
 */
export default {
  pages: {
    signIn: "/login",
  },
  providers: [], // real providers are added in auth.ts (Node runtime only)
} satisfies NextAuthConfig;
