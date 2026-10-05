import {matchResource} from '../somtoday/resources';
import {projectResponse} from '../somtoday/projection';
import {digest} from '../somtoday/identity';
import type {Observation} from '../somtoday/types';
let salt:string|null=null;
const pending:(()=>void)[]=[];
window.addEventListener('message',event=>{
 if(event.source!==window||event.origin!==location.origin)return;
 const d=event.data;if(d?.protocol==='po/init'&&typeof d.salt==='string'&&/^[a-f0-9]{64}$/.test(d.salt)){
 salt=d.salt;pending.splice(0).forEach(f=>f());
 }
});
window.postMessage({protocol:'po/ready'},location.origin);
function observe(url:string,method:string,read:()=>Promise<unknown>){
 if(method.toUpperCase()!=='GET')return;
 const resource=matchResource(url,location.origin);if(!resource)return;
 // Read a fetch clone / completed XHR immediately, before an XHR can be reused.
 void (async()=>{try{
 const records=projectResponse(await read(),resource);if(!records.length)return;
 const publish=()=>{void (async()=>{try{
 const scope=resource.scopeInput&&salt?await digest(salt,'account',resource.scopeInput):null;
 const message:Observation={protocol:'po/1',surface:resource.surface,scope,records,complete:false};
 window.postMessage(message,location.origin);
 }catch{/* unknown data */}})();};
 if(salt)publish();else if(pending.length<32)pending.push(publish);
 }catch{/* Unknown response formats fail closed. */}})();
}
const originalFetch=window.fetch;
window.fetch=function(...args:Parameters<typeof fetch>){
 const promise=Reflect.apply(originalFetch,this,args) as ReturnType<typeof fetch>;
 // Do not inspect headers, body, credentials or other request options.
 try {const request=args[0],url=request instanceof Request?request.url:String(request);
 const method=args[1]?.method??(request instanceof Request?request.method:'GET');
 void promise.then(response=>{if(response.ok && matchResource(url,location.origin))observe(response.url||url,method,()=>response.clone().json());},()=>{});
 }catch{/* Preserve the original fetch promise even if inspection fails. */}
 return promise;
};
const xhrData=new WeakMap<XMLHttpRequest,{url:string;method:string}>();
const originalOpen=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(this:XMLHttpRequest,...args: [string,string|URL,boolean?,(string|null)?,(string|null)?]){
 const result=Reflect.apply(originalOpen,this,args);xhrData.set(this,{method:String(args[0]),url:String(args[1])});return result;
};
const originalSend=XMLHttpRequest.prototype.send;
const xhrObserved=new WeakSet<XMLHttpRequest>();
XMLHttpRequest.prototype.send=function(...args:Parameters<XMLHttpRequest['send']>){
 if(!xhrObserved.has(this)){xhrObserved.add(this);this.addEventListener('load',()=>{const d=xhrData.get(this);if(!d||this.status<200||this.status>=300)return;
 observe(this.responseURL||d.url,d.method,async()=>{
 if(this.responseType==='json')return this.response;
 if(this.responseType===''||this.responseType==='text')return JSON.parse(this.responseText);
 throw new Error('unsupported');
 });});}
 return Reflect.apply(originalSend,this,args);
};
