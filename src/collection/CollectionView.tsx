import {memo,useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import type {CollectionEntry} from '../state/schema';
import {tierFor} from '../opening/tiers';
import {filterInventory,inventoryStats,inventorySubjects,tierLabel,type InventorySort} from './model';

const numberFormat=new Intl.NumberFormat('nl-NL',{minimumFractionDigits:1,maximumFractionDigits:1});
const openedFormat=new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
function dateLabel(value:string){const date=new Date(value);return value&& !Number.isNaN(date.getTime())?new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(date):'Datum onbekend';}
function fullDateLabel(value:string){const date=new Date(value);return value&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long',year:'numeric'}).format(date):'Datum onbekend';}
function openedLabel(value:number){const date=new Date(value);return Number.isNaN(date.getTime())?'Datum onbekend':openedFormat.format(date);}
function subjectMark(subject:string){return subject.trim().split(/\s+/).slice(0,2).map(word=>word[0]).join('').toLocaleUpperCase('nl-NL')||'•';}
function weightLabel(weight:string){const normalized=weight.trim().replace(/\s*[x×]$/i,'');return normalized?`${normalized}x`:null;}

const GradeCard=memo(function GradeCard({entry,reduced,index,onOpen}:{entry:CollectionEntry;reduced:boolean;index:number;onOpen:(entry:CollectionEntry,trigger:HTMLButtonElement)=>void}){
 const ref=useRef<HTMLDivElement>(null);const buttonRef=useRef<HTMLButtonElement>(null);const rect=useRef<DOMRect|null>(null);const pointer=useRef({x:0,y:0});const frame=useRef<number|undefined>(undefined);const tier=tierFor(entry.grade);
 useEffect(()=>()=>{if(frame.current!==undefined)cancelAnimationFrame(frame.current);},[]);
 const onEnter=(event:PointerEvent<HTMLDivElement>)=>{if(reduced||event.pointerType!=='mouse')return;const card=ref.current;if(!card)return;rect.current=card.getBoundingClientRect();card.classList.add('po-grade-hover');};
 const onMove=(event:PointerEvent<HTMLDivElement>)=>{
  if(reduced||event.pointerType!=='mouse')return;
  const card=ref.current,bounds=rect.current;if(!card||!bounds||!bounds.width||!bounds.height)return;
  pointer.current={x:event.clientX,y:event.clientY};card.classList.add('po-grade-follow');
  if(frame.current!==undefined)return;
  frame.current=requestAnimationFrame(()=>{frame.current=undefined;const {x:clientX,y:clientY}=pointer.current;const x=Math.max(0,Math.min(1,(clientX-bounds.left)/bounds.width)),y=Math.max(0,Math.min(1,(clientY-bounds.top)/bounds.height));card.style.setProperty('--grade-rx',`${(0.5-y)*4}deg`);card.style.setProperty('--grade-ry',`${(x-0.5)*4}deg`);card.style.setProperty('--grade-gx',`${x*100}%`);card.style.setProperty('--grade-gy',`${y*100}%`);});
 };
 const reset=()=>{const card=ref.current;if(frame.current!==undefined){cancelAnimationFrame(frame.current);frame.current=undefined;}rect.current=null;if(!card)return;card.style.setProperty('--grade-rx','0deg');card.style.setProperty('--grade-ry','0deg');card.classList.remove('po-grade-follow','po-grade-hover');};
 const delay=Math.min(index%8,7)*.035;
 return <motion.div ref={ref} className="po-inventory-motion" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={reset} onPointerCancel={reset} initial={reduced?false:{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:reduced?0:.32,delay:reduced?0:delay,ease:[.22,1,.36,1]}}><article>
  <button ref={buttonRef} type="button" className={`po-inventory-card po-tier-${tier.name}`} data-tier={tier.name} style={{'--grade-tier':tier.color} as React.CSSProperties} aria-haspopup="dialog" aria-label={`${entry.subject||'Vak'}, cijfer ${entry.value}, ${entry.description||'Resultaat'}. Details bekijken`} onClick={()=>buttonRef.current&&onOpen(entry,buttonRef.current)}>
   <span className="po-grade-card-shell">
    <span className="po-grade-card-material" aria-hidden="true"/><span className="po-grade-card-glare" aria-hidden="true"/>
    <span className="po-grade-card-header"><span className="po-subject-mark" aria-hidden="true">{subjectMark(entry.subject)}</span><span className="po-grade-card-subject">{entry.subject||'Vak'}</span><span className="po-grade-card-detail-icon" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M11.5 3.5h5v5M16.2 3.8l-6 6M8.5 5H5a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 5 16h8a1.5 1.5 0 0 0 1.5-1.5V11"/></svg></span></span>
    <span className="po-grade-card-main"><strong className="po-grade-card-value">{entry.value}</strong><span className="po-grade-card-assessment">{entry.description||'Resultaat'}</span></span>
    <span className="po-grade-card-footer"><span>{dateLabel(entry.date)}</span>{weightLabel(entry.weight)&&<><span aria-hidden="true">·</span><span>{weightLabel(entry.weight)}</span></>}</span>
   </span>
  </button>
 </article></motion.div>;
});

export function CollectionView({entries,verified,onGoGrades}:{entries:CollectionEntry[];verified:boolean;onGoGrades:()=>void}){
 const reduced=!!useReducedMotion();const subjects=useMemo(()=>inventorySubjects(entries),[entries]);
 const [query,setQuery]=useState(''),[subject,setSubject]=useState(''),[tier,setTier]=useState(''),[sort,setSort]=useState<InventorySort>('newest'),[selected,setSelected]=useState<CollectionEntry|null>(null);
 const dialogRef=useRef<HTMLDialogElement>(null);const closeRef=useRef<HTMLButtonElement>(null);const openerRef=useRef<HTMLButtonElement|null>(null);
 const visible=useMemo(()=>filterInventory(entries,{query,subject,tier,sort}),[entries,query,subject,tier,sort]);const stats=useMemo(()=>inventoryStats(entries),[entries]);
 useEffect(()=>{const dialog=dialogRef.current;if(!dialog)return;if(selected){if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>closeRef.current?.focus());}else if(dialog.open)dialog.close();},[selected]);
 const closeDetails=()=>{setSelected(null);requestAnimationFrame(()=>{if(openerRef.current?.isConnected)openerRef.current.focus();openerRef.current=null;});};
 const clearFilters=()=>{setQuery('');setSubject('');setTier('');};
 const hasFilters=!!(query.trim()||subject||tier);
 return <section className="po-inventory-page" id="po-inventory-page" role="tabpanel" aria-labelledby="po-inventory-tab" tabIndex={-1}>
  <div className="po-inventory-inner">
   <header className="po-inventory-heading"><div className="po-inventory-title"><h1 id="po-inventory-title">Inventaris</h1><span className="po-inventory-count">{stats.total} {stats.total===1?'cijfer':'cijfers'}</span></div>{!!entries.length&&<dl className="po-inventory-stats" aria-label="Overzicht"><div><dt>Gemiddelde</dt><dd>{stats.average===null?'—':numberFormat.format(stats.average)}</dd></div><div><dt>Hoogste</dt><dd>{stats.highest===null?'—':numberFormat.format(stats.highest)}</dd></div></dl>}</header>
   {!verified?<section className="po-inventory-empty"><h2>Open eerst Cijfers</h2><p>Je inventaris wordt geladen zodra je cijfers zijn gecontroleerd.</p><button type="button" onClick={onGoGrades}>Naar Cijfers</button></section>:!entries.length?<section className="po-inventory-empty"><h2>Nog geen geopende cijfers</h2><p>Open een cijfer om het hier terug te zien.</p><button type="button" onClick={onGoGrades}>Naar Cijfers</button></section>:<>
    <section className="po-inventory-controls" aria-label="Zoeken en filteren"><label className="po-inventory-search"><span className="po-visually-hidden">Zoek op vak of toets</span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input type="search" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape'&&query){event.preventDefault();setQuery('');}}} placeholder="Zoek vak of toets"/></label><label><span>Vak</span><select value={subject} onChange={event=>setSubject(event.target.value)}><option value="">Alle vakken</option>{subjects.map(item=><option key={item} value={item}>{item}</option>)}</select></label><label><span>Cijfer</span><select value={tier} onChange={event=>setTier(event.target.value)}><option value="">Alle cijfers</option>{['crimson','bronze','steel','gold','electric','iridescent','neutral'].map(item=><option key={item} value={item}>{tierLabel(item)}</option>)}</select></label><label className="po-inventory-sort"><span>Sorteren</span><select value={sort} onChange={event=>setSort(event.target.value as InventorySort)}><option value="newest">Nieuwste eerst</option><option value="oldest">Oudste eerst</option><option value="highest">Hoogste cijfer</option><option value="lowest">Laagste cijfer</option></select></label></section>
    <div className="po-inventory-result-row"><p className="po-inventory-result-count">{visible.length} {visible.length===1?'resultaat':'resultaten'}</p>{hasFilters&&<button className="po-inventory-clear" type="button" onClick={clearFilters}>Wissen</button>}</div>
    {visible.length?<section className="po-inventory-grid" aria-label="Geopende cijfers">{visible.map((entry,index)=><GradeCard key={`${entry.key}:${entry.version}:${entry.openedAt}`} entry={entry} index={index} reduced={reduced} onOpen={(item,trigger)=>{openerRef.current=trigger;setSelected(item);}}/>)}</section>:<section className="po-inventory-no-results"><h2>Geen cijfers gevonden</h2><p>Pas je zoekopdracht of filters aan.</p><button type="button" onClick={clearFilters}>Filters wissen</button></section>}
   </>}
  </div>
  <dialog ref={dialogRef} className="po-grade-detail" aria-labelledby="po-grade-detail-title" style={selected?{'--detail-tier':tierFor(selected.grade).color} as React.CSSProperties:undefined} onCancel={event=>{event.preventDefault();closeDetails();}} onClose={()=>{if(selected)closeDetails();}} onClick={event=>{if(event.target===dialogRef.current)closeDetails();}}>
   {selected&&<div className="po-grade-detail-content"><button ref={closeRef} className="po-grade-detail-close" type="button" aria-label="Details sluiten" onClick={closeDetails}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button><span className="po-grade-detail-mark" aria-hidden="true">{subjectMark(selected.subject)}</span><p className="po-grade-detail-subject">{selected.subject||'Vak'}</p><h2 id="po-grade-detail-title" className="po-grade-detail-grade">{selected.value}</h2><p className="po-grade-detail-assessment">{selected.description||'Resultaat'}</p><dl className="po-grade-detail-meta"><div><dt>Datum</dt><dd>{fullDateLabel(selected.date)}</dd></div>{weightLabel(selected.weight)&&<div><dt>Weging</dt><dd>{weightLabel(selected.weight)}</dd></div>}<div><dt>Geopend</dt><dd>{openedLabel(selected.openedAt)}</dd></div></dl></div>}
  </dialog>
 </section>;
}
