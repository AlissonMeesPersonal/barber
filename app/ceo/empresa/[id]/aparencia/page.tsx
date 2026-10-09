import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import AppearanceEditor from "@/app/gestor/aparencia/AppearanceEditor";
export const dynamic="force-dynamic";
export default async function CeoAparencia({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{salvo?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin)redirect("/gestor");
 const {id}=await params;
 const {data:shop}=await db.from("barbershops").select("id,slug,name,logo_url,primary_color,secondary_color,background_color,headline,description,layout_style").eq("id",id).single();
 if(!shop)redirect("/ceo");
 return <AppearanceEditor shop={shop} saved={(await searchParams).salvo==="1"} backHref={"/ceo/empresa/"+id}/>;
}
