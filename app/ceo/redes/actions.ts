"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";

async function ceoDb(){
 const db=await getServerSupabase();
 if(!db)redirect("/ceo/login");
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/ceo/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin)throw new Error("Somente o CEO pode administrar redes.");
 return db;
}
export async function createNetwork(form:FormData){
 const db=await ceoDb();
 const name=String(form.get("name")||"").trim(),slug=String(form.get("slug")||"").toLowerCase().trim();
 const plan=String(form.get("plan_id")||""),status=String(form.get("status")||"trial");
 const {error}=await db.rpc("ceo_create_network",{p_name:name,p_slug:slug,p_plan:plan,p_status:status});
 if(error)throw new Error(error.message);
 revalidatePath("/ceo/redes");revalidatePath("/ceo");
 redirect("/ceo/redes?criada=1");
}
export async function assignNetworkOwner(form:FormData){
 const db=await ceoDb();
 const {error}=await db.rpc("ceo_set_network_owner",{p_network:String(form.get("network_id")||""),p_email:String(form.get("email")||"")});
 if(error)throw new Error(error.message);
 revalidatePath("/ceo/redes");revalidatePath("/ceo");
}
export async function addNetworkUnitAsCeo(form:FormData){
 const db=await ceoDb();
 const {error}=await db.rpc("create_network_unit",{p_network:String(form.get("network_id")||""),p_name:String(form.get("name")||"").trim(),p_slug:String(form.get("slug")||"").trim().toLowerCase()});
 if(error)throw new Error(error.message);
 revalidatePath("/ceo/redes");revalidatePath("/ceo");revalidatePath("/gestor/rede");
}
export async function updateNetworkPlan(form:FormData){
 const db=await ceoDb();
 const networkId=String(form.get("network_id")||""),planId=String(form.get("plan_id")||""),status=String(form.get("status")||"trial"),date=String(form.get("period_end")||"");
 if(!["trial","active","past_due","paused","cancelled"].includes(status))throw new Error("Status inválido");
 const [{data:plan},{count}]=await Promise.all([
  db.from("saas_plans").select("max_shops").eq("id",planId).single(),
  db.from("barbershops").select("id",{count:"exact",head:true}).eq("network_id",networkId)
 ]);
 if(!plan)throw new Error("Plano não encontrado");
 if((count||0)>plan.max_shops)throw new Error("O plano selecionado permite menos unidades do que a rede já possui.");
 const {error}=await db.from("network_subscriptions").upsert({network_id:networkId,plan_id:planId,status,current_period_end:date||null},{onConflict:"network_id"});
 if(error)throw new Error(error.message);
 revalidatePath("/ceo/redes");revalidatePath("/ceo");
}
