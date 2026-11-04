import { createNeonAuth } from "@neondatabase/auth/next/server";

/**
 * Neon Managed Better Auth — preview migration only.
 * This does NOT replace current Supabase auth or grant authorization.
 * Keep RLS protected until account activation and verified identity mapping.
 */
export const neonAuth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});
