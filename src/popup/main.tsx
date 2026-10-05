import {useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {command} from '../state/repository';
import type {State,Settings} from '../state/schema';
import './popup.css';

function Popup(){
 const [state,setState]=useState<State|null>(null);
 const [error,setError]=useState('');
 const [confirm,setConfirm]=useState<'collection'|'reset'|null>(null);
 const settings=useRef<Settings|null>(null),persisted=useRef<Settings|null>(null),request=useRef(0);

 useEffect(()=>{
  void command({kind:'read'}).then(next=>{settings.current=next.settings;persisted.current=next.settings;setState(next);}).catch(()=>setError('Lokale gegevens kunnen niet worden gelezen.'));
 },[]);

 async function change(patch:Partial<Settings>){
  const current=settings.current??state?.settings;if(!current)return;
  const next={...current,...patch},id=++request.current;
  settings.current=next;setState(previous=>previous?{...previous,settings:next}:previous);setError('');
  try{
   const saved=await command({kind:'settings',settings:next});persisted.current=saved.settings;
   if(id===request.current){settings.current=saved.settings;setState(saved);}
  }catch{
   if(id===request.current){const restored=persisted.current??current;settings.current=restored;setState(previous=>previous?{...previous,settings:restored}:previous);setError('Instelling opslaan is niet gelukt. Probeer het opnieuw.');}
  }
 }

 async function confirmAction(){
  if(!confirm)return;
  try{const saved=await command({kind:confirm==='reset'?'reset':'clear-collection'});settings.current=saved.settings;persisted.current=saved.settings;setState(saved);setConfirm(null);setError('');}
  catch{setError('Wissen is niet gelukt. Probeer het opnieuw.');}
 }

 const pending=state?Object.values(state.records).filter(record=>record.state==='pending').length:null;
 return <main className="po-popup" aria-busy={!state&&!error}>
  <h1>Pack Opening voor SOMtoday</h1>
  {pending!==null&&<p className="po-popup-count">{pending} {pending===1?'ongeopend cijfer':'ongeopende cijfers'}</p>}
  {!state?<p className={error?'po-popup-error':'po-popup-loading'} role={error?'alert':'status'}>{error||'Cijfers controleren…'}</p>:<>
   <div className="po-setting"><label htmlFor="sound">Geluid</label><input id="sound" type="checkbox" checked={state.settings.sound} onChange={event=>void change({sound:event.target.checked})}/></div>
   <div className="po-setting"><label htmlFor="volume">Volume</label><output htmlFor="volume">{Math.round(state.settings.volume*100)}%</output></div>
   <input className="po-volume" id="volume" type="range" min="0" max="1" step="0.05" value={state.settings.volume} onChange={event=>void change({volume:Number(event.target.value)})}/>
   <div className="po-setting"><label htmlFor="motion">Verminder beweging</label><input id="motion" type="checkbox" checked={state.settings.motion==='reduce'} onChange={event=>void change({motion:event.target.checked?'reduce':'system'})}/></div>
   <p className="po-hint">De systeeminstelling voor beweging wordt altijd gerespecteerd.</p>
   <details><summary>Instellingen en gegevens</summary><p>Alle gegevens blijven lokaal op dit apparaat.</p><button onClick={()=>setConfirm('collection')}>Lokale collectie wissen</button><button onClick={()=>setConfirm('reset')}>Extensie opnieuw instellen</button></details>
   {confirm&&<div className="po-confirm" role="alert" aria-labelledby="po-confirm-copy"><p id="po-confirm-copy">{confirm==='reset'?'Alle lokale gegevens wissen? De baseline wordt opnieuw opgebouwd.':'De lokale collectie wissen? Geopende cijfers blijven geopend.'}</p><button onClick={()=>void confirmAction()}>Wissen bevestigen</button><button onClick={()=>setConfirm(null)}>Annuleren</button></div>}
   {import.meta.env.DEV&&<a href="tester.html" target="_blank" rel="noreferrer">Test opening</a>}
  </>}
  {error&&state&&<p className="po-popup-error" role="alert">{error}</p>}
 </main>;
}

createRoot(document.getElementById('root')!).render(<Popup/>);
