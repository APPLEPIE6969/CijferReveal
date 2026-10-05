import {readFile,writeFile,copyFile,readdir,mkdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {unzipSync} from 'fflate';

const [tag,outputDirectory]=process.argv.slice(2);
if(!tag||!outputDirectory||!/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag))throw new Error('Gebruik een stabiele release-tag zoals v1.2.3 en geef een uitvoermap op.');
const version=tag.slice(1),manifest=JSON.parse(await readFile('manifest.json','utf8'));
if(manifest.version!==version)throw new Error(`Manifestversie ${manifest.version} komt niet overeen met releasetag ${tag}.`);
if(process.env.GITHUB_SHA){
 const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const tagged=execFileSync('git',['rev-parse',`${process.env.GITHUB_REF}^{commit}`],{encoding:'utf8'}).trim();
 if(head!==process.env.GITHUB_SHA||tagged!==process.env.GITHUB_SHA)throw new Error('De build komt niet van de exacte commit van de releasetag.');
}
const dist=resolve('dist'),distManifest=JSON.parse(await readFile(join(dist,'manifest.json'),'utf8'));
if(distManifest.version!==version)throw new Error(`De gebouwde extensie heeft versie ${distManifest.version}, verwacht ${version}.`);
const zipPath=resolve('pack-opening-voor-somtoday.zip'),zipBytes=await readFile(zipPath),entries=unzipSync(new Uint8Array(zipBytes));
const expected=[];
async function collect(folder,prefix=''){
 for(const entry of await readdir(folder,{withFileTypes:true})){
  const name=prefix+entry.name,path=join(folder,entry.name);
  if(entry.isDirectory())await collect(path,`${name}/`);else expected.push(name);
 }
}
await collect(dist);
if(JSON.stringify(Object.keys(entries).sort())!==JSON.stringify(expected.sort()))throw new Error('De productie-ZIP bevat niet exact de bestanden uit dist.');
for(const name of expected){
 const built=await readFile(join(dist,name));
 if(!Buffer.from(entries[name]).equals(built))throw new Error(`Bestand in ZIP wijkt af van dist: ${name}`);
}
const packagedManifest=JSON.parse(new TextDecoder().decode(entries['manifest.json']));
if(packagedManifest.version!==version)throw new Error(`De ZIP bevat manifestversie ${packagedManifest.version}, verwacht ${version}.`);
const changelog=await readFile('CHANGELOG.md','utf8'),lines=changelog.split(/\r?\n/),section=lines.findIndex(line=>new RegExp(`^## Versie ${version.replaceAll('.','\\.')}\\b`).test(line));
if(section<0)throw new Error(`Geen Nederlandstalige CHANGELOG-sectie gevonden voor ${version}.`);
const notes=[];
for(let i=section+1;i<lines.length&&!/^##\s/.test(lines[i]);i++)notes.push(lines[i]);
const noteText=notes.join('\n').trim();if(!noteText)throw new Error(`De CHANGELOG-sectie voor ${version} is leeg.`);
await mkdir(outputDirectory,{recursive:true});
const finalZip=join(resolve(outputDirectory),'CijferReveal.zip');
await copyFile(zipPath,finalZip);
const finalEntries=unzipSync(new Uint8Array(await readFile(finalZip)));
if(JSON.parse(new TextDecoder().decode(finalEntries['manifest.json'])).version!==version)throw new Error('De uiteindelijke CijferReveal.zip heeft de verkeerde manifestversie.');
await writeFile(join(resolve(outputDirectory),'release-notes.md'),`${noteText}\n`,'utf8');

const developerDirectories=(await readdir('.',{withFileTypes:true}))
 .filter(entry=>entry.isDirectory()&&entry.name.startsWith(`dist-developer-${version}-`))
 .map(entry=>entry.name);
if(!developerDirectories.length)throw new Error('De developer build ontbreekt. Voer eerst npm run build:developer uit.');
const developerDirectory=developerDirectories.map(name=>({name,path:resolve(name)}));
const newest=await Promise.all(developerDirectory.map(async entry=>({ ...entry,stat:await stat(entry.path) })));
newest.sort((a,b)=>b.stat.mtimeMs-a.stat.mtimeMs);
const devDir=newest[0].path,devArchiveName=`pack-opening-voor-somtoday-developer-${version}.zip`;
const devArchive=join(devDir,devArchiveName),devEntries=unzipSync(new Uint8Array(await readFile(devArchive)));
const devManifest=JSON.parse(new TextDecoder().decode(devEntries['manifest.json']));
if(devManifest.version!==version||!devManifest.name.includes(`Developer ${version}`))throw new Error('De developer-ZIP heeft niet de verwachte versie of naam.');
for(const name of ['manifest.json','observer.js','content.js','worker.js','shield.css','popup.html','tester.html','assets/case-opening.mp3','assets/high-grade-accent.mp3']){
 if(!(name in devEntries))throw new Error(`Developer-ZIP mist benodigd bestand: ${name}`);
}
const actualDevFiles=[];
async function collectDeveloper(folder,prefix=''){
 for(const entry of await readdir(folder,{withFileTypes:true})){
  const name=prefix+entry.name,path=join(folder,entry.name);
  if(entry.isDirectory())await collectDeveloper(path,`${name}/`);
  else if(name!==devArchiveName)actualDevFiles.push(name);
 }
}
await collectDeveloper(devDir);
if(JSON.stringify(Object.keys(devEntries).sort())!==JSON.stringify(actualDevFiles.sort()))throw new Error('De developer-ZIP bevat niet exact de developer-buildbestanden.');
for(const name of actualDevFiles){
 const built=await readFile(join(devDir,name));
 if(!Buffer.from(devEntries[name]).equals(built))throw new Error(`Bestand in developer-ZIP wijkt af van de build: ${name}`);
}
if(!('tester.html'in devEntries))throw new Error('Dit lijkt geen developer build.');
const finalDevZip=join(resolve(outputDirectory),`zzz-developer-debug-build-${version}.zip`);
await copyFile(devArchive,finalDevZip);
const packagedDevManifest=JSON.parse(new TextDecoder().decode(unzipSync(new Uint8Array(await readFile(finalDevZip)))['manifest.json']));
if(packagedDevManifest.version!==version)throw new Error('De uiteindelijke developer-ZIP heeft de verkeerde versie.');
console.log(`Releasepakket gecontroleerd: ${tag}, productie- en developerbuild.`);
