import Link from "next/link";
import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
export const dynamic="force-dynamic";
export default async function Ceo(){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:role}=await db.from("platform_admins").select("role").eq("user_id",user.id).maybeSingle();
 if(!role)redirect("/gestor");
 const {data:shops,error}=await db.from("barbershops").select("id,name,slug,active,created_at").order("name");
 return <main className="editor-shell"><div className="editor-top"><div><span className="eyebrow">BARBERFLOW · PLATAFORMA</span><h1>Painel do CEO</h1><p>Controle central de barbearias — sua conta não faz parte da equipe dos estabelecimentos.</p></div><form action="/gestor/sair" method="post"><button className="button secondary">Sair</button></form></div><section className="panel"><h2>Empresas cadastradas</h2><p>{shops?.length??0} barbearias na plataforma</p>{error&&<p>Não foi possível carregar as empresas.</p>}{shops?.map(s=><div className="ceo-shop" key={s.id}><div><strong>{s.name}</strong><p>{s.slug} · {s.active?"Ativa":"Inativa"}</p></div><div className="ceo-actions"><Link className="button secondary" href={"/b/"+s.slug}>Página pública</Link><Link className="button primary" href={"/gestor/aparencia?shop="+s.id}>Personalizar</Link></div></div>)}</section></main>;
}
