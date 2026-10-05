import {build} from 'vite';
import {readFile,writeFile,mkdir,copyFile,readdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {zipSync} from 'fflate';
const dev=process.argv.includes('--dev'),out=resolve(dev?'dist-dev':'dist');
await mkdir(out,{recursive:true});
// Only remove the known build directory, never the workspace.
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
const define={'import.meta.env.DEV':JSON.stringify(dev),'import.meta.env.PROD':JSON.stringify(!dev),'process.env.NODE_ENV':JSON.stringify('production')};
for(const [name,entry] of [['observer','src/page/network-observer.ts'],['content','src/content/bootstrap.ts'],['worker','src/state/worker.ts']])await build({configFile:false,define,publicDir:false,build:{outDir:out,emptyOutDir:false,sourcemap:false,minify:true,lib:{entry:resolve(entry),name:`PO_${name}`,formats:['iife'],fileName:()=>`${name}.js`},rollupOptions:{onwarn(warning,warn){if(warning.code!=='MODULE_LEVEL_DIRECTIVE')warn(warning);},output:{inlineDynamicImports:true}}}});
await build({configFile:false,define,publicDir:false,base:'./',build:{outDir:out,emptyOutDir:false,sourcemap:false,rollupOptions:{onwarn(warning,warn){if(warning.code!=='MODULE_LEVEL_DIRECTIVE')warn(warning);},input:dev?['popup.html','tester.html']:['popup.html']}}});
const manifest=JSON.parse(await readFile('manifest.json','utf8'));
if(dev)manifest.name+=' · ontwikkeling';
await writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));await copyFile('src/spoiler/shield.css',`${out}/shield.css`);await mkdir(`${out}/assets`,{recursive:true});
for(const name of ['case-opening.mp3','high-grade-accent.mp3'])await copyFile(`assets/${name}`,`${out}/assets/${name}`);
if(!dev){
 const files={};
 const collect=async(directory,prefix='')=>{for(const entry of await readdir(directory,{withFileTypes:true})){const name=prefix+entry.name,path=resolve(directory,entry.name);if(entry.isDirectory())await collect(path,`${name}/`);else files[name]=new Uint8Array(await readFile(path));}};
 await collect(out);await writeFile('pack-opening-voor-somtoday.zip',zipSync(files,{level:6}));
}
console.log(`Built ${out} (${(await readdir(out)).length} top-level entries)`);
