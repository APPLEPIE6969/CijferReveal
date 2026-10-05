import {it,expect,vi,afterEach} from 'vitest';
import {Bridge} from '../src/content/bridge';
import {command} from '../src/state/repository';
import {newState} from '../src/state/schema';
import {classify,markOpened,collection,queue} from '../src/state/classifier';
import {LIVE_PROFILE} from '../src/somtoday/validation-profile';
import {record} from './fixtures';
vi.mock('../src/state/repository',()=>({command:vi.fn()}));
afterEach(()=>vi.clearAllMocks());
it('switching accounts isolates the live queue and archive, even when result IDs match',async()=>{
 const state=newState();vi.mocked(command).mockImplementation(async c=>{if(c.kind==='observe')for(const input of c.inputs)classify(state,input,LIVE_PROFILE);return state;});
 const failed=vi.fn(),bridge=new Bridge(()=>{},failed);await bridge.start();
 const send=(scope:string,value:string)=>window.dispatchEvent(new MessageEvent('message',{source:window,origin:location.origin,data:{protocol:'po/1',surface:'recent',scope,complete:false,records:[record({value})]}}));
 try{
  const a='a'.repeat(64),b='b'.repeat(64);send(a,'8,3');await vi.waitFor(()=>expect(queue(state,a)).toHaveLength(1));
  const first=queue(state,a)[0];markOpened(state,first.key,first.version,a);
  send(b,'6,75');await vi.waitFor(()=>expect(queue(state,b)).toHaveLength(1));
  expect(bridge.records.size).toBe(1);expect(bridge.activeScope).toBe(b);expect([...bridge.records.values()][0].scope).toBe(b);
  expect(collection(state,a).map(r=>r.value)).toEqual(['8,3']);expect(collection(state,b)).toEqual([]);
  expect(queue(state,b)[0].key).not.toBe(first.key);expect(failed).not.toHaveBeenCalled();
 }finally{bridge.dispose();}
});
it('a late unscoped response cannot overwrite the canonical numeric result',async()=>{
 const state=newState();vi.mocked(command).mockImplementation(async c=>{if(c.kind==='observe')for(const input of c.inputs)classify(state,input,LIVE_PROFILE);return state;});
 const changed=vi.fn(),bridge=new Bridge(changed,()=>{});await bridge.start();
 const send=(scope:string|null,value:string)=>window.dispatchEvent(new MessageEvent('message',{source:window,origin:location.origin,data:{protocol:'po/1',surface:scope?'recent':'overview',scope,complete:false,records:[record({value})]}}));
 try{
  const scope='a'.repeat(64);send(scope,'6,75');await vi.waitFor(()=>expect(queue(state,scope)).toHaveLength(1));
  const changes=changed.mock.calls.length;send(null,'8,3');await vi.waitFor(()=>expect(changed.mock.calls.length).toBeGreaterThan(changes));
  expect([...bridge.records.values()][0].record.value).toBe('6,75');expect(queue(state,scope)[0].display?.value).toBe('6,75');
 }finally{bridge.dispose();}
});
