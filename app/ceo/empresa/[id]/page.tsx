import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import PainelOperacional from "@/app/gestor/PainelOperacional";
export const dynamic="force-dynamic";
export default async function Empresa({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(!admin)redirect("/gestor");
 const [shop,services,pros,appointments,clients,cashback,referrals]=await Promise.all([
 db.from("barbershops").select("id,name,slug").eq("id",id).single(),
 db.from("services").select("id,name,price_cents,duration_minutes,active,cashback_mode,cashback_value").eq("shop_id",id).order("name"),
 db.from("professionals").select("id,name,active").eq("shop_id",id).order("name"),
 db.from("appointments").select("id,status,price_cents,starts_at,professional_id,client_id").eq("shop_id",id).order("starts_at",{ascending:false}).limit(50),
 db.from("clients").select("id,name").eq("shop_id",id).order("name"),
 db.from("cashback_transactions").select("client_id,amount_cents").eq("shop_id",id),
 db.from("referrals").select("id,referrer_client_id,status").eq("shop_id",id)
 ]);if(!shop.data)redirect("/ceo");
 return <PainelOperacional ceo shop={shop.data} services={services.data||[]} professionals={pros.data||[]} appointments={appointments.data||[]} clients={clients.data||[]} cashback={cashback.data||[]} referrals={referrals.data||[]}/>;
}
