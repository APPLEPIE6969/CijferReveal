import {REEL_START,STOP_MS,TICK_SECONDS} from './choreography';

export const REEL_DISTANCE=TICK_SECONDS.length;
export const EDGE_OFFSET=.43;
export const SETTLE_MS=240;
export const EDGE_MS=STOP_MS-SETTLE_MS;
const ACCELERATION_MS=160;
export const BRAKE_START=3500;
// Fit the recording's steady tick cadence, rather than following its tiny timing jitter.
const CRUISE_SPEED=.00808;
const cruisePosition=(ms:number)=>CRUISE_SPEED*(ms-REEL_START-ACCELERATION_MS/2);
// [time, card position, velocity in cards/ms]. Decreasing tangents give a
// continuous slowdown through each of the recording's distinct final ticks.
const BRAKE_POINTS=[
 [BRAKE_START,cruisePosition(BRAKE_START),CRUISE_SPEED],
 [3697,25.5,.00645],[3926,26.5,.0033],[4265,27.5,.0026],
 [4684,28.5,.00204],[5308,29.5,.00138],
] as const;
const last=BRAKE_POINTS[BRAKE_POINTS.length-1];
const tailDuration=EDGE_MS-last[0],tailDistance=REEL_DISTANCE+EDGE_OFFSET-last[1];
// Integrate a monotonically decreasing velocity (1-u^k)^2. Solve its area
// once so the final tick lands exactly and the selected edge is reached at rest.
const tailArea=(k:number)=>1-2/(k+1)+1/(2*k+1);
let lo=1,hi=32;
for(let i=0;i<48;i++){const k=(lo+hi)/2;if(tailArea(k)<tailDistance/(last[2]*tailDuration))lo=k;else hi=k;}
const tailPower=(lo+hi)/2;
const smooth=(u:number)=>u*u*u*(u*(u*6-15)+10);

function brakePosition(ms:number){
 for(let i=1;i<BRAKE_POINTS.length;i++){
  const a=BRAKE_POINTS[i-1],b=BRAKE_POINTS[i];if(ms>b[0])continue;
  const dt=b[0]-a[0],u=(ms-a[0])/dt,u2=u*u,u3=u2*u;
  return (2*u3-3*u2+1)*a[1]+(u3-2*u2+u)*dt*a[2]+(-2*u3+3*u2)*b[1]+(u3-u2)*dt*b[2];
 }
 const u=(ms-last[0])/tailDuration,k=tailPower;
 return last[1]+last[2]*tailDuration*(u-2*u**(k+1)/(k+1)+u**(2*k+1)/(2*k+1));
}

/** Brake at the selected card's edge, then settle back inside that same card. */
export function reelProgress(ms:number):number{
 if(ms<=REEL_START)return 0;
 if(ms>=STOP_MS)return REEL_DISTANCE;
 if(ms>=EDGE_MS){
  const u=(ms-EDGE_MS)/SETTLE_MS;
  const offset=u<.72?EDGE_OFFSET+(-.025-EDGE_OFFSET)*smooth(u/.72):-.025*(1-smooth((u-.72)/.28));
  return REEL_DISTANCE+offset;
 }
 const elapsed=ms-REEL_START;
 if(elapsed<ACCELERATION_MS){
  const u=elapsed/ACCELERATION_MS;
  return CRUISE_SPEED*ACCELERATION_MS*(u*u*u-.5*u*u*u*u);
 }
 if(ms<BRAKE_START)return cruisePosition(ms);
 return brakePosition(ms);
}

// Useful for checking the fitted curve against the original recording.
export const REEL_CROSSINGS_MS=Array.from({length:REEL_DISTANCE},(_,index)=>{
 let low=REEL_START,high=EDGE_MS;
 for(let step=0;step<32;step++){const middle=(low+high)/2;if(reelProgress(middle)<index+.5)low=middle;else high=middle;}
 return (low+high)/2;
});

export class ReelEngine {
 private frame=0;private cancelled=false;private lastCross=0;
 constructor(private update:(progress:number)=>void,private stop:()=>void,private crossed:(index:number)=>void=()=>{}){}
 start(clock:()=>number){const tick=()=>{if(this.cancelled)return;const elapsed=clock(),p=reelProgress(elapsed);this.update(p);
 const crossing=Math.floor(p+.5);if(crossing>this.lastCross){this.lastCross=crossing;this.crossed(crossing);}
 if(elapsed>=STOP_MS){this.stop();return;}this.frame=requestAnimationFrame(tick);};this.frame=requestAnimationFrame(tick);}
 cancel(){this.cancelled=true;cancelAnimationFrame(this.frame);}
}
