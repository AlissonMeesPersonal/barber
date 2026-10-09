"use server";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase-server";

export async function signIn(form:FormData){
 const email=String(form.get("email")||"").trim();
 const password=String(form.get("password")||"");
 const db=await getServerSupabase();
 if(!db) redirect("/gestor/login?erro=configuracao");
 if(!email||!password) redirect("/gestor/login?erro=dados");
 const {error}=await db.auth.signInWithPassword({email,password});
 if(error) redirect("/gestor/login?erro=login");
 redirect("/gestor");
}
