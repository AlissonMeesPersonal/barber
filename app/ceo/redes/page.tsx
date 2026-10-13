import Link from "next/link";
import {redirect} from "next/navigation";
import {getServerSupabase} from "@/lib/supabase-server";
import {createNetwork,assignNetworkOwner,addNetworkUnitAsCeo,updateNetworkPlan} from "./actions";
export const dynamic="force-dynamic";
export default async function RedesCeo({searchParams}:{searchParams:Promise<{criada?:string}>}){
 const db=await getServerSupabase();if(!db)redirect("/ceo/login");
 const {data:{user}}=await db.auth.getUser();if(!user)redirect("/ceo/login");
 const {data:admin}=await db.from("platform_admins").select("user_id").eq("user_id",user.id).maybeSingle();
 if(!admin)redirect("/ceo/login?erro=permissao");
 const [nr,sr,pr,ur,dr]=await Promise.all([
  db.from("barbershop_networks").select("id,name,slug,owner_user_id,logo_url").order("name"),
  db.from("network_subscriptions").select("network_id,plan_id,status,current_period_end"),
  db.from("saas_plans").select("id,name,max_shops,price_cents,billing_period,active").order("name"),
  db.rpc("ceo_user_directory"),
  db.from("barbershops").select("id,name,slug,network_id").order("name")
 ]);
 const networks=nr.data||[],plans=pr.data||[],subs=sr.data||[],users=(ur.data||[]) as {user_id:string;email:string}[],units=dr.data||[];
 const money=(c:number)=>(c/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 return <main className="ceo-network-shell">
  <header className="ceo-network-head"><div><span className="eyebrow">BARBERFLOW · CONSOLE EXECUTIVO</span><h1>Redes de barbearias</h1><p>Uma rede reúne suas unidades, um proprietário e uma assinatura SaaS com limite contratado.</p></div><Link className="button secondary" href="/ceo">← Painel CEO</Link></header>
  {(await searchParams).criada==="1"&&<p className="network-owner-success">Rede criada. Agora você pode cadastrar as unidades e vincular o proprietário.</p>}
  <div className="ceo-network-kpis"><article><span>Redes cadastradas</span><strong>{networks.length}</strong></article><article><span>Unidades</span><strong>{units.length}</strong></article><article><span>Redes com proprietário</span><strong>{networks.filter(n=>n.owner_user_id).length}</strong></article><article><span>Contratos ativos</span><strong>{subs.filter(s=>s.status==="active").length}</strong></article></div>
  <section className="ceo-network-card"><h2>Cadastrar nova rede</h2><p>O proprietário receberá um painel independente para gerenciar a marca e suas unidades.</p><form action={createNetwork} className="ceo-network-form"><label>Nome da rede<input name="name" required minLength={2} maxLength={120} placeholder="Ex.: Barbearias Prime"/></label><label>Identificador único<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={70} placeholder="barbearias-prime"/></label><label>Plano contratado<select name="plan_id" required>{plans.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} · {p.max_shops} unidade(s) · {money(p.price_cents)}</option>)}</select></label><label>Status inicial<select name="status"><option value="trial">Em teste</option><option value="active">Ativa</option></select></label><button className="network-owner-primary" disabled={!plans.some(p=>p.active)}>Criar rede</button></form></section>
  <div className="ceo-network-list"><h2>Redes e permissões</h2>{networks.map(n=>{
   const sub=subs.find(s=>s.network_id===n.id),plan=plans.find(p=>p.id===sub?.plan_id),ownUnits=units.filter(u=>u.network_id===n.id);
   const owner=users.find(u=>u.user_id===n.owner_user_id);
   return <section className="ceo-network-card" key={n.id}><div className="ceo-network-row"><div><span className="eyebrow">REDE CADASTRADA</span><h3>{n.name}</h3><p>{n.slug} · Proprietário: {owner?.email||"Não atribuído"}</p></div><div className="ceo-network-chips"><span>{ownUnits.length}/{plan?.max_shops||0} unidades</span><span>{plan?.name||"Sem plano"}</span><span>{sub?.status||"Sem assinatura"}</span></div></div>
   <div className="ceo-network-subgrid"><div><h4>Assinatura da rede</h4><form action={updateNetworkPlan} className="ceo-network-form"><input type="hidden" name="network_id" value={n.id}/><label>Plano<select name="plan_id" defaultValue={sub?.plan_id}>{plans.map(p=><option key={p.id} value={p.id}>{p.name} · {p.max_shops} unidade(s)</option>)}</select></label><label>Status<select name="status" defaultValue={sub?.status||"trial"}><option value="trial">Teste</option><option value="active">Ativa</option><option value="past_due">Pagamento pendente</option><option value="paused">Pausada</option><option value="cancelled">Cancelada</option></select></label><label>Fim da vigência<input name="period_end" type="date" defaultValue={sub?.current_period_end||""}/></label><button>Salvar contrato</button></form></div>
   <div><h4>Proprietário da rede</h4><form action={assignNetworkOwner} className="ceo-network-form"><input type="hidden" name="network_id" value={n.id}/><label>E-mail cadastrado e confirmado<input name="email" type="email" placeholder="proprietario@exemplo.com" required defaultValue={owner?.email||""}/></label><button>Vincular proprietário</button></form><p>O proprietário precisa criar e confirmar suas próprias credenciais em <Link href="/gestor/cadastro">Cadastro do gestor</Link>.</p></div></div>
   <div className="ceo-network-units"><h4>Unidades desta rede</h4>{ownUnits.map(u=><div key={u.id} className="network-owner-unit"><div><strong>{u.name}</strong><small>{u.slug}</small></div><div className="network-unit-actions"><Link href={"/ceo/empresa/"+u.id}>Administrar</Link><Link href={"/b/"+u.slug}>Agendamento</Link></div></div>)}{!ownUnits.length&&<p>Nenhuma unidade cadastrada nesta rede.</p>}
    {sub&&plan&&ownUnits.length<plan.max_shops&&["active","trial"].includes(sub.status)&&<form action={addNetworkUnitAsCeo} className="ceo-network-form"><input type="hidden" name="network_id" value={n.id}/><label>Nova unidade<input name="name" placeholder="Nome da unidade" required minLength={2} maxLength={120}/></label><label>Identificador público<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="prime-centro"/></label><button>Adicionar unidade</button></form>}
    {plan&&ownUnits.length>=plan.max_shops&&<p>Limite de unidades atingido. Atualize o plano para expandir.</p>}
   </div></section>
  })}{!networks.length&&<p>Nenhuma rede cadastrada.</p>}</div>
 </main>;
}