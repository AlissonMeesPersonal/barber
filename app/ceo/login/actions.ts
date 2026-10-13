"use server";
import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
export async function signInCeo(form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 const db=await getServerSupabase();
 if(!db)redirect("/ceo/login?erro=configuracao");
 if(!email||!password)redirect("/ceo/login?erro=login");
 const {error}=await db.auth.signInWithPassword({email,password});
 if(error)redirect("/ceo/login?erro=login");
 const {data:{user},error:userError}=await db.auth.getUser();
 if(userError||!user){await db.auth.signOut();redirect("/ceo/login?erro=login");}
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin){await db.auth.signOut();redirect("/ceo/login?erro=permissao");}
 redirect("/ceo");
}