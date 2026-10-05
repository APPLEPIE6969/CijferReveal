type Stage='document-start'|'static-css'|'owner-mount'|'classification'|'safe-presentation';
const entries:{time:number;component:string;concealed:boolean;route:string;stage:Stage}[]=[];
export function diagnosticStage(stage:Stage,component:string,concealed:boolean){
 if(!import.meta.env.DEV)return;
 entries.push({time:Math.round(performance.now()),component,concealed,route:['/cijfers','/cijfers/overzicht','/cijfers/vakgemiddelden','/cijfers/vakresultaten','/rooster'].includes(location.pathname)?location.pathname:'overige route',stage});
 if(entries.length>200)entries.shift();
}
export function diagnose(owner:HTMLElement){
 diagnosticStage('owner-mount',owner.tagName.toLowerCase(),isConcealed(owner));
}
export function isConcealed(owner:HTMLElement){
 const style=getComputedStyle(owner),root=owner.querySelector<HTMLElement>('.root'),grade=owner.querySelector<HTMLElement>('.cijfer');
 return owner.inert||owner.getAttribute('aria-hidden')==='true'||style.display==='none'||style.visibility==='hidden'||!!root&&getComputedStyle(root).visibility==='hidden'||!!grade&&getComputedStyle(grade).visibility==='hidden';
}
export function diagnosticReport(){const css=entries.find(x=>x.stage==='static-css'),mount=entries.find(x=>x.stage==='owner-mount');return {status:css&&mount&&css.time<=mount.time&&entries.every(x=>x.concealed)?'success':'failure',entries:[...entries]};}
