"use client";
import Link from "next/link";
import { useState } from "react";
import { Scissors, ArrowLeft, ArrowRight, CheckCircle2, Clock3, UserRound, ShieldCheck } from "lucide-react";

const services=[
 {id:"corte",name:"Corte masculino",price:45,duration:30},
 {id:"barba",name:"Barba",price:35,duration:25},
 {id:"combo",name:"Corte + Barba",price:70,duration:55}
];
const barbers=["Lucas Almeida","Rafael Costa","André Martins","Primeiro disponível"];
const displaySlots=["09:00","10:00","10:30","11:30","14:00","14:30","15:30","17:00"];
type Stage="identificacao"|"escolha"|"resumo";
export default function Agendamento(){
 const [stage,setStage]=useState<Stage>("identificacao");
 const [name,setName]=useState("");
 const [phone,setPhone]=useState("");
 const [service,setService]=useState("corte");
 const [barber,setBarber]=useState(0);
 const [date,setDate]=useState("");
 const [hour,setHour]=useState("");
 const [error,setError]=useState("");
 const [lastService,setLastService]=useState<string|null>(null);
 const [verified,setVerified]=useState(false);
 const [loading,setLoading]=useState(false);
 const current=services.find(s=>s.id===service)!;
 const validName=name.trim().length>=2;
 const validPhone=/^\d{10,11}$/.test(phone.replace(/\D/g,""));
 const now=new Date();
 const minDate=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
 async function identify(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!validName||!validPhone){setError("Informe seu nome e um WhatsApp com DDD válido.");return;}
  setLoading(true);setError("");
  // Histórico não pode ser revelado apenas por conhecer um número.
  // A consulta só será liberada depois da confirmação de posse do WhatsApp no backend.
  setVerified(false);setLastService(null);setStage("escolha");setLoading(false);
 }
 function preview(){if(!date||!hour){setError("Escolha uma data e horário para continuar.");return;}setError("");setStage("resumo")}
 return <main className="booking-wrap">
  <nav className="nav"><Link href="/" className="brand"><Scissors/> Barber<span>Flow</span></Link><Link className="quiet-link" href="/"><ArrowLeft size={16}/> Início</Link></nav>
  <section className="booking-card">
   <div className="booking-heading"><span className="eyebrow">BARBEARIA PRIME · PROTÓTIPO DE AGENDAMENTO</span><h1>{stage==="identificacao"?"Bem-vindo!":stage==="escolha"?"Escolha seu próximo atendimento":"Confira seu agendamento"}</h1><p>{stage==="identificacao"?"Comece informando seu nome e WhatsApp. Você não precisa criar senha.":stage==="escolha"?"Olá, "+name.trim().split(" ")[0]+"! Agora escolha o serviço, profissional e horário.":"Revise os dados selecionados antes de voltar."}</p>
   <div className="booking-progress"><span className={stage==="identificacao"?"on":""}>01 Identificação</span><span className={stage==="escolha"?"on":""}>02 Serviço e horário</span><span className={stage==="resumo"?"on":""}>03 Resumo</span></div>
   </div>
   {stage==="identificacao"&&<form className="booking-sections" onSubmit={identify}>
    <div className="step"><span className="num">01 · IDENTIFIQUE-SE</span><h2>Como podemos chamar você?</h2><div className="fields"><label>Nome completo<input required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome"/></label><label>WhatsApp com DDD<input required type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(51) 99999-9999"/></label></div><p className="fine-print"><ShieldCheck size={14} style={{verticalAlign:"middle"}}/> Seu histórico e cashback serão acessíveis somente após verificação do número. O protótipo não consulta nem armazena dados pessoais.</p></div>
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <button className="button primary booking-next" disabled={!validName||!validPhone||loading} type="submit">Continuar <ArrowRight size={17}/></button>
   </form>}
   {stage==="escolha"&&<div className="booking-sections">
     <div className="returning"><UserRound size={18}/><div><strong>{name}</strong><small>WhatsApp informado: {phone}</small></div><button className="quiet-link" onClick={()=>{setStage("identificacao");setHour("");setDate("")}}>Editar</button></div>
     <div className="step"><span className="num">02 · SEU SERVIÇO</span><h2>O que vamos fazer hoje?</h2>
     {verified&&lastService&&<button className="service-option chosen" onClick={()=>setService(lastService)}><span><strong>Repetir meu último serviço</strong><small>{services.find(s=>s.id===lastService)?.name}</small></span><ArrowRight size={18}/></button>}
     {!verified&&<p className="fine-print">Quando ativarmos a verificação do WhatsApp, clientes recorrentes poderão ver e repetir o último serviço. Por segurança, o histórico não aparece apenas com nome e número digitados.</p>}
     <div className="option-list">{services.map(s=><button type="button" key={s.id} onClick={()=>{setService(s.id);setHour("")}} className={"service-option "+(service===s.id?"chosen":"")}><span><strong>{s.name}</strong><small><Clock3 size={13}/> {s.duration} minutos</small></span><b>R$ {s.price}</b></button>)}</div></div>
     <div className="step"><span className="num">03 · SEU PROFISSIONAL</span><h2>Escolha o barbeiro</h2><div className="chips">{barbers.map((p,i)=><button type="button" key={p} className={"chip "+(barber===i?"chosen":"")} onClick={()=>{setBarber(i);setHour("")}}>{p}</button>)}</div></div>
     <div className="step"><span className="num">04 · DISPONIBILIDADE</span><h2>Data e horário</h2><label className="field-label">Data<input type="date" min={minDate} value={date} onChange={e=>{setDate(e.target.value);setHour("")}}/></label>
     <p className="fine-print">Horários ilustrativos enquanto o banco de agendamentos não estiver conectado. Na versão real, serão exibidos apenas horários livres, respeitando a duração do serviço e a agenda do profissional.</p>
     <div className="slot-grid">{displaySlots.map(s=><button type="button" key={s} className={"slot "+(hour===s?"chosen":"")} onClick={()=>setHour(s)}>{s}</button>)}</div></div>
     {error&&<p className="auth-error" role="alert">{error}</p>}
     <div className="booking-footer"><div><span>Valor do serviço</span><strong>R$ {current.price},00</strong></div><button type="button" className="button primary" onClick={preview}>Revisar agendamento <ArrowRight size={17}/></button></div>
   </div>}
   {stage==="resumo"&&<div className="booking-sections"><div className="success"><CheckCircle2 size={48}/><h2>Prévia do atendimento</h2><p>{name}, você selecionou <strong>{current.name}</strong> com <strong>{barbers[barber]}</strong> para {date.split("-").reverse().join("/")} às <strong>{hour}</strong>.</p><p className="fine-print">Este é um protótipo. Nenhuma reserva foi registrada. A confirmação real só será liberada após conexão com o banco, consulta de disponibilidade e proteção contra reservas simultâneas.</p><button className="button secondary" onClick={()=>setStage("escolha")}>Voltar e alterar</button></div></div>}
  </section>
 </main>;
}
