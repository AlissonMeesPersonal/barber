"use client";
import {useActionState} from "react";
import Link from "next/link";
import {assignManager,type ManagerInvitationState} from "./actions";
type Shop={id:string;name:string};
const initialState:ManagerInvitationState={status:"idle",message:""};
export default function ManagerAccessForm({shops}:{shops:Shop[]}){
 const [state,submit,isPending]=useActionState(assignManager,initialState);
 return <div className="ceo-manager-access">
  <form action={submit} className="ceo-form">
   <input type="email" name="email" required placeholder="E-mail do gestor"/>
   <select name="shop_id" required>{shops.map(s=><option value={s.id} key={s.id}>{s.name}</option>)}</select>
   <select name="role"><option value="manager">Gestor</option><option value="owner">Proprietário da unidade</option></select>
   <button type="submit" disabled={isPending}>{isPending?"Validando...":"Autorizar ou convidar"}</button>
  </form>
  {state.message&&<p className={"ceo-invitation-feedback "+(state.status==="error"?"is-error":state.status==="pending"?"is-pending":"is-success")} role="status" aria-live="polite">{state.message}</p>}
  <p className="ceo-invitation-help">Se o e-mail ainda não tiver cadastro confirmado, o convite ficará pendente. O usuário deve <Link href="/gestor/cadastro" target="_blank">criar sua conta aqui ↗</Link> e confirmar o e-mail antes do primeiro acesso. Nenhum e-mail é enviado automaticamente.</p>
 </div>;
}