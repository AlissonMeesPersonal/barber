"use client";
import {useActionState,useState} from "react";
import Link from "next/link";
import {assignManager,type ManagerInvitationState} from "./actions";

type Shop={id:string;name:string};
type Account={user_id:string;email:string;confirmed:boolean;shop_count:number};
type AccessRole="manager"|"owner"|"network_owner";
const initialState:ManagerInvitationState={status:"idle",message:""};

export default function ManagerAccessForm({shops,users,ceoUserIds,selectedEmail,setSelectedEmail,selectedRole,setSelectedRole}:{
 shops:Shop[];
 users:Account[];
 ceoUserIds:string[];
 selectedEmail:string;
 setSelectedEmail:(email:string)=>void;
 selectedRole:AccessRole;
 setSelectedRole:(role:AccessRole)=>void;
}){
 const [state,submit,isPending]=useActionState(assignManager,initialState);
 const [mode,setMode]=useState<"registered"|"manual">("registered");
 const [manualEmail,setManualEmail]=useState("");
 const email=mode==="registered"?selectedEmail:manualEmail.trim();
 const selectable=users.filter(user=>!ceoUserIds.includes(user.user_id));
 const current=users.find(user=>user.email===selectedEmail);
 return <div className="ceo-manager-access" id="ceo-access-form">
  <div className="ceo-access-toggle">
   <button type="button" className={mode==="registered"?"selected":""} onClick={()=>setMode("registered")}>Selecionar usuário cadastrado</button>
   <button type="button" className={mode==="manual"?"selected":""} onClick={()=>setMode("manual")}>Convidar outro e-mail</button>
  </div>
  <form action={submit} className="ceo-form ceo-access-form">
   <input type="hidden" name="email" value={email}/>
   <label>Conta do proprietário ou gestor
    {mode==="registered"
     ?<select value={selectedEmail} required onChange={e=>setSelectedEmail(e.target.value)}>
       <option value="">Escolha um e-mail cadastrado</option>
       {selectable.map(user=><option key={user.user_id} value={user.email}>{user.email} — {user.confirmed?"Confirmado":"Aguardando confirmação"}</option>)}
      </select>
     :<input type="email" value={manualEmail} onChange={e=>setManualEmail(e.target.value)} required placeholder="nome@exemplo.com" autoComplete="off"/>}
   </label>
   <label>Barbearia
    <select name="shop_id" required>{shops.map(shop=><option value={shop.id} key={shop.id}>{shop.name}</option>)}</select>
   </label>
   <label>Permissão
    <select name="role" value={selectedRole} onChange={e=>setSelectedRole(e.target.value as AccessRole)}>
     <option value="owner">Proprietário somente desta unidade</option>
     <option value="network_owner">Proprietário da rede (todas as unidades)</option>
     <option value="manager">Gestor da unidade</option>
    </select>
   </label>
   <button type="submit" disabled={isPending||!email}>{isPending?"Salvando...":"Vincular à barbearia"}</button>
  </form>
  {mode==="registered"&&current&&!current.confirmed&&<p className="ceo-invitation-feedback is-pending">Esta conta foi criada, mas o e-mail ainda está pendente de confirmação. O vínculo será registrado e o acesso liberado quando a conta for confirmada e fizer login.</p>}
  {state.message&&<p className={"ceo-invitation-feedback "+(state.status==="error"?"is-error":state.status==="pending"?"is-pending":"is-success")} role="status" aria-live="polite">{state.message}</p>}
  <p className="ceo-invitation-help">Proprietário da rede recebe acesso a todas as suas unidades; proprietário da unidade recebe acesso somente ao estabelecimento escolhido. O proprietário ou gestor entra com suas próprias credenciais. Se o e-mail não estiver confirmado, o convite aguardará a confirmação. <Link href="/gestor/cadastro" target="_blank">Abrir cadastro ↗</Link></p>
 </div>;
}