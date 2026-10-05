import {migrate} from './migrations';
import {newState,type Settings} from './schema';
import {classify,noteCoverage,markOpened,type ClassifiedInput} from './classifier';
import {LIVE_PROFILE} from '../somtoday/validation-profile';
import type {Command} from './repository';
import {validRecord} from '../somtoday/schemas';
let transaction=Promise.resolve();
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(message?.protocol!=='po/storage'||sender.id!==chrome.runtime.id)return;
 const url=sender.url??'';if(!url.startsWith(`chrome-extension://${chrome.runtime.id}/`)&&!url.startsWith('https://leerling.somtoday.nl/'))return;
 transaction=transaction.then(async()=>{try{
 const stored=await chrome.storage.local.get('poState');let state=migrate(stored.poState);const c=message.command as Command;
 switch(c.kind){
 case 'read':break;
 case 'observe':{
 if(!sender.tab||!Array.isArray(c.inputs)||c.inputs.length>2000)throw new Error('Ongeldige observatie.');
 for(const i of c.inputs){if(!validRecord(i.record)||!['key','scope','version'].every(k=>/^[a-f0-9]{64}$/.test(i[k as keyof ClassifiedInput] as string)))throw new Error('Ongeldig resultaat.');classify(state,i,LIVE_PROFILE);}
 if(c.scope&&/^[a-f0-9]{64}$/.test(c.scope))noteCoverage(state,c.scope,c.surface,LIVE_PROFILE);break;}
 case 'open':markOpened(state,c.key,c.version,c.scope);break;
 case 'settings':{const s=c.settings as Settings;if(typeof s.sound!=='boolean'||!Number.isFinite(s.volume)||s.volume<0||s.volume>1||!['system','reduce'].includes(s.motion))throw new Error('Ongeldige instellingen.');state.settings={sound:s.sound,volume:s.volume,motion:s.motion};break;}
 case 'clear-collection':state.collection=[];break;
 case 'reset':state=newState();break;
 default:throw new Error('Onbekende actie.');
 }
 await chrome.storage.local.set({poState:state});reply({ok:true,state});
 }catch{reply({ok:false,error:'Lokale gegevens kunnen niet veilig worden verwerkt.'});}});
 return true;
});
