import {validateObservation} from '../somtoday/schemas';
import {digest} from '../somtoday/identity';
import type {ResultRecord} from '../somtoday/types';
import type {State} from '../state/schema';
import {command} from '../state/repository';
export interface LiveRecord { record:ResultRecord;key:string;scope:string;version:string; }
export class Bridge {
 records=new Map<string,LiveRecord>();activeScope:string|null=null;state:State|null=null;
 private chain=Promise.resolve();private waiting:ReturnType<typeof validateObservation>[]=[];private disposed=false;
 constructor(private changed:()=>void,private failed:()=>void){}
 private listener=(event:MessageEvent)=>{
 if(event.source!==window||event.origin!==location.origin)return;
 if(event.data?.protocol==='po/ready'){if(this.state)this.hello();return;}
 const message=validateObservation(event.data);if(!message)return;
 this.chain=this.chain.then(()=>this.consume(message)).catch(()=>this.failed());
 };
 async start(){window.addEventListener('message',this.listener);try{this.state=await command({kind:'read'});this.hello();const queued=this.waiting.splice(0);for(const m of queued)if(m)await this.consume(m);this.changed();}catch{this.failed();}}
 private hello(){if(this.state)window.postMessage({protocol:'po/init',salt:this.state.salt},location.origin);}
 private async consume(message:NonNullable<ReturnType<typeof validateObservation>>){
 if(this.disposed)return;
 if(!this.state){if(this.waiting.length<32)this.waiting.push(message);return;}
 if(message.scope){if(this.activeScope&&this.activeScope!==message.scope){this.records.clear();this.waiting=[];}this.activeScope=message.scope;}
 const inputs:LiveRecord[]=[];
 for(const observed of message.records){
 const known=this.records.get(`${observed.family}:${observed.id}`);
 // Overview context cannot be assumed to be account identity; correlate with an already scoped record.
 const scope=message.scope??known?.scope;if(!scope)continue;
 // Unscoped overview/average responses cannot prove account identity or a
 // revision. Retain the latest canonical scoped response for a known result.
 const record=message.scope?observed:known!.record;
 const key=await digest(this.state.salt,scope,record.family,record.id);
 const version=await digest(this.state.salt,'version',record.value,record.weight,record.description,record.date,record.period,record.testCode,record.columnType??'',record.selfType,record.subject,record.subjectId,String(record.isCijfer),String(record.isLabel),String(record.aggregate));
 const live={record,key,scope,version};inputs.push(live);this.records.set(`${record.family}:${record.id}`,live);
 }
 if(!message.scope&&inputs.length<message.records.length&&this.waiting.length<32)this.waiting.push(message);
 if(inputs.length){this.state=await command({kind:'observe',inputs,scope:message.scope??inputs[0].scope,surface:message.surface});this.changed();}
 if(message.scope&&this.waiting.length){const pending=this.waiting.splice(0);for(const p of pending)if(p)await this.consume(p);}
 }
 async refresh(){const next=await command({kind:'read'});if(this.state?.salt!==next.salt){this.records.clear();this.activeScope=null;}this.state=next;this.hello();this.changed();}
 dispose(){this.disposed=true;window.removeEventListener('message',this.listener);this.records.clear();}
}
