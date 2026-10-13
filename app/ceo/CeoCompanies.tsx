"use client";
import {useActionState,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {Building2,Plus,Settings2,Users,ArrowUpRight,Search} from "lucide-react";
import {registerBarbershopNetwork,registerAdditionalUnit,changeNetworkSubscription,type CompanyActionResult} from "./CompanyManagementActions";
import {toggleShop} from "./actions";
import OwnerLinkForm from "./redes/OwnerLinkForm";

type Shop={id:string;name:string;slug:string;active:boolean;network_id:string|null};
type Plan={id:string;name:string;price_cents:number;billing_period:string;max_shops:number;active?:boolean};
type Network={id:string;name:string;slug:string;owner_user_id:string|null};
type Sub={network_id:string;plan_id:string;status:string;current_period_end:string|null};
type User={user_id:string;email:string};
type Invitation={network_id:string;email:string};
const initial:CompanyActionResult={status:"idle",message:""};
const cleanSlug=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,75);
const formatMoney=(c:number)=>(c/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function Feedback({state}:{state:CompanyActionResult}){
 return state.message?<p className={"ceo-company-feedback "+(state.status==="success"?"success":"error")} role="status">{state.message}</p>:null;
}
function FirstUnitForm({plans}:{plans:Plan[]}){
 const router=useRouter();
 const [open,setOpen]=useState(false);
 const [name,setName]=useState("");
 const [networkSlug,setNetworkSlug]=useState("");
 const [unitName,setUnitName]=useState("");
 const [unitSlug,setUnitSlug]=useState("");
 const [state,submit,pending]=useActionState(registerBarbershopNetwork,initial);
 useEffect(()=>{if(state.status==="success"){setOpen(false);router.refresh()}},[state,router]);
 return <section className="ceo-company-create">
  <div className="ceo-company-create-title"><div><span className="eyebrow">NOVA EMPRESA</span><h2>Cadastrar rede ou barbearia</h2><p>Crie uma rede com sua primeira unidade. O sistema aplica o template preto, branco e cinza, já respeitando o plano escolhido.</p></div><button className="ceo-company-primary" type="button" onClick={()=>setOpen(v=>!v)}><Plus size={17}/>{open?"Fechar cadastro":"Nova barbearia"}</button></div>
  {state.status==="success"&&!open&&<Feedback state={state}/>}
  {open&&<form className="ceo-company-form" action={submit}>
   <label>Nome da rede<input name="network_name" required minLength={2} maxLength={120} placeholder="Ex.: Rede Barbearia Prime" value={name} onChange={e=>{const v=e.target.value;setName(v);if(!networkSlug||networkSlug===cleanSlug(name))setNetworkSlug(cleanSlug(v))}}/></label>
   <label>Identificador da rede<input name="network_slug" value={networkSlug} onChange={e=>setNetworkSlug(e.target.value.toLowerCase())} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={70} required/></label>
   <label>Nome da primeira unidade<input name="unit_name" required minLength={2} maxLength={120} placeholder="Ex.: Barbearia Prime Centro" value={unitName} onChange={e=>{const v=e.target.value;setUnitName(v);if(!unitSlug||unitSlug===cleanSlug(unitName))setUnitSlug(cleanSlug(v))}}/></label>
   <label>Endereço público da unidade<input name="unit_slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} value={unitSlug} onChange={e=>setUnitSlug(e.target.value.toLowerCase())} placeholder="prime-centro"/></label>
   <label>Plano da rede<select name="plan_id" required>{plans.filter(p=>p.active!==false).map(p=><option key={p.id} value={p.id}>{p.name} · até {p.max_shops} unidade(s) · {formatMoney(p.price_cents)}</option>)}</select></label>
   <label>Situação inicial<select name="status"><option value="trial">Teste (sem cobrança automática)</option><option value="active">Ativa (controle manual)</option></select></label>
   <div className="ceo-company-form-footer"><span>Criação única: rede + primeira unidade. Não serão criadas duas empresas se houver erro.</span><button className="ceo-company-primary" disabled={pending||!plans.length}>{pending?"Cadastrando...":"Criar barbearia e rede"}</button></div>
   <Feedback state={state}/>
  </form>}
 </section>;
}
function AddUnit({networkId,remaining}:{networkId:string;remaining:number}){
 const router=useRouter();
 const [show,setShow]=useState(false);
 const [name,setName]=useState("");
 const [slug,setSlug]=useState("");
 const [result,submit,pending]=useActionState(registerAdditionalUnit,initial);
 useEffect(()=>{if(result.status==="success"){setShow(false);router.refresh()}},[result,router]);
 return <div className="ceo-unit-create">
  {remaining>0&&<button type="button" className="ceo-company-secondary" onClick={()=>setShow(v=>!v)}><Plus size={16}/>{show?"Cancelar":"Adicionar unidade"}</button>}
  {result.status==="success"&&!show&&<Feedback state={result}/>}
  {show&&<form className="ceo-company-form ceo-add-unit-form" action={submit}><input type="hidden" name="network_id" value={networkId}/>
   <label>Nome da unidade<input name="unit_name" value={name} onChange={e=>{const v=e.target.value;setName(v);if(!slug||slug===cleanSlug(name))setSlug(cleanSlug(v))}} minLength={2} required placeholder="Ex.: Unidade Shopping"/></label>
   <label>Endereço público<input name="unit_slug" value={slug} onChange={e=>setSlug(e.target.value.toLowerCase())} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} required/></label>
   <button className="ceo-company-primary" disabled={pending}>{pending?"Salvando...":"Criar com template padrão"}</button><Feedback state={result}/>
  </form>}
 </div>;
}
function ContractForm({networkId,sub,plans}:{networkId:string;sub:Sub|undefined;plans:Plan[]}){
 const router=useRouter();
 const [result,submit,pending]=useActionState(changeNetworkSubscription,initial);
 useEffect(()=>{if(result.status==="success")router.refresh()},[result,router]);
 return <form action={submit} className="ceo-company-form ceo-contract-form"><input type="hidden" name="network_id" value={networkId}/>
  <label>Plano<select name="plan_id" defaultValue={sub?.plan_id}>{plans.map(p=><option key={p.id} value={p.id}>{p.name} · {p.max_shops} unidade(s)</option>)}</select></label>
  <label>Status<select name="status" defaultValue={sub?.status||"trial"}><option value="trial">Teste</option><option value="active">Ativa</option><option value="past_due">Pendente</option><option value="paused">Pausada</option><option value="cancelled">Cancelada</option></select></label>
  <label>Vigência até<input name="period_end" type="date" defaultValue={sub?.current_period_end||""}/></label>
  <button className="ceo-company-secondary" disabled={pending||!plans.length}>{pending?"Salvando...":"Salvar assinatura"}</button><Feedback state={result}/>
 </form>;
}
export default function CeoCompanies({shops,plans,networks,subscriptions,users,invitations,members,search,statusFilter,setSearch,setStatusFilter}:{shops:Shop[];plans:Plan[];networks:Network[];subscriptions:Sub[];users:User[];invitations:Invitation[];members:{shop_id:string}[];search:string;statusFilter:string;setSearch:(v:string)=>void;setStatusFilter:(v:string)=>void}){
 const [expanded,setExpanded]=useState<string|null>(null);
 const [selectedFilter,setSelectedFilter]=useState<"all"|"networks">("all");
 const filtered=shops.filter(s=>(s.name.toLowerCase().includes(search.toLowerCase())||networks.some(n=>n.id===s.network_id&&n.name.toLowerCase().includes(search.toLowerCase())))&&(statusFilter==="all"||statusFilter==="active"&&s.active||statusFilter==="suspended"&&!s.active));
 return <div className="ceo-company-dashboard">
  <div className="ceo-company-metrics"><article><span>Redes</span><strong>{networks.length}</strong></article><article><span>Unidades cadastradas</span><strong>{shops.length}</strong></article><article><span>Unidades ativas</span><strong>{shops.filter(s=>s.active).length}</strong></article><article><span>Redes com proprietário</span><strong>{networks.filter(n=>n.owner_user_id).length}</strong></article></div>
  <FirstUnitForm plans={plans}/>
  <section className="ceo-panel ceo-company-section"><div className="ceo-company-section-title"><div><h2>Redes e unidades cadastradas</h2><p>Gerencie redes, seus proprietários, planos, unidades e links de agendamento no mesmo painel.</p></div></div>
   <div className="ceo-filters"><Search size={16}/><input aria-label="Buscar barbearia" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar barbearia ou rede..."/><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filtrar unidades"><option value="all">Todas</option><option value="active">Ativas</option><option value="suspended">Suspensas</option></select></div>
   {networks.filter(n=>!search||n.name.toLowerCase().includes(search.toLowerCase())||shops.some(s=>s.network_id===n.id&&s.name.toLowerCase().includes(search.toLowerCase()))).map(network=>{
    const units=shops.filter(s=>s.network_id===network.id&&(statusFilter==="all"||statusFilter==="active"&&s.active||statusFilter==="suspended"&&!s.active));
    const sub=subscriptions.find(x=>x.network_id===network.id);
    const plan=plans.find(p=>p.id===sub?.plan_id);
    const total=shops.filter(s=>s.network_id===network.id).length;
    const remaining=Math.max(0,(plan?.max_shops||0)-total);
    const canCreate=!!sub&&["trial","active"].includes(sub.status)&&remaining>0;
    const owner=users.find(u=>u.user_id===network.owner_user_id);
    const invitation=invitations.find(i=>i.network_id===network.id);
    return <div key={network.id} className="ceo-company-network"><div className="ceo-company-network-head"><div><span className="eyebrow">REDE / EMPRESA</span><h3>{network.name}</h3><p>{owner?.email||invitation?.email||"Proprietário ainda não vinculado"}</p></div><div className="ceo-company-network-actions"><span className="ceo-company-pill">{total}/{plan?.max_shops||"—"} unidades</span><span className="ceo-company-pill">{plan?.name||"Sem plano"} · {sub?.status||"Sem contrato"}</span><button type="button" className="ceo-company-secondary" onClick={()=>setExpanded(v=>v===network.id?null:network.id)}><Settings2 size={16}/>{expanded===network.id?"Fechar configurações":"Configurar rede"}</button></div></div>
     <div className="ceo-company-units">{units.map(unit=><div className="ceo-company-unit" key={unit.id}><div className="ceo-company-unit-icon"><Building2 size={20}/></div><div className="ceo-company-unit-info"><strong>{unit.name}</strong><small>{unit.slug} · {unit.active?"Ativa":"Suspensa"} · {members.filter(m=>m.shop_id===unit.id).length} vínculos</small></div><div className="ceo-company-unit-actions"><Link href={"/ceo/empresa/"+unit.id}>Administrar <ArrowUpRight size={14}/></Link><Link href={"/ceo/empresa/"+unit.id+"/aparencia"}>Personalizar</Link><Link href={"/b/"+unit.slug} target="_blank">Agendamento</Link><form action={toggleShop}><input type="hidden" name="shop_id" value={unit.id}/><input type="hidden" name="active" value={String(!unit.active)}/><button type="submit">{unit.active?"Suspender":"Ativar"}</button></form></div></div>)}
     {!units.length&&<p className="ceo-company-empty">Nenhuma unidade neste filtro.</p>}</div>
     <div className="ceo-company-capacity"><span>{canCreate?remaining+" unidade(s) disponível(is) no plano":remaining===0?"Limite de unidades atingido":"Verifique a assinatura para permitir novas unidades"}</span>{canCreate&&<AddUnit networkId={network.id} remaining={remaining}/>}</div>
     {expanded===network.id&&<div className="ceo-company-detail"><div><h4>Assinatura da rede</h4><ContractForm networkId={network.id} sub={sub} plans={plans}/></div><div><h4>Proprietário da rede</h4><OwnerLinkForm key={network.id} networkId={network.id} currentEmail={owner?.email||""} pendingEmail={invitation?.email||null}/></div></div>}
    </div>;
   })}
   {shops.filter(s=>!s.network_id).map(s=><div className="ceo-company-unit" key={s.id}><div className="ceo-company-unit-icon"><Building2 size={19}/></div><div className="ceo-company-unit-info"><strong>{s.name}</strong><small>Unidade sem rede associada</small></div><Link href={"/ceo/empresa/"+s.id}>Administrar <ArrowUpRight size={14}/></Link></div>)}
   {networks.length===0&&<p className="ceo-company-empty">Cadastre sua primeira rede e barbearia no formulário acima.</p>}
  </section>
 </div>;
}
