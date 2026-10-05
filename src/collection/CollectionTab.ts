type TabHandler=(origin:HTMLButtonElement)=>void;
type LeaveHandler=(tab:HTMLElement)=>void;
const controllers=new WeakMap<HTMLElement,{button:HTMLButtonElement;select:TabHandler;leave:LeaveHandler;listener:(event:Event)=>void;buttonListener:(event:Event)=>void;keyListener:(event:KeyboardEvent)=>void;selected:Map<HTMLElement,{aria:string|null;tabindex:string|null}>;tabs:HTMLElement[]}>();

function labelOf(tab:HTMLElement){return (tab.getAttribute('aria-label')??tab.textContent??'').replace(/\s+/g,' ').trim();}
function findBar(){
 for(const bar of document.querySelectorAll<HTMLElement>('sl-tab-bar')){
  const tabs=[...bar.querySelectorAll<HTMLElement>('sl-tab,[role="tab"]')];
  if(tabs.some(tab=>/^cijfers\b/i.test(labelOf(tab))))return {bar,tabs};
 }
 return null;
}

export interface InventoryTabController {button:HTMLButtonElement;setActive(active:boolean):void;remove():void;}
export function injectInventoryTab(select:TabHandler,leave:LeaveHandler):InventoryTabController|null{
 const found=findBar();if(!found)return null;
 let controller=controllers.get(found.bar);
 if(!controller){
  const cijfers=found.tabs.find(tab=>/^cijfers\b/i.test(labelOf(tab)))!;
  const button=document.createElement('button');button.type='button';button.id='po-inventory-tab';button.className='po-inventory-tab';button.setAttribute('role','tab');button.setAttribute('aria-label','Inventaris');button.setAttribute('aria-selected','false');button.setAttribute('aria-controls','po-inventory-page');button.tabIndex=-1;
  button.innerHTML='<svg aria-hidden="true" viewBox="0 0 20 20" focusable="false"><path d="M4 3.5h8.5L16 7v9.5H4z"/><path d="M12 3.5V7h4M7 10h6M7 13h6"/></svg><span>Inventaris</span>';
  const inactive=found.tabs.find(tab=>tab!==cijfers&&tab.getAttribute('aria-selected')!=='true')??cijfers;
  const copy=['display','align-items','gap','min-height','height','padding','font-family','font-size','font-weight','line-height','letter-spacing','text-transform','color','background-color'];
  const styles=getComputedStyle(inactive),activeStyle=getComputedStyle(cijfers);for(const property of copy){const value=styles.getPropertyValue(property);if(value)button.style.setProperty(property,value);}
  button.style.setProperty('--po-inventory-active-border',activeStyle.borderTopColor&&activeStyle.borderTopColor!=='rgba(0, 0, 0, 0)'?activeStyle.borderTopColor:'#3275c6');
  cijfers.after(button);
  const snapshots=new Map<HTMLElement,{aria:string|null;tabindex:string|null}>();
  const listener=(event:Event)=>{
   const target=event.target instanceof Element?event.target:null;
   if(target&&found.bar.contains(target)){const tab=target.closest<HTMLElement>('sl-tab,[role="tab"]');if(tab)controller?.leave(tab);}
  };
  // SOMtoday's tab-bar may stop delegated click events during capture. Start
  // on pointerdown so the extension tab remains operable without interfering
  // with its native tabs; provide equivalent keyboard activation explicitly.
  const buttonListener=(event:Event)=>{if(event.target instanceof Element&&event.target.closest('.po-inventory-tab')){event.preventDefault();event.stopPropagation();controller?.select(button);}};
  const keyListener=(event:KeyboardEvent)=>{const target=event.target instanceof Element?event.target.closest<HTMLElement>('sl-tab,[role="tab"]'):null;if(!target||!found.bar.contains(target))return;
   if(target===button&&(event.key==='Enter'||event.key===' ')){event.preventDefault();controller?.select(button);return;}
   if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
   const items=controller?.tabs.filter(tab=>tab.isConnected&&!tab.hasAttribute('disabled'))??[];const at=Math.max(0,items.indexOf(target));const next=event.key==='Home'?items[0]:event.key==='End'?items.at(-1):items[(at+(event.key==='ArrowRight'?1:-1)+items.length)%items.length];
   if(next){event.preventDefault();event.stopPropagation();next.focus();next.click();}
  };
  document.addEventListener('pointerdown',buttonListener,true);
  document.addEventListener('click',buttonListener,true);
  document.addEventListener('keydown',keyListener,true);
  found.bar.addEventListener('click',listener,true);
  controller={button,select,leave,listener,buttonListener,keyListener,selected:snapshots,tabs:[...found.bar.querySelectorAll<HTMLElement>('sl-tab,[role="tab"]')]};controllers.set(found.bar,controller);
 }
 controller.select=select;controller.leave=leave;controller.tabs=[...found.bar.querySelectorAll<HTMLElement>('sl-tab,[role="tab"]')];
 if(!controller.button.isConnected){const cijfers=found.tabs.find(tab=>/^cijfers\b/i.test(labelOf(tab)));if(cijfers)cijfers.after(controller.button);}
 return {button:controller.button,setActive(active){
  const c=controller!;
  if(active){
   for(const tab of c.tabs){if(tab===c.button)continue;if(!c.selected.has(tab))c.selected.set(tab,{aria:tab.getAttribute('aria-selected'),tabindex:tab.getAttribute('tabindex')});if(tab.hasAttribute('aria-selected'))tab.setAttribute('aria-selected','false');if(tab.hasAttribute('tabindex'))tab.tabIndex=-1;}
  }
  if(!active&&c.button.hasAttribute('data-active')){
   for(const [tab,attrs] of c.selected){if(!tab.isConnected)continue;if(attrs.aria===null)tab.removeAttribute('aria-selected');else tab.setAttribute('aria-selected',attrs.aria);if(attrs.tabindex===null)tab.removeAttribute('tabindex');else tab.setAttribute('tabindex',attrs.tabindex);}
   c.selected.clear();
  }
  c.button.toggleAttribute('data-active',active);c.button.setAttribute('aria-selected',String(active));c.button.tabIndex=active?0:-1;
 },remove(){document.removeEventListener('pointerdown',controller!.buttonListener,true);document.removeEventListener('click',controller!.buttonListener,true);document.removeEventListener('keydown',controller!.keyListener,true);controller?.button.remove();found.bar.removeEventListener('click',controller!.listener,true);controller!.selected.clear();controllers.delete(found.bar);}};
}
