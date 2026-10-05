import {newState,defaultSettings,type State} from './schema';
import {parseGrade} from '../somtoday/grade-parser';
export function migrate(input:unknown):State{
 if(!input||typeof input!=='object')return newState();
 const s=input as State;
 if(s.schema!==2&&Number(s.schema)!==1)throw new Error('Lokale gegevens hebben een onbekende versie.');
 if(!/^[a-f0-9]{64}$/.test(s.salt)||!s.records||typeof s.records!=='object'||Array.isArray(s.records)||!Array.isArray(s.collection)||!s.coverage||typeof s.coverage!=='object')throw new Error('Lokale gegevens kunnen niet veilig worden gelezen.');
 for(const [key,r] of Object.entries(s.records))if(!/^[a-f0-9]{64}$/.test(key)||r.key!==key||!/^[a-f0-9]{64}$/.test(r.scope)||!/^[a-f0-9]{64}$/.test(r.version)||!['observed-nonnumeric','baseline','pending','opened','unresolved'].includes(r.state)||typeof r.numeric!=='boolean')throw new Error('Ongeldige lokale resultaatstatus.');
 const resetGeneration=s.resetGeneration??0;
 if(!Number.isSafeInteger(resetGeneration)||resetGeneration<0)throw new Error('Ongeldige resetstatus.');
 const aliases=s.aliases??{};
 if(!aliases||typeof aliases!=='object'||Array.isArray(aliases))throw new Error('Ongeldige lokale koppelingen.');
 const hash=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 for(const [key,a] of Object.entries(aliases)){
  if(!a||!hash(key)||!hash(a.scope)||!hash(a.rawVersion)||!hash(a.signature)||!hash(a.logicalKey)||(a.proof!==undefined&&!hash(a.proof))||(a.openedSignature!==undefined&&!hash(a.openedSignature))||!['progression','exam'].includes(a.family)||typeof a.numeric!=='boolean'||!Number.isFinite(a.firstSeen)||(a.display&&(a.display.key!==key||a.display.version!==a.rawVersion)))throw new Error('Ongeldige lokale koppeling.');
  const d=a.display;if(d&&(!(['subject','description','date','weight','value'] as const).every(field=>typeof d[field]==='string'&&d[field].length<=[300,300,80,40,32][['subject','description','date','weight','value'].indexOf(field)])||!(d.value==='*'&&d.grade===null||typeof d.grade==='number'&&parseGrade(d.value)===d.grade)))throw new Error('Ongeldige gekoppelde cijferweergave.');
 }
 return {...s,schema:2,resetGeneration,aliases,settings:{...defaultSettings,...s.settings},collection:s.collection.filter(c=>c&&/^[a-f0-9]{64}$/.test(c.key)&&/^[a-f0-9]{64}$/.test(c.version)&&/^[a-f0-9]{64}$/.test(c.scope)&&((c.value==='*'&&c.grade===null)||(typeof c.grade==='number'&&Number.isFinite(c.grade)&&c.grade>=1&&c.grade<=10))&&Number.isFinite(c.openedAt))};
}
