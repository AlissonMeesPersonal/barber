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
export type OwnerAssignmentState={kind:"idle"|"linked"|"pending"|"error";message:string};
export async function assignNetworkOwner(_previous:OwnerAssignmentState,form:FormData):Promise<OwnerAssignmentState>{
 const db=await ceoDb();
 const networkId=String(form.get("network_id")||"");
 const email=String(form.get("email")||"").trim().toLowerCase();
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)||email.length>254)
  return {kind:"error",message:"Informe um e-mail válido para o proprietário."};
 const {data,error}=await db.rpc("ceo_invite_network_owner",{p_network:networkId,p_email:email});
 if(error){
  const detail=error.message||"";
  if(detail.includes("CEO"))return {kind:"error",message:"A conta administrativa do BarberFlow não pode ser proprietária de uma rede. Use o e-mail exclusivo do proprietário."};
  if(detail.includes("Rede não encontrada"))return {kind:"error",message:"Rede não encontrada. Atualize a página e tente novamente."};
  if(detail.includes("E-mail inválido"))return {kind:"error",message:"Verifique o e-mail informado."};
  return {kind:"error",message:"Não foi possível registrar o acesso. Tente novamente ou consulte o suporte."};
 }
 revalidatePath("/ceo/redes");revalidatePath("/ceo");
 if(data==="linked")return {kind:"linked",message:"Proprietário vinculado com sucesso. Ele já pode acessar a rede com suas credenciais."};
 return {kind:"pending",message:"Convite registrado. Compartilhe o link de cadastro com o proprietário. Após criar e confirmar seu e-mail, a rede será vinculada automaticamente no primeiro login."};
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
 const {error}=await db.rpc("ceo_save_network_contract",{p_network:networkId,p_plan:planId,p_status:status,p_period_end:date||null});
 if(error)throw new Error(error.message);
 revalidatePath("/ceo/redes");revalidatePath("/ceo");
}
