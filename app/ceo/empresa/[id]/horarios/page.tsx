import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import HoursPanel from "@/app/gestor/HoursPanel";
export const dynamic="force-dynamic";
export default async function HorariosCEO({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const db=await getServerSupabase();if(!db)redirect("/gestor/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/gestor/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();if(!admin)redirect("/gestor");
 const [shop,pros,hours]=await Promise.all([db.from("barbershops").select("name").eq("id",id).single(),db.from("professionals").select("id,name").eq("shop_id",id).order("name"),db.from("working_hours").select("id,professional_id,weekday,start_local,end_local").eq("shop_id",id).order("weekday")]);
 if(!shop.data)redirect("/ceo");
 return <HoursPanel shopId={id} shopName={shop.data.name} pros={pros.data||[]} hours={hours.data||[]} back={"/ceo/empresa/"+id}/>;
}
