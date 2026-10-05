import {newState,defaultSettings,type Settings,type State} from './schema';
import {normalizeGradeValue,parseGrade} from '../somtoday/grade-parser';

const hash=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const lifecycle=new Set(['observed-nonnumeric','baseline','pending','opened','unresolved']);
// One display payload is persisted in three places (records, aliases, collection).
// Bound every field identically so no load path can widen what a renderer receives.
const DISPLAY_LIMITS={subject:300,description:300,date:80,weight:40,value:32} as const;
const validDisplay=(display:unknown,key:string,version:string)=>{
 if(!display||typeof display!=='object')return false;
 const d=display as Record<string,unknown>;
 if(d.key!==key||d.version!==version)return false;
 for(const field of Object.keys(DISPLAY_LIMITS) as (keyof typeof DISPLAY_LIMITS)[])if(typeof d[field]!=='string'||(d[field] as string).length>DISPLAY_LIMITS[field])return false;
 if(normalizeGradeValue(d.value)===null)return false;
 return d.grade===null||(typeof d.grade==='number'&&Number.isFinite(d.grade)&&parseGrade(d.value)===d.grade);
};
// Settings are the one persisted payload no command re-validates once stored.
// Repair each field independently so one bad value cannot discard the others.
const readSettings=(s:unknown):Settings=>{
 const stored=(s&&typeof s==='object'?s:{}) as Partial<Settings>;
 return {
  sound:typeof stored.sound==='boolean'?stored.sound:defaultSettings.sound,
  volume:typeof stored.volume==='number'&&Number.isFinite(stored.volume)&&stored.volume>=0&&stored.volume<=1?stored.volume:defaultSettings.volume,
  motion:stored.motion==='system'||stored.motion==='reduce'?stored.motion:defaultSettings.motion,
 };
};

export function migrate(input:unknown):State{
 if(!input||typeof input!=='object')return newState();
 const s=input as State;
 if(s.schema!==2&&Number(s.schema)!==1)throw new Error('Lokale gegevens hebben een onbekende versie.');
 if(!hash(s.salt)||!s.records||typeof s.records!=='object'||Array.isArray(s.records)||!Array.isArray(s.collection)||!s.coverage||typeof s.coverage!=='object')throw new Error('Lokale gegevens kunnen niet veilig worden gelezen.');
 for(const [key,r] of Object.entries(s.records))if(!r||!hash(key)||r.key!==key||!hash(r.scope)||!hash(r.version)||!lifecycle.has(r.state)||typeof r.numeric!=='boolean'||!Number.isFinite(r.firstSeen)||(r.lastResolvedState!==undefined&&!lifecycle.has(r.lastResolvedState))||(r.display&&!validDisplay(r.display,key,r.version)))throw new Error('Ongeldige lokale resultaatstatus.');
 const resetGeneration=s.resetGeneration??0;
 if(!Number.isSafeInteger(resetGeneration)||resetGeneration<0)throw new Error('Ongeldige resetstatus.');
 const aliases=s.aliases??{};
 if(!aliases||typeof aliases!=='object'||Array.isArray(aliases))throw new Error('Ongeldige lokale koppelingen.');
 for(const [key,a] of Object.entries(aliases)){
  if(!a||!hash(key)||!hash(a.scope)||!hash(a.rawVersion)||!hash(a.signature)||!hash(a.logicalKey)||(a.proof!==undefined&&!hash(a.proof))||(a.openedSignature!==undefined&&!hash(a.openedSignature))||!['progression','exam'].includes(a.family)||typeof a.numeric!=='boolean'||!Number.isFinite(a.firstSeen))throw new Error('Ongeldige lokale koppeling.');
  if(a.display&&!validDisplay(a.display,key,a.rawVersion))throw new Error('Ongeldige gekoppelde cijferweergave.');
 }
 // Unusable archive entries are dropped; unusable settings are repaired.
 return {...s,schema:2,resetGeneration,aliases,settings:readSettings(s.settings),collection:s.collection.filter(c=>c&&hash(c.key)&&hash(c.version)&&hash(c.scope)&&validDisplay(c,c.key,c.version)&&Number.isFinite(c.openedAt))};
}
