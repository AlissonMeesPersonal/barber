import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import AppearanceEditor from "./AppearanceEditor";
export const dynamic="force-dynamic";
export default async function Aparencia({searchParams}:{searchParams:Promise<{salvo?:string;shop?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(admin)redirect("/gestor/login?erro=ceo");
 const {data:memberships}=await db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]);
 if(!memberships?.length)return <main className="auth-shell"><p>Nenhuma barbearia vinculada.</p></main>;
 const requested=(await searchParams).shop;
 const shopId=memberships.find(m=>m.shop_id===requested)?.shop_id||memberships[0].shop_id;
 const {data:shop}=await db.from("barbershops").select("id,slug,name,logo_url,primary_color,secondary_color,background_color,headline,description,layout_style").eq("id",shopId).single();
 if(!shop)return <main className="auth-shell"><p>Barbearia indisponível.</p></main>;
 return <AppearanceEditor shop={shop} saved={(await searchParams).salvo==="1"} backHref={"/gestor?shop="+shopId}/>;
}
