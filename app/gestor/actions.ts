"use server";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";
async function authorized(shopId:string){
 const db=await getServerSupabase();if(!db)throw new Error("Sessão indisponível");
 const {data:{user}}=await db.auth.getUser();if(!user)throw new Error("Entre novamente");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin){const {data:member}=await db.from("memberships").select("id").eq("user_id",user.id).eq("shop_id",shopId).in("role",["owner","manager"]).maybeSingle();if(!member)throw new Error("Acesso não autorizado");}
 return db;
}
export async function addService(form:FormData){
 const shopId=String(form.get("shop_id")||"");const db=await authorized(shopId);
 const name=String(form.get("name")||"").trim().slice(0,100),price=Number(form.get("price")),duration=Number(form.get("duration"));
 if(!name||!Number.isFinite(price)||price<0||!Number.isInteger(duration)||duration<5||duration>480)throw new Error("Dados inválidos");
 const {error}=await db.from("services").insert({shop_id:shopId,name,price_cents:Math.round(price*100),duration_minutes:duration});
 if(error)throw new Error("Erro ao cadastrar serviço");revalidatePath("/gestor");revalidatePath("/ceo");
}
export async function addProfessional(form:FormData){
 const shopId=String(form.get("shop_id")||"");const db=await authorized(shopId);
 const name=String(form.get("name")||"").trim().slice(0,100);
 if(name.length<2)throw new Error("Nome inválido");
 const {error}=await db.from("professionals").insert({shop_id:shopId,name});
 if(error)throw new Error("Erro ao cadastrar barbeiro");revalidatePath("/gestor");revalidatePath("/ceo");
}
export async function setServiceStatus(form:FormData){
 const shopId=String(form.get("shop_id")||"");const db=await authorized(shopId);
 const {error}=await db.from("services").update({active:String(form.get("active"))==="true"}).eq("shop_id",shopId).eq("id",String(form.get("id")));
 if(error)throw new Error("Erro ao atualizar serviço");revalidatePath("/gestor");
}
export async function setProfessionalStatus(form:FormData){
 const shopId=String(form.get("shop_id")||"");const db=await authorized(shopId);
 const {error}=await db.from("professionals").update({active:String(form.get("active"))==="true"}).eq("shop_id",shopId).eq("id",String(form.get("id")));
 if(error)throw new Error("Erro ao atualizar barbeiro");revalidatePath("/gestor");
}
export async function assignService(form:FormData){
 const shopId=String(form.get("shop_id")||"");const db=await authorized(shopId);
 const {error}=await db.from("professional_services").upsert({shop_id:shopId,professional_id:String(form.get("professional_id")),service_id:String(form.get("service_id"))},{onConflict:"professional_id,service_id"});
 if(error)throw new Error("Erro ao vincular serviço");revalidatePath("/gestor");
}

export async function addWorkingHours(form:FormData){
 const id=String(form.get("shop_id")||"");
 const db=await authorized(id);
 const professional_id=String(form.get("professional_id")||"");
 const weekday=Number(form.get("weekday"));
 const start_local=String(form.get("start_local")||"");
 const end_local=String(form.get("end_local")||"");
 if(!Number.isInteger(weekday)||weekday<0||weekday>6||!/^\d{2}:\d{2}$/.test(start_local)||!/^\d{2}:\d{2}$/.test(end_local)||end_local<=start_local)throw new Error("Horário inválido");
 const {error}=await db.from("working_hours").insert({shop_id:id,professional_id,weekday,start_local,end_local});
 if(error)throw new Error("Não foi possível salvar expediente.");
 revalidatePath("/gestor/horarios");
}
export async function removeWorkingHours(form:FormData){
 const id=String(form.get("shop_id")||"");
 const db=await authorized(id);
 const {error}=await db.from("working_hours").delete().eq("shop_id",id).eq("id",String(form.get("hour_id")||""));
 if(error)throw new Error("Não foi possível remover expediente.");
 revalidatePath("/gestor/horarios");
}
