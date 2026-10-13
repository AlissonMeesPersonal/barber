import {redirect} from "next/navigation";
import Link from "next/link";
import {getServerSupabase} from "@/lib/supabase-server";
import RedePanel from "./RedePanel";
export const dynamic="force-dynamic";
export default async function MinhaRede({searchParams}:{searchParams:Promise<{network?:string;salvo?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:ceo}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(ceo)redirect("/ceo");
 const {data:networks,error}=await db.from("barbershop_networks").select("id,name,slug,owner_user_id,logo_url,primary_color,secondary_color,background_color").eq("owner_user_id",user.id).order("name");
 if(error)return <main className="network-owner-shell"><h1>Não foi possível carregar suas redes.</h1><Link href="/gestor">Voltar</Link></main>;
 if(!networks?.length)return <main className="network-owner-shell"><div className="network-empty"><h1>Minha rede</h1><p>Seu acesso de gestor está ativo, mas você ainda não foi designado como proprietário de uma rede. Solicite a vinculação ao administrador BarberFlow.</p><Link className="button secondary" href="/gestor">Voltar ao painel</Link></div></main>;
 const params=await searchParams;
 const network=networks.find(n=>n.id===params.network)||networks[0];
 const [unitsResult,subscriptionResult]=await Promise.all([
  db.from("barbershops").select("id,name,slug,active,logo_url").eq("network_id",network.id).order("name"),
  db.from("network_subscriptions").select("plan_id,status,current_period_end").eq("network_id",network.id).maybeSingle()
 ]);
 const {data:plan}=subscriptionResult.data?.plan_id?await db.from("saas_plans").select("name,max_shops,billing_period,price_cents").eq("id",subscriptionResult.data.plan_id).maybeSingle():{data:null};
 return <RedePanel network={network} networks={networks.map(n=>({id:n.id,name:n.name}))} units={unitsResult.data||[]} subscription={subscriptionResult.data||null} plan={plan||null} saved={params.salvo==="1"}/>;
}
