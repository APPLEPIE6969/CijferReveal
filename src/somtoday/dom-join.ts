import type {ResultRecord} from './types';
import {parseGrade} from './grade-parser';
import {recordIdentityKey} from './identity';
import {parseSomtodayDate} from './date-parser';
export const normalize=(v:string)=>v.normalize('NFKC').toLocaleLowerCase('nl-NL').replace(/\s+/g,' ').trim();
const dateLabel=(v:string)=>normalize(v).replace(/\b([a-z]+)\./g,'$1').replace(/\b0([1-9])\b/g,'$1');
const calendarDay=(date:Date)=>Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000;
function weightValue(value:string):string|number{
 const text=normalize(value).replace(/\s*(?:x|×|keer)$/,'');
 return /^\d+(?:[,.]\d+)?$/.test(text)?Number(text.replace(',','.')):text;
}
function sameValue(a:string,b:string){const x=parseGrade(a),y=parseGrade(b);return x!==null&&y!==null?x===y:a.trim()===b.trim();}
export function dateVariants(value:string,now=new Date()):string[]{
 const d=parseSomtodayDate(value);if(!Number.isFinite(d.getTime()))return [];
 const days=calendarDay(now)-calendarDay(d);
 // SOMtoday's own formatter uses local calendar days, including DST changes.
 const relative=days===0?['Vandaag']:days===1?['Gisteren']:[];
 return [...new Set([...relative,value.slice(0,10),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'long'}).format(d),new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'numeric',year:'numeric'}).format(d)])].map(dateLabel);
}
export interface CardTuple { subject:string;subtitle:string;weight:string;value:string;family?:string;kind?:'recent'|'subject'; }
export function joinCard(tuple:CardTuple,records:ResultRecord[],logicalKey?:(record:ResultRecord)=>string):ResultRecord|null{
 const title=normalize(tuple.subject),subtitle=normalize(tuple.subtitle),date=dateLabel(tuple.subtitle);
 if(!title)return null;
 const matches=records.filter(r=>{
  if(r.aggregate||!r.isCijfer||r.isLabel||!sameValue(tuple.value,r.value)||weightValue(tuple.weight)!==weightValue(r.weight)||tuple.family&&r.family!==tuple.family)return false;
  const description=normalize(r.description);
  // Recent cards use the subject as title. Subject-page cards use the test
  // description as title and only the date as subtitle (verified in SOMtoday).
  const recent=normalize(r.subject)===title&&(!description||subtitle.includes(description));
  const subject=tuple.kind==='subject'&&(title===description||!!description&&title.startsWith(description+' geïmporteerd uit '));
  if(!recent&&!subject)return false;
  return r.date?dateVariants(r.date).some(candidate=>date===candidate||date.startsWith(candidate)&&/^(?:\s*[•·–—]\s*|\s+-\s*)/.test(date.slice(candidate.length))):date===''||/^[•·]/.test(date);
 });
 const identities=new Set(matches.map(r=>logicalKey?logicalKey(r):recordIdentityKey(r)));
 if(identities.size!==1)return null;
 // Identity equivalence was established by the worker before DOM matching.
 // Prefer the progression presentation, matching SOMtoday's merged-card UI.
 return [...matches].sort((a,b)=>a.family===b.family?recordIdentityKey(a).localeCompare(recordIdentityKey(b)):a.family==='progression'?-1:1)[0];
}
