from pathlib import Path
import subprocess, imageio_ffmpeg, numpy as np, json
from mutagen.mp3 import MP3
ff=imageio_ffmpeg.get_ffmpeg_exe()
report=[]
for source,name in [(next(Path('assets').glob('cs2*'),Path('assets/case-opening.mp3')),'case-opening.mp3'),(next(Path('assets').glob('jackpot*'),Path('assets/high-grade-accent.mp3')),'high-grade-accent.mp3')]:
 target=source.parent/name
 if source!=target:subprocess.run([ff,'-y','-i',str(source),'-map_metadata','-1','-c:a','copy',str(target)],capture_output=True,check=True)
 raw=subprocess.run([ff,'-i',str(target),'-f','f32le','-ac','1','-ar','22050','pipe:1'],capture_output=True,check=True).stdout
 samples=np.frombuffer(raw,np.float32);hop=220
 rms=np.array([np.sqrt(np.mean(samples[i:i+hop]**2)) for i in range(0,len(samples),hop)])
 # Short local maxima, with 70ms refractory period; inspect late sustained impact separately.
 peaks=[]
 for i in range(2,len(rms)-2):
  if rms[i]>max(rms[i-2:i]) and rms[i]>=max(rms[i+1:i+3]) and rms[i]>.025:
   t=i*hop/22050
   if not peaks or t-peaks[-1][0]>.07:peaks.append((round(t,3),round(float(rms[i]),4)))
 info=MP3(target)
 report.append({'file':name,'duration':info.info.length,'rate':info.info.sample_rate,'channels':info.info.channels,'peaks':peaks,'rms_100ms':[round(float(np.mean(rms[i:i+10])),4) for i in range(0,len(rms),10)]})
 assert not info.tags or all(k.startswith('TSSE') for k in info.tags.keys())
 if source!=target:source.unlink()
Path('scripts/audio-analysis.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
