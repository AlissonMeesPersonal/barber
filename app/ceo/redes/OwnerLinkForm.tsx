"use client";
import Link from "next/link";
import {useActionState} from "react";
import {assignNetworkOwner,type OwnerAssignmentState} from "./actions";

const initialState:OwnerAssignmentState={kind:"idle",message:""};

export default function OwnerLinkForm({networkId,currentEmail,pendingEmail}:{networkId:string;currentEmail:string;pendingEmail?:string|null}){
 const [result,submit,pending]=useActionState(assignNetworkOwner,initialState);
 return <div className="ceo-owner-form">
  {pendingEmail&&<p className="ceo-owner-pending" role="status">Convite aguardando confirmação para <strong>{pendingEmail}</strong>. Ainda não foi concedido acesso à rede.</p>}
  <form action={submit} className="ceo-network-form">
   <input type="hidden" name="network_id" value={networkId}/>
   <label>E-mail do proprietário
    <input name="email" type="email" placeholder="proprietario@exemplo.com" required defaultValue={pendingEmail||currentEmail}/>
   </label>
   <button type="submit" disabled={pending}>{pending?"Verificando...":"Vincular ou convidar"}</button>
  </form>
  {result.message&&<p role="status" aria-live="polite" className={result.kind==="error"?"ceo-owner-error":"ceo-owner-success"}>{result.message}</p>}
  <p>O e-mail confirmado recebe acesso imediatamente. Se ainda não estiver cadastrado ou confirmado, a autorização fica pendente até o primeiro login verificado.</p>
  <p><Link href="/gestor/cadastro" target="_blank">Link para o proprietário criar a conta ↗</Link> · O sistema não envia um convite por e-mail automaticamente.</p>
 </div>;
}