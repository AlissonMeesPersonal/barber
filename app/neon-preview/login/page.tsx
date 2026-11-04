import { notFound } from "next/navigation";
import { neonPreviewSignIn } from "./actions";

export default async function NeonPreviewLogin({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (process.env.VERCEL_ENV !== "preview") notFound();
  const { erro } = await searchParams;
  return (
    <main style={{ maxWidth: 480, margin: "10vh auto", padding: 24 }}>
      <h1>BarberFlow · Teste de autenticação Neon</h1>
      <p>Ambiente de homologação. O acesso aos dados de negócio ainda está bloqueado.</p>
      <form action={neonPreviewSignIn}>
        <label style={{ display: "block", marginBottom: 16 }}>
          E-mail
          <input name="email" type="email" autoComplete="email" required style={{ display: "block", width: "100%" }} />
        </label>
        <label style={{ display: "block", marginBottom: 16 }}>
          Senha
          <input name="password" type="password" autoComplete="current-password" required style={{ display: "block", width: "100%" }} />
        </label>
        {erro && <p role="alert">Não foi possível entrar. Verifique a ativação da conta.</p>}
        <button type="submit">Testar sessão Neon</button>
      </form>
    </main>
  );
}
