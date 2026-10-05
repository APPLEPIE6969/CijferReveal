import {getCanonicalResultIdentity} from './identity';
import type {Resource} from './resources';
import type {ResultRecord} from './types';
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const text=(v:unknown,max=300):string=>typeof v==='string'&&v.length<=max?v:typeof v==='number'&&Number.isFinite(v)?String(v):'';
function projectRecord(input:unknown,resource:Resource,aggregate=false):ResultRecord|null{
 const r=obj(input),identity=getCanonicalResultIdentity(r);if(!identity)return null;
 const a=obj(r.additionalObjects),column=obj(a.resultaatkolom);
 const value=text(r.formattedResultaat,32).trim();if(!value)return null;
 return {id:identity.id,selfType:identity.type,type:typeof r.$type==='string'?r.$type:undefined,family:resource.family,value,isCijfer:r.isCijfer===true,isLabel:r.isLabel===true,subject:text(a.vaknaam),subjectId:text(a.vakuuid,256),description:text(r.omschrijving),date:text(r.datumInvoerEerstePoging,80),weight:text(r.weging,40),period:text(r.periode,40),testCode:text(r.toetscode,80),columnType:text(column.type,80)||undefined,aggregate};
}
export function projectResponse(body:unknown,resource:Resource):ResultRecord[]{
 const b=obj(body),out:ResultRecord[]=[];
 const add=(v:unknown,aggregate=false)=>{if(out.length>=2000)return;const r=projectRecord(v,resource,aggregate);if(r)out.push(r);};
 if(resource.surface==='recent'||resource.surface==='subject'){if(Array.isArray(b.items))b.items.slice(0,2000).forEach(x=>add(x));}
 if(resource.surface==='overview'&&Array.isArray(b.vakResultaten))for(const v of b.vakResultaten.slice(0,500)){
 const periods=obj(v).perioden;if(!Array.isArray(periods))continue;
 for(const p of periods.slice(0,30)){const period=obj(p);if(Array.isArray(period.resultaten))period.resultaten.slice(0,500).forEach(x=>add(x));for(const name of ['rapportGemiddelde','rapportCijfer','periodeGemiddelde'])if(period[name])add(period[name],true);}
 }
 if(resource.surface==='averages'&&Array.isArray(b.gemiddelden))for(const g of b.gemiddelden.slice(0,500)){const r=obj(g).voortgangsdossierResultaat;if(r)add(r,true);}
 return out;
}
