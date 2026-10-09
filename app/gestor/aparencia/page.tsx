import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import AppearanceEditor from "./AppearanceEditor";
export const dynamic="force-dynamic";
export default async function Aparencia({searchParams}:{searchParams:Promise<{salvo?:string}>}){
 const db=await getServerSupabase();
 if(!db) return <main className="auth-shell"><div className="auth-card"><h1>Personalização indisponível</h1><p>Configure a integração Supabase para habilitar o editor.</p></div></main>;
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/gestor/login");
 const {data:memberships}=await db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]).limit(1);
 const id=memberships?.[0]?.shop_id;
 if(!id)return <main className="auth-shell"><section className="auth-card"><h1>Sem barbearia vinculada</h1><p>Seu usuário ainda precisa ser cadastrado como proprietário ou gestor de uma barbearia.</p></section></main>;
 const {data:shop}=await db.from("barbershops").select("id,slug,name,logo_url,primary_color,secondary_color,background_color,headline,description,layout_style").eq("id",id).single();
 if(!shop)return <main>Barbearia não encontrada.</main>;
 const saved=(await searchParams).salvo==="1";
 return <AppearanceEditor shop={shop} saved={saved}/>;
}
