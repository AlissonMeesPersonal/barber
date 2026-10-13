import {redirect} from "next/navigation";
import Link from "next/link";
import {getServerSupabase} from "@/lib/supabase-server";
import PainelOperacional from "./PainelOperacional";
export const dynamic="force-dynamic";
export default async function Gestor({searchParams}:{searchParams:Promise<{shop?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("role").eq("user_id",user.id).maybeSingle();if(admin)redirect("/gestor/login?erro=ceo");
 const {data:members}=await db.from("memberships").select("shop_id,role").eq("user_id",user.id).in("role",["owner","manager"]);
 if(!members?.length)return <main className="auth-shell"><section className="auth-card"><h1>Acesso restrito</h1><p>Esta conta ainda não foi vinculada à gestão de uma barbearia.</p><Link href="/" className="button secondary">Voltar</Link></section></main>;
 const requested=(await searchParams).shop;
 const id=members.find(m=>m.shop_id===requested)?.shop_id||members[0].shop_id;
 const {data:availableShops}=await db.from("barbershops").select("id,name").in("id",members.map(m=>m.shop_id)).order("name");
 const [shop,services,pros,appointments,clients,cashback,referrals,subscription]=await Promise.all([
 db.from("barbershops").select("id,name,slug").eq("id",id).single(),
 db.from("services").select("id,name,price_cents,duration_minutes,active,cashback_mode,cashback_value").eq("shop_id",id).order("name"),
 db.from("professionals").select("id,name,active").eq("shop_id",id).order("name"),
 db.from("appointments").select("id,status,price_cents,starts_at,professional_id,client_id").eq("shop_id",id).order("starts_at",{ascending:false}).limit(50),
 db.from("clients").select("id,name").eq("shop_id",id).order("name"),
 db.from("cashback_transactions").select("client_id,amount_cents").eq("shop_id",id),
 db.from("referrals").select("id,referrer_client_id,status").eq("shop_id",id),
 db.from("saas_subscriptions").select("plan_id,status,current_period_end").eq("shop_id",id).maybeSingle()
 ]);
 const {data:plan}=subscription.data?.plan_id?await db.from("saas_plans").select("name,max_shops,billing_period,price_cents").eq("id",subscription.data.plan_id).maybeSingle():{data:null};
 if(!shop.data)return <main className="auth-shell"><p>Barbearia indisponível.</p></main>;
 return <><div className="manager-account-toolbar"><div><span>SESSÃO DO GESTOR</span><strong>{user.email}</strong><small>Acesso individual · {members.length} unidade(s) autorizada(s)</small></div><form action="/gestor/sair" method="post"><button className="button secondary">Sair da conta</button></form></div><div className="tenant-switcher"><form method="get" action="/gestor"><label htmlFor="shop-switch">Unidade em gestão</label><select id="shop-switch" name="shop" defaultValue={id}>{availableShops?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button className="button secondary" type="submit">Trocar unidade</button></form><span>{members.length} unidade(s) autorizada(s)</span></div><div className="manager-plan-bar"><div><span>ASSINATURA DA UNIDADE</span><strong>{plan?.name||"Sem plano atribuído"}</strong><small>{subscription.data?.status==="active"?"Ativa":subscription.data?.status==="trial"?"Em teste":subscription.data?.status==="past_due"?"Pagamento pendente":subscription.data?.status==="paused"?"Pausada":subscription.data?.status==="cancelled"?"Cancelada":"Sem assinatura"} · {subscription.data?.current_period_end?"Vigência até "+new Date(subscription.data.current_period_end+"T12:00:00").toLocaleDateString("pt-BR"):"Sem vencimento cadastrado"}</small></div><div className="manager-plan-capacity"><strong>{members.length} unidade(s) vinculada(s)</strong><small>{plan?"Limite informado pelo plano desta unidade: "+plan.max_shops:"Consulte a administração BarberFlow"} </small><small>Limites comerciais dependem da configuração da assinatura por rede</small></div></div><PainelOperacional shop={shop.data} services={services.data||[]} professionals={pros.data||[]} appointments={appointments.data||[]} clients={clients.data||[]} cashback={cashback.data||[]} referrals={referrals.data||[]}/></>;
}
