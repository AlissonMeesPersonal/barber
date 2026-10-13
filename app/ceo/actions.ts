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
export type ManagerInvitationState={status:"idle"|"linked"|"pending"|"error";message:string};
export async function assignManager(_previous:ManagerInvitationState,f:FormData):Promise<ManagerInvitationState>{
 const db=await admin();
 const email=String(f.get("email")||"").trim().toLowerCase();
 const shop=String(f.get("shop_id")||"");
 const role=String(f.get("role")||"manager");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)
  return {status:"error",message:"Informe um endereço de e-mail válido."};
 if(!["manager","owner"].includes(role)||!shop)
  return {status:"error",message:"Selecione uma barbearia e um perfil válido."};
 const {data,error}=await db.rpc("ceo_invite_shop_access",{p_email:email,p_shop:shop,p_role:role});
 if(error){
  if(error.message?.includes("CEO"))return {status:"error",message:"Use uma conta diferente do CEO para administrar esta barbearia."};
  if(error.message?.includes("Barbearia"))return {status:"error",message:"Barbearia não encontrada. Atualize a página."};
  return {status:"error",message:"Não foi possível registrar o acesso. Confira os dados e tente novamente."};
 }
 revalidatePath("/ceo");revalidatePath("/gestor");
 if(data==="linked")return {status:"linked",message:"Acesso autorizado. O usuário já pode entrar com suas credenciais."};
 return {status:"pending",message:"Convite pendente registrado. Compartilhe o link de cadastro. O acesso será liberado no primeiro login após a confirmação do e-mail."};
}
export async function toggleShop(f:FormData){const db=await admin();const {error}=await db.from("barbershops").update({active:String(f.get("active"))==="true"}).eq("id",String(f.get("shop_id")));if(error)throw Error(error.message);revalidatePath("/ceo");}