import {Bridge} from './bridge';
import {Experience} from './mount';
import {joinCard} from '../somtoday/dom-join';
import {nativeCardValues,presentCard,type Presentation} from '../spoiler/recent-card';
import {presentDerived,presentOverview} from '../spoiler/derived';
import {injectInventoryTab,type InventoryTabController} from '../collection/CollectionTab';
import {listenRoutes} from './route-controller';
import {diagnose,diagnosticReport,diagnosticStage,isConcealed} from '../dev/diagnostics';
if(import.meta.env.DEV)diagnosticStage('document-start','document',!document.querySelector('sl-laatste-resultaat-item,sl-vakresultaat-item'));
let cssMeasured=false;
const OWNER='sl-laatste-resultaat-item,sl-vakresultaat-item';
const unsupportedOwners=new WeakMap<HTMLElement,string|null>();
const presentations=new Map<HTMLElement,Presentation>();let gradeRoot:HTMLElement|null=null,gradeObserver:MutationObserver|null=null,scheduled=false,failed=false;
const bridge=new Bridge(()=>{failed=false;schedule();},()=>{failed=true;schedule();});
const experience=new Experience(()=>bridge.state,()=>bridge.refresh());
const retryGradeDetection=()=>window.location.reload();
const INVENTORY_HISTORY='__poInventory';let inventoryTab:InventoryTabController|null=null,pendingInventory=false,inventoryURL='';
function isCijfersTab(tab:HTMLElement){return /^cijfers\b/i.test((tab.getAttribute('aria-label')??tab.textContent??'').replace(/\s+/g,' ').trim());}
function getCijfersTab(){return [...document.querySelectorAll<HTMLElement>('sl-tab-bar sl-tab,sl-tab-bar [role="tab"]')].find(isCijfersTab)??null;}
function clearInventoryHistory(){const current=history.state;if(!current||typeof current!=='object'||!(INVENTORY_HISTORY in current))return;const next={...current};delete next[INVENTORY_HISTORY];history.replaceState(next,'',location.href);}
function closeInventory(clearHistory=true){pendingInventory=false;inventoryTab?.setActive(false);if(experience.inventoryActive)experience.close();if(clearHistory)clearInventoryHistory();}
function goToCijfers(){const tab=getCijfersTab();if(tab)tab.click();else closeInventory();}
function startInventory(){if(experience.active||pendingInventory)return;pendingInventory=true;inventoryURL=location.href;inventoryTab?.setActive(true);const state=history.state&&typeof history.state==='object'?history.state:{};if(!(INVENTORY_HISTORY in state))history.pushState({...state,[INVENTORY_HISTORY]:true},'',location.href);if(!document.querySelector('sl-cijfers'))getCijfersTab()?.click();tryStartInventory();}
function tryStartInventory(){if(!pendingInventory||experience.active)return;const route=document.querySelector<HTMLElement>('sl-cijfers');if(!route)return;const button=inventoryTab?.button;if(!button)return;if(experience.showInventory(bridge.activeScope,button,route,!!bridge.activeScope,goToCijfers))pendingInventory=false;}
function syncInventory(){
 inventoryTab=injectInventoryTab(startInventory,tab=>{if(pendingInventory&&isCijfersTab(tab))return;if(pendingInventory||experience.inventoryActive)closeInventory(true);});
 if(history.state?.[INVENTORY_HISTORY]&&location.href===inventoryURL&&!pendingInventory&&!experience.inventoryActive)pendingInventory=true;
 inventoryTab?.setActive(pendingInventory||experience.inventoryActive);
 tryStartInventory();
 if(experience.inventoryActive)experience.updateInventory(bridge.activeScope,!!bridge.activeScope,goToCijfers);
}
function clear(){for(const p of presentations.values())p.dispose();presentations.clear();}
function reconcileOwner(owner:HTMLElement){
 const old=presentations.get(owner);
 // Unknown/transient templates must stay shielded, including text outside
 // the normal .cijfer node. Revisit them when Angular finishes rendering.
 if(!owner.querySelector('sl-resultaat-item .root')||!owner.querySelector('sl-resultaat-item .cijfer')){
  if(!unsupportedOwners.has(owner))unsupportedOwners.set(owner,owner.getAttribute('aria-hidden'));
  owner.classList.add('po-unsupported-owner');owner.setAttribute('aria-hidden','true');old?.update(null,undefined,undefined,()=>{},retryGradeDetection);return;
 }
 if(unsupportedOwners.has(owner)){const original=unsupportedOwners.get(owner);if(original===null)owner.removeAttribute('aria-hidden');else if(original!==undefined)owner.setAttribute('aria-hidden',original);unsupportedOwners.delete(owner);owner.classList.remove('po-unsupported-owner');}
 diagnose(owner);
 const native=nativeCardValues(owner);const tuple={subject:owner.querySelector('.titel')?.textContent??'',subtitle:owner.querySelector('.subtitel')?.textContent??'',weight:native.weight,value:native.value};
 const live=[...bridge.records.values()].filter(r=>r.scope===bridge.activeScope);
 const result=failed?null:joinCard(tuple,live.map(x=>x.record));
 diagnosticStage('classification',owner.tagName.toLowerCase(),isConcealed(owner));
 const selected=result?live.find(x=>x.record===result):null;const stored=selected?bridge.state?.records[selected.key]:null;
 if(old){old.update(result,stored?.state,stored?.display,(display,origin)=>{if(bridge.activeScope)experience.open(display,origin,bridge.activeScope);},retryGradeDetection);diagnosticStage('safe-presentation',owner.tagName.toLowerCase(),isConcealed(owner));return;}
 const presentation=presentCard(owner,result,stored?.state,stored?.display,(display,origin)=>{if(bridge.activeScope)experience.open(display,origin,bridge.activeScope);},retryGradeDetection);presentations.set(owner,presentation);diagnosticStage('safe-presentation',owner.tagName.toLowerCase(),isConcealed(owner));
}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;reconcile();});}
function reconcile(){
 const root=document.querySelector<HTMLElement>('sl-cijfers');
 if(root!==gradeRoot){gradeObserver?.disconnect();clear();gradeRoot=root;
 if(root){gradeObserver=new MutationObserver(records=>{
 const affected=new Set<HTMLElement>();
 for(const record of records){const target=record.target instanceof Element?record.target:record.target.parentElement;if(target?.closest('.po-overview-status,.po-derived-placeholder'))continue;if(record.type==='attributes'&&target?.closest('.po-safe-native'))continue;
 const owner=target?.closest<HTMLElement>(OWNER);if(owner)affected.add(owner);
 for(const n of record.addedNodes){if(!(n instanceof Element)||n.classList.contains('po-safe-native'))continue;if(n.matches(OWNER))affected.add(n as HTMLElement);n.querySelectorAll<HTMLElement>(OWNER).forEach(x=>affected.add(x));}
 }
 for(const [owner,p] of presentations)if(!owner.isConnected){p.dispose();presentations.delete(owner);}
 for(const owner of affected)if(owner.isConnected)reconcileOwner(owner);
 presentDerived(root);presentOverview(root);
 });gradeObserver.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','aria-describedby','aria-labelledby']});}
 }
 if(root){root.querySelectorAll<HTMLElement>(OWNER).forEach(reconcileOwner);presentDerived(root);presentOverview(root);}
 syncInventory();
}
let shellObserver:MutationObserver|null=null,bodyObserver:MutationObserver|null=null;
function setup(){
 if(!document.body)return;
 if(import.meta.env.DEV&&!cssMeasured&&getComputedStyle(document.documentElement).getPropertyValue('--po-shield-installed').trim()==='1'){cssMeasured=true;diagnosticStage('static-css','document',true);}
 const shell=document.querySelector('sl-root');
 if(shell&&!shellObserver){shellObserver=new MutationObserver(records=>{
 if(records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n instanceof Element&&(n.matches('sl-cijfers,sl-tab-bar,a[href]')||n.querySelector('sl-cijfers,sl-tab-bar')))))schedule();
 });shellObserver.observe(shell,{subtree:true,childList:true});}
 if(!bodyObserver){bodyObserver=new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n instanceof HTMLElement&&(n.matches('sl-modal,hmy-tooltip')||n.querySelector('sl-modal,hmy-tooltip')))n.querySelectorAll<HTMLElement>('sl-resultaat-item-detail').forEach(diagnose);});bodyObserver.observe(document.body,{childList:true});}
 schedule();
}
const initial=new MutationObserver(()=>{setup();if(document.body&&document.querySelector('sl-root'))initial.disconnect();});initial.observe(document,{subtree:true,childList:true});setup();
const unroute=listenRoutes(()=>{if(history.state?.[INVENTORY_HISTORY]&&location.href===inventoryURL&&!experience.inventoryActive&&!pendingInventory){pendingInventory=true;inventoryTab?.setActive(true);tryStartInventory();window.setTimeout(tryStartInventory,80);window.setTimeout(tryStartInventory,240);}else if((pendingInventory||experience.inventoryActive)&&(!history.state?.[INVENTORY_HISTORY]||location.href!==inventoryURL))closeInventory(true);if(experience.active&&!experience.inventoryActive&&!document.querySelector('sl-cijfers'))experience.close();schedule();});
const storageListener=(changes:Record<string,chrome.storage.StorageChange>,area:string)=>{if(area==='local'&&changes.poState)void bridge.refresh().catch(()=>{failed=true;schedule();});};chrome.storage.onChanged.addListener(storageListener);
void bridge.start();
if(import.meta.env.DEV)chrome.runtime.onMessage.addListener((m,_sender,reply)=>{if(m?.protocol==='po/diagnostics')reply(diagnosticReport());});
window.addEventListener('pageshow',event=>{if(event.persisted){void bridge.refresh().catch(()=>{failed=true;schedule();});schedule();}});
window.addEventListener('pagehide',event=>{if(event.persisted){closeInventory(false);experience.close();return;}closeInventory(false);inventoryTab?.remove();inventoryTab=null;initial.disconnect();shellObserver?.disconnect();bodyObserver?.disconnect();gradeObserver?.disconnect();unroute();clear();bridge.dispose();experience.dispose();chrome.storage.onChanged.removeListener(storageListener);});
