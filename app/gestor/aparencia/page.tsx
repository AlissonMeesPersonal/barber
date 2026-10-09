import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import AppearanceEditor from "./AppearanceEditor";
export const dynamic="force-dynamic";
export default async function Aparencia({searchParams}:{searchParams:Promise<{salvo?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(admin)redirect("/ceo");
 const {data:membership}=await db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle();
 if(!membership)return <main className="auth-shell"><p>Nenhuma barbearia vinculada.</p></main>;
 const {data:shop}=await db.from("barbershops").select("id,slug,name,logo_url,primary_color,secondary_color,background_color,headline,description,layout_style").eq("id",membership.shop_id).single();
 if(!shop)return <main className="auth-shell"><p>Barbearia indisponível.</p></main>;
 return <AppearanceEditor shop={shop} saved={(await searchParams).salvo==="1"} backHref="/gestor"/>;
}
