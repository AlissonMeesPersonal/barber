"use client";
import {useEffect,useState} from "react";
import {Check,Scissors,Plus,Link2Off} from "lucide-react";
import {setProfessionalServiceLink} from "./actions";

type Pro={id:string;name:string;active:boolean};
type Service={id:string;name:string;active:boolean;price_cents:number;duration_minutes:number};
type Link={professional_id:string;service_id:string};
export default function BarberServiceManager({shopId,professionals,services,links,onAddTeam}:{
 shopId:string;professionals:Pro[];services:Service[];links:Link[];onAddTeam:()=>void
}){
 const [selected,setSelected]=useState(professionals.find(p=>p.active)?.id||professionals[0]?.id||"");
 const [assigned,setAssigned]=useState(links);
 const [saving,setSaving]=useState<string|null>(null);
 const [feedback,setFeedback]=useState("");
 useEffect(()=>{setAssigned(links)},[links]);
 useEffect(()=>{if(!professionals.some(p=>p.id===selected))setSelected(professionals[0]?.id||"")},[professionals,selected]);
 const pro=professionals.find(p=>p.id===selected);
 const count=(id:string)=>assigned.filter(x=>x.professional_id===id).length;
 async function toggle(serviceId:string){
  if(!pro||saving)return;
  const enabled=!assigned.some(x=>x.professional_id===pro.id&&x.service_id===serviceId);
  setSaving(serviceId);setFeedback("");
  try{
   const result=await setProfessionalServiceLink({shopId,professionalId:pro.id,serviceId,enabled});
   if(!result.ok){setFeedback(result.message);return;}
   setAssigned(previous=>enabled?[...previous.filter(x=>!(x.professional_id===pro.id&&x.service_id===serviceId)),{professional_id:pro.id,service_id:serviceId}]:previous.filter(x=>!(x.professional_id===pro.id&&x.service_id===serviceId)));
   setFeedback(result.message);
  }catch{
   setFeedback("Não foi possível atualizar o vínculo. Atualize a página e tente novamente.");
  }finally{setSaving(null)}
 }
 return <section className="barber-service-panel">
  <header className="barber-service-heading"><div><span className="eyebrow">EQUIPE · PERMISSÕES DE SERVIÇOS</span><h2>Serviços realizados por barbeiro</h2><p>Defina o que cada profissional pode atender nesta unidade. Os agendamentos mostrarão apenas as combinações habilitadas.</p></div><div className="barber-service-count"><strong>{assigned.length}</strong><span>vínculos configurados</span></div></header>
  {!professionals.length||!services.length?<div className="barber-service-empty"><Scissors size={26}/><h3>Configure sua equipe primeiro</h3><p>{!professionals.length?"Cadastre pelo menos um barbeiro.":"Cadastre pelo menos um serviço."}</p><button type="button" className="button primary" onClick={onAddTeam}>Ir para Serviços e barbeiros</button></div>:
  <div className="barber-service-grid">
   <aside className="barber-service-people" aria-label="Selecionar profissional">
    <div className="barber-service-aside-title">Profissionais <span>{professionals.length}</span></div>
    {professionals.map(p=><button type="button" aria-pressed={p.id===selected} key={p.id} className={"barber-service-person "+(p.id===selected?"selected":"")} onClick={()=>{setSelected(p.id);setFeedback("")}}>
      <span className="barber-service-avatar">{p.name.trim().charAt(0).toUpperCase()}</span>
      <span className="barber-service-person-text"><strong>{p.name}</strong><small>{p.active?"Ativo":"Inativo"} · {count(p.id)} serviços</small></span>
      {p.id===selected&&<Check size={17}/>}
    </button>)}
   </aside>
   <section className="barber-service-settings">
    <div className="barber-service-settings-heading"><div><span className="eyebrow">PROFISSIONAL SELECIONADO</span><h3>{pro?.name}</h3><p>{count(selected)} de {services.length} serviços habilitados</p></div><div className="barber-service-indicator">{pro?.active?"Barbeiro ativo":"Barbeiro inativo"}</div></div>
    {services.map(s=>{
     const enabled=assigned.some(x=>x.professional_id===selected&&x.service_id===s.id);
     const blocked=!enabled&&(!s.active||!pro?.active);
     return <div className="barber-service-row" key={s.id}><div className={"barber-service-status "+(enabled?"linked":"")}><Scissors size={19}/></div>
      <div className="barber-service-details"><strong>{s.name}</strong><small>{new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(s.price_cents/100)} · {s.duration_minutes} min{s.active?"":" · serviço inativo"}</small></div>
      <button type="button" disabled={!!saving||blocked} onClick={()=>void toggle(s.id)} className={"barber-service-toggle "+(enabled?"linked":"")} aria-label={(enabled?"Desvincular ":"Vincular ")+s.name+" ao barbeiro "+pro?.name}>
       {saving===s.id?"Salvando...":enabled?<><Link2Off size={15}/> Desvincular</>:<><Plus size={15}/> Habilitar</>}
      </button></div>;
    })}
    <p className="barber-service-note">{!pro?.active?"Este barbeiro está inativo. Ative-o em Serviços e barbeiros para vincular novos serviços.":"Serviços inativos não podem ser habilitados, mas os vínculos existentes podem ser removidos."}</p>
    {feedback&&<p className="barber-service-feedback" role="status" aria-live="polite">{feedback}</p>}
   </section>
  </div>}
 </section>;
}