"use server";
import {revalidatePath} from "next/cache";
import {getServerSupabase} from "@/lib/supabase-server";

export type CompanyActionResult={status:"idle"|"success"|"error";message:string};
const fail=(message:string):CompanyActionResult=>({status:"error",message});
const ok=(message:string):CompanyActionResult=>({status:"success",message});
async function getCeoDb(){
 const db=await getServerSupabase();
 if(!db)throw new Error("Sessão indisponível.");
 const {data:{user}}=await db.auth.getUser();
 if(!user)throw new Error("Entre novamente.");
 const {data:ceo}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!ceo)throw new Error("Acesso exclusivo do CEO.");
 return db;
}
function slug(value:FormDataEntryValue|null){
 const v=String(value||"").trim().toLowerCase();
 return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)&&v.length<=80?v:null;
}
function name(value:FormDataEntryValue|null){
 const v=String(value||"").trim();
 return v.length>=2&&v.length<=120?v:null;
}
function safeError(error:{code?:string;message?:string}|null,defaultMessage:string){
 if(error?.code==="23505"||error?.message?.includes("duplicate key"))return "Esse identificador já está em uso. Escolha outro endereço público.";
 if(error?.message?.includes("Limite de unidades"))return "O plano atingiu o limite de unidades. Altere o plano antes de adicionar outra.";
 if(error?.message?.includes("assinatura")||error?.message?.includes("Assinatura"))return "A assinatura da rede não permite criar unidades. Verifique o plano e o status.";
 if(error?.message?.includes("Plano inválido"))return "Selecione um plano ativo válido.";
 return defaultMessage;
}
export async function registerBarbershopNetwork(_previous:CompanyActionResult,form:FormData):Promise<CompanyActionResult>{
 const db=await getCeoDb();
 const networkName=name(form.get("network_name"));
 const networkSlug=slug(form.get("network_slug"));
 const unitName=name(form.get("unit_name"));
 const unitSlug=slug(form.get("unit_slug"));
 const planId=String(form.get("plan_id")||"");
 const status=String(form.get("status")||"trial");
 if(!networkName||!networkSlug||!unitName||!unitSlug||!planId||!["trial","active"].includes(status))return fail("Confira os nomes, identificadores e plano antes de salvar.");
 if(networkSlug===unitSlug)return fail("A rede e a unidade precisam de endereços públicos diferentes.");
 const {error}=await db.rpc("ceo_create_network_with_unit",{p_name:networkName,p_slug:networkSlug,p_plan:planId,p_status:status,p_unit_name:unitName,p_unit_slug:unitSlug});
 if(error)return fail(safeError(error,"Não foi possível cadastrar a rede com sua primeira unidade."));
 revalidatePath("/ceo");revalidatePath("/ceo/redes");revalidatePath("/gestor/rede");
 return ok("Rede e primeira barbearia criadas com o template padrão. Agora você pode vincular o proprietário e personalizar a unidade.");
}
export async function registerAdditionalUnit(_previous:CompanyActionResult,form:FormData):Promise<CompanyActionResult>{
 const db=await getCeoDb();
 const networkId=String(form.get("network_id")||"");
 const unitName=name(form.get("unit_name"));
 const unitSlug=slug(form.get("unit_slug"));
 if(!networkId||!unitName||!unitSlug)return fail("Preencha o nome e o identificador da nova unidade.");
 const {error}=await db.rpc("create_network_unit",{p_network:networkId,p_name:unitName,p_slug:unitSlug});
 if(error)return fail(safeError(error,"Não foi possível criar a unidade."));
 revalidatePath("/ceo");revalidatePath("/ceo/redes");revalidatePath("/gestor");revalidatePath("/gestor/rede");
 return ok("Unidade criada com a identidade padrão da rede e já disponível para configuração.");
}
export async function changeNetworkSubscription(_previous:CompanyActionResult,form:FormData):Promise<CompanyActionResult>{
 const db=await getCeoDb();
 const networkId=String(form.get("network_id")||"");
 const planId=String(form.get("plan_id")||"");
 const status=String(form.get("status")||"");
 const end=String(form.get("period_end")||"");
 if(!networkId||!planId||!["trial","active","past_due","paused","cancelled"].includes(status))return fail("Confira o plano e o status.");
 if(end&&!/^\d{4}-\d{2}-\d{2}$/.test(end))return fail("Data de vencimento inválida.");
 const {error}=await db.rpc("ceo_save_network_contract",{p_network:networkId,p_plan:planId,p_status:status,p_period_end:end||null});
 if(error)return fail(safeError(error,"Não foi possível atualizar a assinatura da rede."));
 revalidatePath("/ceo");revalidatePath("/ceo/redes");revalidatePath("/gestor/rede");
 return ok("Plano e assinatura da rede atualizados.");
}
