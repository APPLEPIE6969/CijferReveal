import type {ResultRecord} from './types';
import {parseGrade} from './grade-parser';
export const normalize=(v:string)=>v.normalize('NFKC').toLocaleLowerCase('nl-NL').replace(/\s+/g,' ').trim();
const dateLabel=(v:string)=>normalize(v).replace(/\b([a-z]+)\./g,'$1').replace(/\b0([1-9])\b/g,'$1');
const containsDate=(subtitle:string,date:string)=>{
 const start=subtitle.indexOf(date);if(start<0)return false;
 return (start===0||!/\d/.test(subtitle[start-1]))&&(start+date.length===subtitle.length||!/\d/.test(subtitle[start+date.length]));
};
function weightValue(value:string):string|number{
 const text=normalize(value).replace(/\s*(?:x|×|keer)$/,'');
 return /^\d+(?:[,.]\d+)?$/.test(text)?Number(text.replace(',','.')):text;
}
function sameValue(a:string,b:string){const x=parseGrade(a),y=parseGrade(b);return x!==null&&y!==null?x===y:a.trim()===b.trim();}
export function dateVariants(value:string):string[]{
 const d=new Date(value);if(!Number.isFinite(d.getTime()))return [];
 return [...new Set([value.slice(0,10),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'numeric',year:'numeric'}).format(d)])].map(dateLabel);
}
export interface CardTuple { subject:string;subtitle:string;weight:string;value:string;family?:string; }
export function joinCard(tuple:CardTuple,records:ResultRecord[]):ResultRecord|null{
 const subject=normalize(tuple.subject),subtitle=normalize(tuple.subtitle),dates=dateLabel(tuple.subtitle);
 if(!subject)return null;
 const matches=records.filter(r=>!r.aggregate&&r.isCijfer&&!r.isLabel&&normalize(r.subject)===subject&&(!r.description||subtitle.includes(normalize(r.description)))&&dateVariants(r.date).some(d=>containsDate(dates,d))&&weightValue(tuple.weight)===weightValue(r.weight)&&sameValue(tuple.value,r.value)&&(!tuple.family||r.family===tuple.family));
 // Includes value as corroboration, NEVER as identity. Duplicate projections collapse only if identical.
 const distinct=new Map(matches.map(r=>[`${r.family}:${r.id}`,r]));return distinct.size===1?[...distinct.values()][0]:null;
}
