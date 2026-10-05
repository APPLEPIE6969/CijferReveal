import {migrate} from './migrations';
import {newState} from './schema';
import {noteCoverage,markOpened,resetOpenedResults} from './classifier';
import {observeLogicalResults} from './logical-results';
import {LIVE_PROFILE} from '../somtoday/validation-profile';
import {authorizeCommand} from './commands';

let transaction=Promise.resolve();
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 const c=authorizeCommand(message,sender,chrome.runtime.id);if(!c)return;
 transaction=transaction.then(async()=>{try{
  const stored=await chrome.storage.local.get('poState');
  // The reset button also recovers corrupt local storage. Normal resets keep
  // known result identities so open tabs can immediately offer those packs.
  let state;try{state=migrate(stored.poState);}catch(error){if(c.kind!=='reset')throw error;state=newState();}
  switch(c.kind){
   case 'read':break;
   case 'observe':
    await observeLogicalResults(state,c.inputs);
    if(c.scope)noteCoverage(state,c.scope,c.surface,LIVE_PROFILE);break;
   case 'open':markOpened(state,c.key,c.version,c.scope,undefined,c.generation);break;
   case 'settings':state.settings=c.settings;break;
   case 'clear-collection':state.collection=[];break;
   case 'reset':resetOpenedResults(state);break;
  }
  await chrome.storage.local.set({poState:state});reply({ok:true,state});
 }catch{reply({ok:false,error:'Lokale gegevens kunnen niet veilig worden verwerkt.'});}});
 return true;
});
