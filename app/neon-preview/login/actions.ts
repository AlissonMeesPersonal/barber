"use server";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/neon-auth-server";

export async function neonPreviewSignIn(formData: FormData) {
  if (process.env.VERCEL_ENV !== "preview") redirect("/");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/neon-preview/login?erro=credenciais");
  const { error } = await neonAuth.signIn.email({ email, password });
  if (error) redirect("/neon-preview/login?erro=login");
  redirect("/neon-preview/sessao");
}
