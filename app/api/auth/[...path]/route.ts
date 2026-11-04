import { neonAuth } from "@/lib/neon-auth-server";

/**
 * Separate auth API proxy for migration branch. The branch is deployed to
 * Vercel Preview only. This file is NOT in the production GitHub main branch.
 */
export const { GET, POST, PUT, PATCH, DELETE } = neonAuth.handler();
