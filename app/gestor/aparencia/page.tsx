import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import AppearanceEditor from "./AppearanceEditor";
export const dynamic="force-dynamic";
export default async function Aparencia({searchParams}:{searchParams:Promise<{salvo?:string;shop?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 const params=await searchParams;
 let id:string|undefined;
 if(admin){id=params.shop;if(!id)redirect("/ceo");}
 else {const {data:membership}=await db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle();id=membership?.shop_id;}
 if(!id)return <main className="auth-shell"><p>Conta sem barbearia vinculada.</p></main>;
 const {data:shop}=await db.from("barbershops").select("id,slug,name,logo_url,primary_color,secondary_color,background_color,headline,description,layout_style").eq("id",id).maybeSingle();
 if(!shop) return <main className="auth-shell"><p>Barbearia indisponível.</p></main>;
 return <AppearanceEditor shop={shop} saved={params.salvo==="1"}/>;
}
