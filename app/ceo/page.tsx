import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import CeoConsole from "./CeoConsole";
export const dynamic="force-dynamic";
export default async function Ceo({searchParams}:{searchParams:Promise<{aba?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/ceo/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/ceo/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(!admin)redirect("/ceo/login?erro=permissao");
 const [shops,plans,subscriptions,users,members]=await Promise.all([
  db.from("barbershops").select("id,name,slug,active").order("name"),
  db.from("saas_plans").select("id,name,price_cents,billing_period,max_shops").order("name"),
  db.from("saas_subscriptions").select("id,shop_id,plan_id,status,current_period_end"),
  db.rpc("ceo_user_directory"),
  db.from("memberships").select("shop_id,user_id,role")
 ]);
 const tab=(await searchParams).aba||"overview";
 return <CeoConsole tab={tab} shops={shops.data||[]} plans={plans.data||[]} subscriptions={subscriptions.data||[]} users={users.data||[]} members={members.data||[]}/>;
}