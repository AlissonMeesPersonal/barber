"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";
export async function saveAppearance(form:FormData){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const id=String(form.get("shop_id")||"");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin){const {data:membership}=await db.from("memberships").select("id").eq("shop_id",id).eq("user_id",user.id).in("role",["owner","manager"]).maybeSingle();if(!membership)throw new Error("Acesso não autorizado.");}
 const read=(field:string,n:number)=>String(form.get(field)||"").trim().slice(0,n);
 const color=(f:string)=>{const v=read(f,7);if(!/^#[a-fA-F0-9]{6}$/.test(v))throw new Error("Cor inválida");return v;};
 const name=read("name",100),headline=read("headline",120),description=read("description",250),style=read("layout_style",20);
 if(!name||!headline||!["premium","minimal","urban"].includes(style))throw new Error("Configuração inválida");
 const fields:Record<string,string>={name,headline,description,layout_style:style,primary_color:color("primary_color"),secondary_color:color("secondary_color"),background_color:color("background_color")};
 const file=form.get("logo");
 if(file instanceof File&&file.size){if(file.size>2097152||!["image/png","image/jpeg","image/webp"].includes(file.type))throw new Error("Logo inválida (máximo 2 MB)");
 const ext=file.type==="image/png"?"png":file.type==="image/jpeg"?"jpg":"webp";
 const path=id+"/logo-"+crypto.randomUUID()+"."+ext;
 const {error}=await db.storage.from("barber-branding").upload(path,file,{contentType:file.type});if(error)throw new Error("Erro ao enviar logo");
 fields.logo_url=db.storage.from("barber-branding").getPublicUrl(path).data.publicUrl;
 }
 const {error}=await db.from("barbershops").update(fields).eq("id",id);if(error)throw new Error("Erro ao salvar identidade visual");
 const {data:shop}=await db.from("barbershops").select("slug").eq("id",id).single();
 revalidatePath("/gestor/aparencia");if(shop)revalidatePath("/b/"+shop.slug);
 redirect(admin?"/ceo/empresa/"+id+"/aparencia?salvo=1":"/gestor/aparencia?salvo=1");
}
