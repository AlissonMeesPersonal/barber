"use client";
import {useState} from "react";
import Link from "next/link";
import {createClient} from "@supabase/supabase-js";
export default function Cadastro(){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
 async function register(e:React.FormEvent<HTMLFormElement>){
 e.preventDefault();setBusy(true);setNotice("");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key){setNotice("Autenticação indisponível");setBusy(false);return;}
 const db=createClient(url,key);
 const {error}=await db.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+"/gestor/login"}});
 setBusy(false);setNotice(error?"Não foi possível solicitar o cadastro. Verifique os dados ou tente novamente.":"Cadastro solicitado. Confira seu e-mail para confirmar a conta. O acesso administrativo depende de autorização da plataforma.");
 }
 return <main className="auth-shell"><section className="auth-card"><Link className="brand" href="/">✂ BarberFlow</Link><h1>Criar acesso</h1><p>Crie suas credenciais. Sua conta só terá acesso administrativo após receber uma permissão da plataforma.</p><form className="auth-form" onSubmit={register}><label>E-mail<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" minLength={10} autoComplete="new-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button type="submit" className="button primary" disabled={busy}>{busy?"Aguarde...":"Criar conta"}</button></form>{notice&&<p role="status">{notice}</p>}<Link className="quiet-link" href="/gestor/login">Já tenho acesso</Link></section></main>;
}
