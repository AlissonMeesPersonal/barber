"use server";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";
async function admin(){const db=await getServerSupabase();if(!db)throw Error("Sessão ausente");const {data:{user}}=await db.auth.getUser();if(!user)throw Error("Entre novamente");const {data:a}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(!a)throw Error("Acesso negado");return db;}
export async function createPlan(f:FormData){const db=await admin();const name=String(f.get("name")||"").trim(),price=Number(f.get("price")),period=String(f.get("period"));if(!name||!Number.isFinite(price)||price<0||!["monthly","quarterly","yearly"].includes(period))throw Error("Dados inválidos");const {error}=await db.from("saas_plans").insert({name,price_cents:Math.round(price*100),billing_period:period,max_shops:Number(f.get("max_shops")||1)});if(error)throw Error(error.message);revalidatePath("/ceo");}
export async function saveSubscription(f:FormData){
 const db=await admin();
 const shopId=String(f.get("shop_id")||""),planId=String(f.get("plan_id")||"");
 const status=String(f.get("status")||"trial"),periodEnd=String(f.get("end")||"");
 if(!["trial","active","past_due","paused","cancelled"].includes(status))throw Error("Status inválido");
 const {data:shop,error:shopError}=await db.from("barbershops").select("network_id").eq("id",shopId).single();
 if(shopError||!shop)throw Error("Barbearia não encontrada");
 if(shop.network_id){
  const {error}=await db.rpc("ceo_save_network_contract",{p_network:shop.network_id,p_plan:planId,p_status:status,p_period_end:periodEnd||null});
  if(error)throw Error(error.message);
 }else{
  const {error}=await db.from("saas_subscriptions").upsert({shop_id:shopId,plan_id:planId,status,current_period_end:periodEnd||null},{onConflict:"shop_id"});
  if(error)throw Error(error.message);
 }
 revalidatePath("/ceo");revalidatePath("/ceo/redes");revalidatePath("/gestor/rede");
}
export async function assignManager(f:FormData){const db=await admin();const {error}=await db.rpc("ceo_assign_manager",{target_email:String(f.get("email")),target_shop:String(f.get("shop_id")),target_role:String(f.get("role"))});if(error)throw Error(error.message);revalidatePath("/ceo");}
export async function toggleShop(f:FormData){const db=await admin();const {error}=await db.from("barbershops").update({active:String(f.get("active"))==="true"}).eq("id",String(f.get("shop_id")));if(error)throw Error(error.message);revalidatePath("/ceo");}