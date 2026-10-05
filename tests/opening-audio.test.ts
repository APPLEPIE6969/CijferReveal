import {it,expect,vi,afterEach} from 'vitest';
import {OpeningAudio} from '../src/opening/audio';

afterEach(()=>vi.unstubAllGlobals());
it('plays the complete original opening cue and pauses the audio clock with the visual clock',async()=>{
 const starts:{name:string;when:number;duration?:number}[]=[],resume=vi.fn(async()=>{}),suspend=vi.fn(async()=>{}),stops=vi.fn();
 class Context {
  static active:Context;
  currentTime=10;outputLatency=.04;destination={};resume=resume;suspend=suspend;
  constructor(){Context.active=this;}
  async decodeAudioData(data:ArrayBuffer){return {name:(data as ArrayBuffer&{name:string}).name};}
  createBufferSource(){return {buffer:null as {name:string}|null,connect(){},disconnect(){},onended:null,start(when:number,_offset:number,duration?:number){starts.push({name:this.buffer!.name,when,duration});},stop:stops};}
  createGain(){return {gain:{value:0},connect(){},disconnect(){}};}
 }
 vi.stubGlobal('AudioContext',Context);
 const audio=new OpeningAudio(name=>name);
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,arrayBuffer:async()=>Object.assign(new ArrayBuffer(0),{name:url})})));
 await audio.prepare();const clock=await audio.start({sound:true,volume:.7,motion:'system'});
 expect(starts).toEqual([{name:'case-opening.mp3',when:10.06,duration:undefined}]);
 expect(clock!()).toBe(0);Context.active.currentTime=11.1;expect(clock!()).toBeCloseTo(1000,6);
 audio.reveal(6.3,{sound:true,volume:.7,motion:'system'});expect(starts).toHaveLength(1);
 audio.pause();audio.resume();expect(suspend).toHaveBeenCalledOnce();expect(resume).toHaveBeenCalled();
 expect(clock!()).toBeCloseTo(1000,6);Context.active.currentTime=16.57;expect(clock!()).toBeCloseTo(6470,6);
 audio.stop();expect(stops).toHaveBeenCalledOnce();
});
