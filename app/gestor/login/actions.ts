"use server";
import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";

export async function signIn(form:FormData){
 const email=String(form.get("email")||"").trim().toLowerCase();
 const password=String(form.get("password")||"");
 const db=await getServerSupabase();
 if(!db)redirect("/gestor/login?erro=configuracao");
 if(!email||!password)redirect("/gestor/login?erro=login");
 const {error}=await db.auth.signInWithPassword({email,password});
 if(error)redirect("/gestor/login?erro=login");
 const {data:{user},error:userError}=await db.auth.getUser();
 if(userError||!user){await db.auth.signOut();redirect("/gestor/login?erro=login");}
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(admin){await db.auth.signOut();redirect("/gestor/login?erro=ceo");}
 // An owner invitation is accepted only after Supabase confirms this account's email.
 await db.rpc("claim_network_owner_invitations");
 const [{data:member},{data:owned}]=await Promise.all([
  db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle(),
  db.from("barbershop_networks").select("id").eq("owner_user_id",user.id).limit(1).maybeSingle()
 ]);
 if(!member&&!owned){await db.auth.signOut();redirect("/gestor/login?erro=permissao");}
 redirect(member?"/gestor":"/gestor/rede");
}
