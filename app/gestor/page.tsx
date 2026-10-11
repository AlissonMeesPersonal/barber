import {redirect} from "next/navigation";
import Link from "next/link";
import {getServerSupabase} from "@/lib/supabase-server";
import PainelOperacional from "./PainelOperacional";
export const dynamic="force-dynamic";
export default async function Gestor({searchParams}:{searchParams:Promise<{shop?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("role").eq("user_id",user.id).maybeSingle();if(admin)redirect("/ceo");
 const {data:members}=await db.from("memberships").select("shop_id,role").eq("user_id",user.id).in("role",["owner","manager"]);
 if(!members?.length)return <main className="auth-shell"><section className="auth-card"><h1>Acesso restrito</h1><p>Esta conta ainda não foi vinculada à gestão de uma barbearia.</p><Link href="/" className="button secondary">Voltar</Link></section></main>;
 const requested=(await searchParams).shop;
 const id=members.find(m=>m.shop_id===requested)?.shop_id||members[0].shop_id;
 const {data:availableShops}=await db.from("barbershops").select("id,name").in("id",members.map(m=>m.shop_id)).order("name");
 const [shop,services,pros,appointments,clients,cashback,referrals]=await Promise.all([
 db.from("barbershops").select("id,name,slug").eq("id",id).single(),
 db.from("services").select("id,name,price_cents,duration_minutes,active,cashback_mode,cashback_value").eq("shop_id",id).order("name"),
 db.from("professionals").select("id,name,active").eq("shop_id",id).order("name"),
 db.from("appointments").select("id,status,price_cents,starts_at,professional_id,client_id").eq("shop_id",id).order("starts_at",{ascending:false}).limit(50),
 db.from("clients").select("id,name").eq("shop_id",id).order("name"),
 db.from("cashback_transactions").select("client_id,amount_cents").eq("shop_id",id),
 db.from("referrals").select("id,referrer_client_id,status").eq("shop_id",id)
 ]);
 if(!shop.data)return <main className="auth-shell"><p>Barbearia indisponível.</p></main>;
 return <><div className="tenant-switcher"><form method="get" action="/gestor"><label htmlFor="shop-switch">Unidade em gestão</label><select id="shop-switch" name="shop" defaultValue={id}>{availableShops?.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><button className="button secondary" type="submit">Trocar unidade</button></form><span>{members.length} unidade(s) autorizada(s)</span></div><PainelOperacional shop={shop.data} services={services.data||[]} professionals={pros.data||[]} appointments={appointments.data||[]} clients={clients.data||[]} cashback={cashback.data||[]} referrals={referrals.data||[]}/></>;
}
