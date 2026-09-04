import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Edge-safe auth instance for middleware execution
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Exclude /api routes, static files, and Next.js internal files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
