import type {Settings} from '../state/schema';
export class OpeningAudio {
 private context:AudioContext|null=null;
 private buffers=new Map<string,AudioBuffer>();
 private sources:AudioBufferSourceNode[]=[];
 private preparing:Promise<void>|null=null;
 constructor(private url:(name:string)=>string){}
 prepare(){
  if(this.preparing)return this.preparing;
  this.preparing=(async()=>{try{
   this.context??=new AudioContext();
   await Promise.all(['case-opening.mp3','high-grade-accent.mp3'].map(async name=>{
    try{const data=await fetch(this.url(name)).then(r=>{if(!r.ok)throw new Error('audio');return r.arrayBuffer();});this.buffers.set(name,await this.context!.decodeAudioData(data));}catch{/* Missing audio never blocks the visual opening. */}
   }));
  }catch{/* No remote or generated fallback. */}})();
  return this.preparing;
 }
 async unlock(){try{this.context??=new AudioContext();await this.context.resume();}catch{/* Muted browsers retain the visual flow. */}}
 async start(settings:Settings){
  if(!settings.sound)return null;
  await this.prepare();await this.unlock();
  if(!this.context)return null;
  // Play the complete original cue so its spin and release tail can finish naturally.
  // Motion settings change the visuals, not the user's sound preference.
  const context=this.context,beginning=context.currentTime+.06;
  if(context.state==='suspended'||context.state==='closed'||!this.play('case-opening.mp3',settings.volume,beginning))return null;
  // Drive the reel with the audio render clock, accounting for the output
  // buffer. Suspending the context also freezes the visual timeline.
  const latency=context.outputLatency??context.baseLatency??0;
  return ()=>Math.max(0,(context.currentTime-beginning-latency)*1000);
 }
 private play(name:string,volume:number,when=this.context?.currentTime??0,duration?:number){
  const buffer=this.buffers.get(name);if(!buffer||!this.context)return false;
  const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;
  gain.gain.value=volume*(name==='high-grade-accent.mp3'?.08:1);source.connect(gain);gain.connect(this.context.destination);
  source.start(when,0,duration);source.onended=()=>{source.disconnect();gain.disconnect();this.sources=this.sources.filter(s=>s!==source);};this.sources.push(source);
  return true;
 }
 reveal(grade:number|null,settings:Settings){
  if(!settings.sound)return;
  if(grade!==null&&grade>=8.5)this.play('high-grade-accent.mp3',settings.volume,undefined,grade>=9.5?6:3.5);
 }
 pause(){void this.context?.suspend().catch(()=>{});}
 resume(){void this.context?.resume().catch(()=>{});}
 stop(){for(const source of this.sources){try{source.stop();}catch{/* already ended */}}this.sources=[];}
 dispose(){this.stop();void this.context?.close();}
}
