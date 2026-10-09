import type { Metadata } from "next";
import "./globals.css";
import "./editor.css";
export const metadata: Metadata = { title: "BarberFlow | Gestão inteligente", description: "Agendamentos e gestão para barbearias" };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="pt-BR"><body>{children}</body></html>; }
