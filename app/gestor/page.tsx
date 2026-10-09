import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";
import PainelDemo from "./PainelDemo";

export const dynamic="force-dynamic";
export default async function Gestor(){
 const db=await getServerSupabase();
 if(!db) return <main className="auth-shell"><section className="auth-card"><h1>Painel do gestor</h1><p>O acesso está protegido até configurarmos o Supabase exclusivo do BarberFlow.</p><a className="button secondary" href="/agendar">Ir para agendamentos</a></section></main>;
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user) redirect("/gestor/login");
 const {data:member,error:permissionError}=await db.from("memberships").select("id,role").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle();
 if(permissionError||!member) return <main className="auth-shell"><section className="auth-card"><h1>Acesso restrito</h1><p>Sua conta não possui permissão de gestor de barbearia.</p><form action="/gestor/sair" method="post"><button className="button secondary">Sair</button></form></section></main>;
 return <PainelDemo/>;
}
