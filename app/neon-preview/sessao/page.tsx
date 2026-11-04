import { notFound } from "next/navigation";
import Link from "next/link";
import { neonAuth } from "@/lib/neon-auth-server";

export const dynamic = "force-dynamic";

export default async function NeonPreviewSession() {
  if (process.env.VERCEL_ENV !== "preview") notFound();
  const { data, error } = await neonAuth.getSession();
  const authenticated = !error && Boolean(data?.user);
  return (
    <main style={{ maxWidth: 540, margin: "10vh auto", padding: 24 }}>
      <h1>Teste de sessão Neon</h1>
      <p>{authenticated ? "Sessão de autenticação válida. Permissões de negócio ainda não habilitadas." : "Nenhuma sessão de autenticação válida."}</p>
      <Link href="/neon-preview/login">Voltar ao teste de login</Link>
    </main>
  );
}
