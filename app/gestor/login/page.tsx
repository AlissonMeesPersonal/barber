import Link from "next/link";
import { signIn } from "./actions";
export default async function Login({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 return <main className="auth-shell"><div className="auth-card"><Link href="/" className="brand">✂ Barber<span>Flow</span></Link><div className="eyebrow" style={{marginTop:28}}>ÁREA RESTRITA</div><h1>Entrar como gestor</h1><p>Somente proprietários e gestores autorizados podem acessar o painel.</p>{erro&&<p role="alert" className="auth-error">{erro==="configuracao"?"A autenticação ainda não foi configurada.":"Não foi possível entrar. Verifique suas credenciais."}</p>}<form action={signIn} className="auth-form"><label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" required/></label><button className="button primary" type="submit">Entrar no painel</button></form><Link href="/agendar" className="quiet-link">Sou cliente · Fazer agendamento</Link></div></main>
}
