"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";

export async function saveAppearance(form:FormData){
 const db=await getServerSupabase();
 if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/gestor/login");
 const shopId=String(form.get("shop_id")||"");
 const {data:membership}=await db.from("memberships").select("id").eq("shop_id",shopId).eq("user_id",user.id).in("role",["owner","manager"]).maybeSingle();
 if(!membership)throw new Error("Sem permissão para editar esta barbearia.");
 const value=(key:string,max:number)=>String(form.get(key)||"").trim().slice(0,max);
 const validColor=(key:string)=>{const v=value(key,7);if(!/^#[0-9a-fA-F]{6}$/.test(v))throw new Error("Cor inválida.");return v;};
 const name=value("name",100),headline=value("headline",120),description=value("description",250),style=value("layout_style",20);
 if(!name||!headline||!["premium","minimal","urban"].includes(style))throw new Error("Configuração inválida.");
 const fields:Record<string,string>={name,headline,description,layout_style:style,primary_color:validColor("primary_color"),secondary_color:validColor("secondary_color"),background_color:validColor("background_color")};
 const file=form.get("logo");
 if(file instanceof File&&file.size>0){
  if(file.size>2_097_152||!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("Logo inválida. Utilize PNG, JPG ou WebP com até 2 MB.");
  const suffix=file.type==="image/png"?"png":file.type==="image/jpeg"?"jpg":"webp";
  const filename=`${shopId}/logo-${crypto.randomUUID()}.${suffix}`;
  const uploaded=await db.storage.from("barber-branding").upload(filename,file,{upsert:false,contentType:file.type});
  if(uploaded.error)throw new Error("Não foi possível enviar a logo.");
  fields.logo_url=db.storage.from("barber-branding").getPublicUrl(filename).data.publicUrl;
 }
 const {error}=await db.from("barbershops").update(fields).eq("id",shopId);
 if(error)throw new Error("Não foi possível salvar as alterações.");
 const {data:shop}=await db.from("barbershops").select("slug").eq("id",shopId).single();
 revalidatePath("/gestor/aparencia");
 if(shop?.slug)revalidatePath("/b/"+shop.slug);
 redirect("/gestor/aparencia?salvo=1");
}
