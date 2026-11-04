import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return new NextResponse(null, { status: 404 });
  }
  const connection = process.env.NEON_DATABASE_URL;
  if (!connection) return NextResponse.json({ connected: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const sql = neon(connection);
    const [result] = await sql`
      SELECT
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r') AS tables,
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity) AS protected,
        (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND (has_table_privilege('anonymous',c.oid,'SELECT') OR has_table_privilege('authenticated',c.oid,'SELECT'))) AS publicly_readable
    `;
    const secure = result.tables === 18 && result.protected === result.tables && result.publicly_readable === 0;
    return NextResponse.json({ connected: true, accessRestricted: secure }, { status: secure ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ connected: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
