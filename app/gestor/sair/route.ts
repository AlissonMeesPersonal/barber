import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase-server";
export async function POST(request:Request){
 const db=await getServerSupabase();
 if(db) await db.auth.signOut();
 return NextResponse.redirect(new URL("/gestor/login",request.url),303);
}
