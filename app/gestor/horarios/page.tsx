import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import HoursPanel from "../HoursPanel";
export const dynamic="force-dynamic";
export default async function Horarios(){
 const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(admin)redirect("/ceo");
 const {data:member}=await db.from("memberships").select("shop_id").eq("user_id",user.id).in("role",["owner","manager"]).limit(1).maybeSingle();if(!member)redirect("/gestor");
 const id=member.shop_id;
 const [shop,pros,hours]=await Promise.all([db.from("barbershops").select("name").eq("id",id).single(),db.from("professionals").select("id,name").eq("shop_id",id).order("name"),db.from("working_hours").select("id,professional_id,weekday,start_local,end_local").eq("shop_id",id).order("weekday")]);
 return <HoursPanel shopId={id} shopName={shop.data?.name||"Barbearia"} pros={pros.data||[]} hours={hours.data||[]} back="/gestor"/>;
}
