import {redirect} from "next/navigation";
import Link from "next/link";
import {getServerSupabase} from "@/lib/supabase-server";
import PainelDemo from "./PainelDemo";
export const dynamic="force-dynamic";
export default async function Gestor(){
 const db=await getServerSupabase();if(!db) return <main className="auth-shell"><p>Configure o Supabase.</p></main>;
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("role").eq("user_id",user.id).maybeSingle();
 if(admin)redirect("/ceo");
 const {data:member}=await db.from("memberships").select("id,role").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle();
 if(!member)return <main className="auth-shell"><section className="auth-card"><h1>Acesso restrito</h1><p>Conta sem permissão vinculada.</p><Link href="/" className="button secondary">Voltar</Link></section></main>;
 return <PainelDemo/>;
}
