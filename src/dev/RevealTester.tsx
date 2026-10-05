import {useState,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {OpeningOverlay} from '../opening/OpeningOverlay';
import {OpeningAudio} from '../opening/audio';
import type {DisplayResult} from '../somtoday/types';
import '../shared/ui.css';
import '../popup/popup.css';
const fixtures=['*','4,8','6,3','7,8','8,9','9,7'];
function Tester(){const [value,setValue]=useState('8,9'),[active,setActive]=useState(false),[reduced,setReduced]=useState(false),[sound,setSound]=useState(true),[volume,setVolume]=useState(.7),[count,setCount]=useState(1),[index,setIndex]=useState(0);
 const audio=useMemo(()=>{const a=new OpeningAudio(name=>typeof chrome!=='undefined'&&chrome.runtime?.id?chrome.runtime.getURL(`assets/${name}`):`/assets/${name}`);void a.prepare();return a;},[]);
 const results=useMemo<DisplayResult[]>(()=>Array.from({length:count},(_,i)=>({key:`fixture-${i}`,version:'fixture',subject:i?'Nederlands':'Wiskunde A',description:i?'Hoofdstuk 2 · Tekstbegrip':'Hoofdstuk 3 · Differentiëren',date:'2026-10-04',weight:'2',value:i?fixtures[i%fixtures.length]:value,grade:(i?fixtures[i%fixtures.length]:value)==='*'?null:Number((i?fixtures[i%fixtures.length]:value).replace(',','.'))})),[count,value]);
 const settings=useMemo(()=>({sound,volume,motion:reduced?'reduce' as const:'system' as const}),[sound,volume,reduced]);
 const commit=useMemo(()=>async()=>{ /* Isolated fixture state: never calls chrome.storage. */ },[]);
 return <><main className="po-popup" style={{width:520,maxWidth:'100%'}}><h1>Opening testen</h1><p>Alle cijfers zijn fixtures. Er worden geen echte gegevens gelezen of opgeslagen.</p><label>Cijfer <select value={value} onChange={e=>setValue(e.target.value)}>{fixtures.map(v=><option key={v}>{v}</option>)}</select></label><p><label>Aantal <input type="number" min="1" max="5" value={count} onChange={e=>setCount(Math.max(1,Math.min(5,Number(e.target.value))))}/></label></p><p><label><input type="checkbox" checked={reduced} onChange={e=>setReduced(e.target.checked)}/> Verminder beweging</label></p><p><label><input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/> Geluid</label></p><label>Volume <input type="range" min="0" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label><button onClick={()=>{setIndex(0);setActive(true);}}>Test opening</button><p>Nonnumeric, versieovergangen en ambigue joins worden getest met <code>npm test</code>.</p></main>{active&&<OpeningOverlay key={index} result={results[index]} settings={settings} audio={audio} commit={commit} close={()=>{setActive(false);audio.stop();}} next={index<count-1?()=>setIndex(i=>i+1):undefined} position={index+1} total={count}/>}</>;
}
if(import.meta.env.DEV)createRoot(document.getElementById('root')!).render(<Tester/>);
