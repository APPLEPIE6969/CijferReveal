import {newState,defaultSettings,type State} from './schema';
export function migrate(input:unknown):State{
 if(!input||typeof input!=='object')return newState();
 const s=input as State;
 if(s.schema!==2&&Number(s.schema)!==1)throw new Error('Lokale gegevens hebben een onbekende versie.');
 if(!/^[a-f0-9]{64}$/.test(s.salt)||!s.records||typeof s.records!=='object'||Array.isArray(s.records)||!Array.isArray(s.collection)||!s.coverage||typeof s.coverage!=='object')throw new Error('Lokale gegevens kunnen niet veilig worden gelezen.');
 for(const [key,r] of Object.entries(s.records))if(!/^[a-f0-9]{64}$/.test(key)||r.key!==key||!/^[a-f0-9]{64}$/.test(r.scope)||!/^[a-f0-9]{64}$/.test(r.version)||!['observed-nonnumeric','baseline','pending','opened','unresolved'].includes(r.state)||typeof r.numeric!=='boolean')throw new Error('Ongeldige lokale resultaatstatus.');
 const resetGeneration=s.resetGeneration??0;
 if(!Number.isSafeInteger(resetGeneration)||resetGeneration<0)throw new Error('Ongeldige resetstatus.');
 return {...s,schema:2,resetGeneration,settings:{...defaultSettings,...s.settings},collection:s.collection.filter(c=>c&&/^[a-f0-9]{64}$/.test(c.key)&&/^[a-f0-9]{64}$/.test(c.version)&&/^[a-f0-9]{64}$/.test(c.scope)&&((c.value==='*'&&c.grade===null)||(typeof c.grade==='number'&&Number.isFinite(c.grade)&&c.grade>=1&&c.grade<=10))&&Number.isFinite(c.openedAt))};
}
