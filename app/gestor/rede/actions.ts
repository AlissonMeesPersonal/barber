"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";

async function getOwnerDb(networkId:string){
 const db=await getServerSupabase();
 if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/gestor/login");
 const {data:network}=await db.from("barbershop_networks").select("id,owner_user_id").eq("id",networkId).maybeSingle();
 if(!network||network.owner_user_id!==user.id)throw new Error("Somente o proprietário da rede pode alterar esses dados.");
 return db;
}
export async function saveNetworkBranding(form:FormData){
 const id=String(form.get("network_id")||"");
 const db=await getOwnerDb(id);
 const name=String(form.get("name")||"").trim().slice(0,120);
 const validColor=(key:string)=>{
  const value=String(form.get(key)||"");
  if(!/^#[0-9A-Fa-f]{6}$/.test(value))throw new Error("Cor inválida");
  return value;
 };
 if(name.length<2)throw new Error("Informe o nome da rede.");
 const colors=[validColor("primary_color"),validColor("secondary_color"),validColor("background_color")];
 const file=form.get("logo");
 let url:string|null=null;
 if(file instanceof File&&file.size>0){
  if(file.size>2097152||!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("Logo inválida. Use PNG, JPG ou WebP com até 2 MB.");
  const ext=file.type==="image/png"?"png":file.type==="image/jpeg"?"jpg":"webp";
  const path=id+"/logo-"+crypto.randomUUID()+"."+ext;
  const {error}=await db.storage.from("barber-network-branding").upload(path,file,{contentType:file.type,upsert:false});
  if(error)throw new Error("Não foi possível enviar a logo.");
  url=db.storage.from("barber-network-branding").getPublicUrl(path).data.publicUrl;
 }
 const {error}=await db.rpc("save_network_branding",{p_network:id,p_name:name,p_primary:colors[0],p_secondary:colors[1],p_background:colors[2],p_logo:url});
 if(error)throw new Error(error.message);
 revalidatePath("/gestor/rede");
 redirect("/gestor/rede?network="+id+"&salvo=1");
}
export async function createUnit(form:FormData){
 const id=String(form.get("network_id")||"");
 const db=await getOwnerDb(id);
 const name=String(form.get("name")||"").trim().slice(0,120);
 const slug=String(form.get("slug")||"").trim().toLowerCase();
 const {data,error}=await db.rpc("create_network_unit",{p_network:id,p_name:name,p_slug:slug});
 if(error||!data)throw new Error(error?.message||"Não foi possível cadastrar a unidade.");
 revalidatePath("/gestor/rede");
 revalidatePath("/gestor");
 redirect("/gestor?shop="+data);
}
