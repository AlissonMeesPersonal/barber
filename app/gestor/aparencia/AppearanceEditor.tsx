"use client";
import {useState} from "react";
import Link from "next/link";
import {Scissors,ArrowLeft,ExternalLink,ImagePlus} from "lucide-react";
import {saveAppearance} from "./actions";
type Shop={id:string;slug:string;name:string;logo_url:string|null;primary_color:string;secondary_color:string;background_color:string;headline:string;description:string;layout_style:string};
export default function AppearanceEditor({shop,saved,backHref="/gestor"}:{shop:Shop;saved:boolean;backHref?:string}){
 const [name,setName]=useState(shop.name),[headline,setHeadline]=useState(shop.headline),[description,setDescription]=useState(shop.description);
 const [primary,setPrimary]=useState(shop.primary_color),[secondary,setSecondary]=useState(shop.secondary_color),[background,setBackground]=useState(shop.background_color);
 const [layout,setLayout]=useState(shop.layout_style),[previewLogo,setPreviewLogo]=useState(shop.logo_url);
 return <main className="editor-shell"><div className="editor-top"><Link href={backHref} className="quiet-link"><ArrowLeft size={16}/> Voltar ao painel</Link><div><h1>Identidade da barbearia</h1><p>Personalize sua marca e veja como o cliente enxergará a página.</p></div><Link className="button secondary" href={"/b/"+shop.slug} target="_blank">Ver página <ExternalLink size={15}/></Link></div>
 {saved&&<p className="editor-success" role="status">Alterações salvas e publicadas para sua barbearia.</p>}
 <div className="editor-grid"><form action={saveAppearance} className="panel editor-fields"><input type="hidden" name="shop_id" value={shop.id}/><h2>Personalizar marca</h2>
 <label>Nome da barbearia<input name="name" maxLength={100} required value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>Logo (PNG, JPG ou WebP, até 2 MB)<input type="file" name="logo" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0];if(f){if(previewLogo?.startsWith("blob:"))URL.revokeObjectURL(previewLogo);setPreviewLogo(URL.createObjectURL(f))}}}/></label>
 <label>Frase principal<input name="headline" maxLength={120} required value={headline} onChange={e=>setHeadline(e.target.value)}/></label>
 <label>Descrição<textarea name="description" maxLength={250} rows={3} value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <div className="editor-colors">{[{label:"Cor principal",name:"primary_color",color:primary,change:setPrimary},{label:"Cor secundária",name:"secondary_color",color:secondary,change:setSecondary},{label:"Cor de fundo",name:"background_color",color:background,change:setBackground}].map(c=><label key={c.name}>{c.label}<div className="editor-color"><input type="color" name={c.name} value={c.color} onChange={e=>c.change(e.target.value)}/><span>{c.color}</span></div></label>)}</div>
 <label>Estilo de layout<select name="layout_style" value={layout} onChange={e=>setLayout(e.target.value)}><option value="premium">Premium</option><option value="minimal">Minimalista</option><option value="urban">Urbano</option></select></label>
 <button className="button primary" type="submit">Salvar e publicar alterações</button></form>
 <section className="editor-preview"><div className="eyebrow">PRÉVIA EM TEMPO REAL</div><div className={"preview-site preview-"+layout} style={{background, color:"#ffffff",borderColor:primary}}><header>{previewLogo?<img src={previewLogo} alt="Logo da barbearia"/>:<Scissors size={32} color={primary}/>}<strong>{name||"Sua barbearia"}</strong></header><div className="preview-hero" style={{background:secondary}}><ImagePlus color={primary} size={27}/><h2>{headline}</h2><p>{description}</p><span className="preview-cta" style={{background:primary}}>Agendar horário</span></div><footer>Identidade exclusiva de {name||"sua barbearia"}</footer></div><p className="fine-print">O preview simula o estilo da página; o agendamento real usará os dados salvos.</p></section></div></main>;
}
