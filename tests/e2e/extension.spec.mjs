import {test,expect,chromium} from '@playwright/test';
import {resolve} from 'node:path';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const hash=(...parts)=>createHash('sha256').update(JSON.stringify(parts)).digest('hex');
const clickAXButton=async(cdp,name)=>{const {nodes}=await cdp.send('Accessibility.getFullAXTree');const node=nodes.find(n=>!n.ignored&&n.role?.value==='button'&&n.name?.value===name&&n.backendDOMNodeId);if(!node)throw new Error(`Accessible button not found: ${name}`);const resolved=await cdp.send('DOM.resolveNode',{backendNodeId:node.backendDOMNodeId});await cdp.send('Runtime.callFunctionOn',{objectId:resolved.object.objectId,functionDeclaration:'function(){this.click();}',returnByValue:true});};
// Measure the landing at the phase change, while the exiting reel still exists.
// Locator polling after the reveal can miss its short exit on slower CI hosts.
const captureLanding=async page=>page.evaluate(()=>{
 window.fixtureLandingOffset=null;const overlay=document.querySelector('.po-opening-overlay');
 const observer=new MutationObserver(()=>{if(!overlay.classList.contains('po-phase-result'))return;
  const marker=document.querySelector('.po-marker'),target=document.querySelector('[data-target-folio="true"]');
  if(marker&&target){const a=marker.getBoundingClientRect(),b=target.getBoundingClientRect();window.fixtureLandingOffset=Math.abs(a.left+a.width/2-b.left-b.width/2);}
  observer.disconnect();
 });observer.observe(overlay,{attributes:true,attributeFilter:['class']});
});
const inventoryShadow=async cdp=>{const {result}=await cdp.send('Runtime.evaluate',{expression:"document.querySelector('.po-inventory-host')",returnByValue:false});if(!result.objectId)throw new Error('Inventory host was not found');const {node}=await cdp.send('DOM.describeNode',{objectId:result.objectId,depth:-1,pierce:true});const shadow=node.shadowRoots?.[0];if(!shadow?.backendNodeId)throw new Error(`Inventory shadow root was not found on ${node.nodeName}`);return (await cdp.send('DOM.resolveNode',{backendNodeId:shadow.backendNodeId})).object.objectId;};
const inventoryEval=async(cdp,fn,arg)=>{const objectId=await inventoryShadow(cdp),result=await cdp.send('Runtime.callFunctionOn',{objectId,functionDeclaration:`function(arg){return (${fn.toString()})(this,arg)}`,arguments:arg===undefined?[]:[{value:arg}],returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text??'Inventory evaluation failed');return result.result.value;};
const readInventory=cdp=>inventoryEval(cdp,function(root){const page=root.querySelector('.po-inventory-page');if(!page)return null;return{title:page.querySelector('h1')?.textContent?.trim(),heading:page.querySelector('h2')?.textContent?.trim(),values:[...page.querySelectorAll('.po-grade-card-value')].map(n=>n.textContent.trim()),cardCount:page.querySelectorAll('.po-inventory-card').length,text:page.innerText};});
const salt='0'.repeat(64),scope=hash(salt,'account','fixture-student');
const raw={ $type:'resultaten.RGeldendVoortgangsdossierResultaat',links:[{rel:'self',id:'fixture-result-a',type:'resultaten.RGeldendVoortgangsdossierResultaat'}],formattedResultaat:'8,3',isCijfer:true,isLabel:false,additionalObjects:{vaknaam:'Wiskunde A',vakuuid:'fixture-subject',resultaatkolom:{type:'fixture-individual'}},omschrijving:'Hoofdstuk 3',datumInvoerEerstePoging:'2026-10-04T10:00:00+02:00',weging:2,periode:1,toetscode:'H3'};
const key=hash(salt,scope,'progression','fixture-result-a'),version=hash(salt,'version','8,3','2','Hoofdstuk 3',raw.datumInvoerEerstePoging,'1','H3','fixture-individual',raw.$type,'Wiskunde A','fixture-subject','true','false','false');
const display={key,version,subject:'Wiskunde A',description:'Hoofdstuk 3',date:raw.datumInvoerEerstePoging,weight:'2',value:'8,3',grade:8.3};
const observedRecord={id:'fixture-result-a',selfType:'resultaten.RGeldendVoortgangsdossierResultaat',family:'progression',value:'8,3',isCijfer:true,isLabel:false,aggregate:false,subject:'Wiskunde A',subjectId:'fixture-subject',description:'Hoofdstuk 3',date:'2026-10-04T10:00:00+02:00',weight:'2',period:'1',testCode:'H3',columnType:'fixture-individual'};
const opened=(id,value,grade,subject,description,openedAt)=>({key:id.repeat(64),version:id.toLowerCase().repeat(64),scope,subject,description,date:'2026-09-29T10:00:00+02:00',weight:grade===8.3?'2':'1',value,grade,openedAt});
const card=`<sl-laatste-resultaat-item role="button"><sl-resultaat-item><div class="root" role="text" aria-label="Wiskunde A cijfer 8,3"><div class="details"><div class="titel">Wiskunde A</div><div class="subtitel">4 okt · Hoofdstuk 3</div></div><div class="wegingcijfer"><span class="weging">2x</span><div class="cijfer"><span>8,3</span></div></div></div></sl-resultaat-item></sl-laatste-resultaat-item>`;
const html=`<!doctype html><html lang="nl"><meta charset="UTF-8"><style>body{margin:0;background:#f4f7fa;font:16px system-ui;color:#21314b}sl-tab-bar{display:flex;gap:24px;padding:0 24px;background:white}sl-tab{display:flex;align-items:center;min-height:56px;padding:0 12px;color:#435267;cursor:pointer}sl-tab[aria-selected="true"]{color:#1d2b3b;border-top:2px solid #3275c6;border-bottom:2px solid #3275c6}sl-cijfers{display:block;margin:40px auto;max-width:900px}sl-laatste-resultaat-item{display:block}.root{display:flex;align-items:center;justify-content:space-between;background:white;padding:24px;border-radius:12px}.po-safe-native{margin:16px 0}.titel{font-weight:600}.subtitel{color:#647188;margin-top:6px}</style><sl-tab-bar role="tablist"><sl-tab role="tab" data-path="/rooster">Rooster</sl-tab><sl-tab role="tab" data-path="/studiewijzer">Studiewijzer</sl-tab><sl-tab role="tab" data-path="/cijfers" aria-selected="true" tabindex="0">Cijfers</sl-tab><sl-tab role="tab" data-path="/berichten">Berichten</sl-tab></sl-tab-bar><sl-root></sl-root><script>window.fixtureCard=${JSON.stringify(card)};window.mount=async()=>{document.querySelector('sl-root').innerHTML='<sl-home><sl-cijfers><h1>Cijfers</h1><sl-laatsteresultaten></sl-laatsteresultaten></sl-cijfers></sl-home>';await fetch('/rest/v1/geldendvoortgangsdossierresultaten/leerling/fixture-student');document.querySelector('sl-laatsteresultaten').innerHTML=window.fixtureCard;window.initialVisibility=getComputedStyle(document.querySelector('sl-laatste-resultaat-item')).display;};document.querySelectorAll('sl-tab-bar sl-tab').forEach(tab=>tab.onclick=e=>{const path=tab.getAttribute('data-path');history.pushState({},'',path);document.querySelectorAll('sl-tab-bar sl-tab').forEach(item=>{item.setAttribute('aria-selected',String(item===tab));if(item!==tab)item.removeAttribute('tabindex');else item.tabIndex=0;});if(path==='/cijfers')window.mount();else document.querySelector('sl-root').innerHTML='<sl-home><p>Rooster</p></sl-home>';});window.addEventListener('popstate',()=>location.pathname==='/cijfers'?window.mount():document.querySelector('sl-root').replaceChildren());setTimeout(window.mount,180);</script></html>`;
const fixtureHtml=html.replace('</style>',`:root{--bg-base:#1b1f22;--bg-elevated-weak:#252b2f;--border-weak:#3b444b;--text-base:#e2e6e9;--text-muted:#aeb8c0;color-scheme:dark}body{background:var(--bg-base);color:var(--text-base);font-family:"Open Sans",sans-serif}.fixture-header{display:flex;align-items:center;height:64px;padding:0 24px;background:#20262a;font-size:20px;font-weight:600}sl-tab-bar{gap:12px;background:var(--bg-elevated-weak);overflow-x:auto}sl-tab{color:var(--text-muted);flex-shrink:0}sl-tab[aria-selected="true"]{color:var(--text-base);border-color:#80b5ed}sl-cijfers{max-width:1180px;margin:24px auto}.root{background:var(--bg-elevated-weak)}.subtitel{color:var(--text-muted)}@media(max-width:600px){sl-tab-bar{gap:0;padding:0 8px}sl-tab{padding:0 8px}} </style>`).replace('<sl-tab-bar role="tablist">','<header class="fixture-header">SOMtoday</header><sl-tab-bar role="tablist">');
async function launch(seed=false,build='dist',stars=false,variant=null){
 const dir=await mkdtemp(resolve(tmpdir(),'po-extension-'));
 const context=await chromium.launchPersistentContext(dir,{channel:'chromium',headless:true,args:[`--disable-extensions-except=${resolve(build)}`,`--load-extension=${resolve(build)}`]});
 let worker=context.serviceWorkers()[0];if(!worker)worker=await context.waitForEvent('serviceworker');
 const id=worker.url().split('/')[2];
 if(seed)await worker.evaluate(async data=>{await chrome.storage.local.set({poState:data});},{schema:2,salt,records:{[key]:{key,scope,version,state:'pending',numeric:true,firstSeen:1,display}},coverage:{[scope]:{overview:true,subject:true,armed:true}},collection:[],settings:{sound:false,volume:.7,motion:'system'}});
 await context.route('https://leerling.somtoday.nl/**',route=>{const url=route.request().url();return route.fulfill({status:200,contentType:url.includes('/rest/')?'application/json':'text/html',body:url.includes('/rest/')?JSON.stringify({items:[raw]}):fixtureHtml});});
 if(stars){
 const starRaw={...raw,formattedResultaat:'*',links:[{rel:'self',id:1234567890123,type:raw.$type}]},second={...starRaw,links:[{rel:'self',id:1234567890124,type:raw.$type}],omschrijving:'Hoofdstuk 4'};
 const starCard=card.replaceAll('8,3','*'),starHtml=fixtureHtml.replace(JSON.stringify(card),JSON.stringify(starCard+starCard.replaceAll('Hoofdstuk 3','Hoofdstuk 4'))).replace("fetch('/rest/v1/","fetch('https://api.somtoday.nl/rest/v1/");
 await context.route('https://leerling.somtoday.nl/**',route=>route.fulfill({status:200,contentType:route.request().url().includes('/rest/')?'application/json':'text/html',body:route.request().url().includes('/rest/')?JSON.stringify({items:[starRaw,second]}):starHtml}));
 await context.route('https://api.somtoday.nl/**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'https://leerling.somtoday.nl'},body:JSON.stringify({items:[starRaw,second]})}));
 if(seed){const starKey=hash(salt,scope,'progression','1234567890123');const starVersion=hash(salt,'version','*','2','Hoofdstuk 3',raw.datumInvoerEerstePoging,'1','H3','fixture-individual',raw.$type,'Wiskunde A','fixture-subject','true','false','false');await worker.evaluate(async data=>{await chrome.storage.local.set({poState:data});},{schema:2,salt,records:{[starKey]:{key:starKey,scope,version:starVersion,state:'observed-nonnumeric',numeric:false,firstSeen:1}},coverage:{},collection:[],settings:{sound:false,volume:.7,motion:'reduce'}});}
 }
 if(variant){
  let body=fixtureHtml.replace(JSON.stringify(card),JSON.stringify(variant.card)).replaceAll('fixture-student',variant.student);
  if(variant.subject)body=body.replaceAll('sl-laatsteresultaten','sl-vakresultaten');
  if(variant.exam)body=body.replaceAll('geldendvoortgangsdossierresultaten','geldendexamendossierresultaten');
  await context.route('https://leerling.somtoday.nl/**',route=>route.fulfill({status:200,contentType:route.request().url().includes('/rest/')?'application/json':'text/html',body:route.request().url().includes('/rest/')?JSON.stringify({items:[variant.raw]}):body}));
 }
 const page=await context.newPage();await page.goto('https://leerling.somtoday.nl/cijfers');
 return {page,context,worker,id,dispose:async()=>{await context.close();await rm(dir,{recursive:true,force:true});}};
}
test('fresh install masks a numeric grade but offers its matching pack; SPA/remount/mobile/portals',async()=>{
 const f=await launch();try{await expect(f.page.locator('.po-safe-native')).toBeVisible();expect(await f.page.evaluate(()=>window.initialVisibility)).not.toBe('none');await expect(f.page.locator('sl-resultaat-item .root')).toBeVisible();await expect(f.page.locator('sl-resultaat-item .cijfer')).toHaveCSS('visibility','visible');await expect(f.page.locator('sl-resultaat-item .cijfer')).toHaveText('?');await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();
 await f.page.getByRole('tab',{name:'Rooster',exact:true}).click();await f.page.getByRole('tab',{name:'Cijfers',exact:true}).click();await expect(f.page.locator('sl-laatste-resultaat-item')).toBeVisible();await expect(f.page.locator('.po-safe-native')).toBeVisible();
 await f.page.goBack();await f.page.goForward();await expect(f.page.locator('.po-safe-native')).toBeVisible();
 await f.page.setViewportSize({width:390,height:844});await f.page.evaluate(()=>{const modal=document.createElement('sl-modal');modal.innerHTML='<div role="dialog"><button>Sluiten</button><sl-resultaat-item-detail class="in-modal"><span class="cijfer">8,3</span></sl-resultaat-item-detail></div>';document.body.append(modal);const tip=document.createElement('hmy-tooltip');tip.className='hmy-tooltip';tip.textContent='Toets 8,3';document.body.append(tip);document.querySelector('sl-cijfers').insertAdjacentHTML('beforeend','<sl-cijfer-overzicht><table><tr><td class="cijfer" aria-label="8,3">8,3</td></tr></table></sl-cijfer-overzicht><sl-vakresultaten><sl-vakresultaat-item aria-label="8,3"><sl-resultaat-item>8,3</sl-resultaat-item></sl-vakresultaat-item><div class="gemiddelde-wrapper" aria-label="Rapportcijfer 8,3">8,3</div></sl-vakresultaten><sl-vakgemiddelde-item-cijfer aria-label="8,3">8,3</sl-vakgemiddelde-item-cijfer>');});
 for(const selector of ['sl-resultaat-item-detail','hmy-tooltip','td.cijfer','sl-vakgemiddelde-item-cijfer','.gemiddelde-wrapper','sl-vakresultaat-item'])await expect(f.page.locator(selector)).toBeHidden();
 const cdp=await f.context.newCDPSession(f.page);const ax=await cdp.send('Accessibility.getFullAXTree');expect(ax.nodes.filter(n=>!n.ignored&&n.name?.value?.includes('8,3'))).toHaveLength(0);
 }finally{await f.dispose();}
});
test('retry reloads SOMtoday so a transient grade-card mismatch can be observed again',async()=>{
 const f=await launch();try{await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();await f.page.evaluate(()=>{document.querySelector('sl-laatste-resultaat-item .subtitel').textContent='4 okt · Nog niet geladen';});await expect(f.page.getByText('Cijfer nog niet gekoppeld')).toBeVisible();const navigation=f.page.waitForNavigation();await f.page.getByRole('button',{name:'Pagina opnieuw laden'}).click();await navigation;await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();}finally{await f.dispose();}
});
test('seeded validated fixture opens only after stop, persists, and reloads without another pack',async()=>{
 const f=await launch(true);try{await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();await f.page.locator('.po-safe-native').hover();await f.page.getByRole('button',{name:'Open cijfer'}).click();
 // Closed Shadow DOM inspected through the accessibility tree; no private extension APIs.
 const cdp=await f.context.newCDPSession(f.page);
 await clickAXButton(cdp,'Open Cijfer');
 const beamState=async()=>{const tree=await cdp.send('DOM.getDocument',{depth:-1,pierce:true});const find=node=>{const attrs=node.attributes??[];if(attrs.includes('po-mystery-beam')&&attrs.includes('data-active'))return node;for(const child of [...(node.children??[]),...(node.shadowRoots??[])]){const match=find(child);if(match)return match;}return null;};const node=find(tree.root);if(!node)return null;const resolved=await cdp.send('DOM.resolveNode',{backendNodeId:node.backendNodeId});const read=await cdp.send('Runtime.callFunctionOn',{objectId:resolved.object.objectId,functionDeclaration:'function(){const s=getComputedStyle(this);return {angle:s.getPropertyValue("--po-beam-angle"),opacity:Number(s.getPropertyValue("--po-beam-opacity"))};}',returnByValue:true});return read.result.value;};
 await expect.poll(async()=> (await beamState())?.opacity??0).toBeGreaterThan(.05);const before=await beamState();await f.page.waitForTimeout(100);expect((await beamState())?.angle).not.toBe(before.angle);
 const readAX=async()=>{const r=await cdp.send('Accessibility.getFullAXTree');return r.nodes.filter(n=>!n.ignored).map(n=>n.name?.value??'').join('\n');};expect(await readAX()).not.toContain('8,3');
 await expect.poll(async()=>{const s=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);return s.records[key]?.state;},{timeout:12000}).toBe('opened');
 await expect.poll(readAX,{timeout:12000}).toContain('Cijfer 8,3');const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);expect(saved.collection).toHaveLength(1);await expect.poll(readAX).toContain('Terug naar SOMtoday');
 await clickAXButton(cdp,'Terug naar SOMtoday');await expect(f.page.locator('.po-opening-overlay')).toHaveCount(0);
 await f.page.reload();await expect(f.page.locator('.po-safe-native')).toContainText('8,3');await expect(f.page.locator('sl-resultaat-item .cijfer')).toHaveCSS('visibility','visible');await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(0);
 await f.page.getByRole('tab',{name:'Inventaris',exact:true}).click();expect(await readAX()).toContain('Hoofdstuk 3');
 }finally{await f.dispose();}
});

test('fresh install can open a uniquely matched numeric result and saves the real grade',async()=>{
 const f=await launch();try{await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();await f.page.locator('.po-safe-native').hover();await f.page.getByRole('button',{name:'Open cijfer'}).click();const cdp=await f.context.newCDPSession(f.page),readAX=async()=>{const tree=await cdp.send('Accessibility.getFullAXTree');return tree.nodes.filter(node=>!node.ignored).map(node=>node.name?.value??'').join('\n');};await clickAXButton(cdp,'Open Cijfer');await expect.poll(readAX,{timeout:12000}).toContain('Cijfer 8,3');await expect.poll(async()=> (await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState)).collection.length).toBe(1);const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);expect(saved.collection[0]).toMatchObject({value:'8,3',grade:8.3});}finally{await f.dispose();}
});

test('another learner on a fresh install can open a subject exam grade with different decimal and weight notation',async()=>{
 const type='resultaten.RGeldendExamendossierResultaat',student='another-fixture-student';
 const different={...raw,$type:type,links:[{rel:'self',id:9876543210123,type}],formattedResultaat:'6.75',omschrijving:'',weging:1,datumInvoerEerstePoging:'2026-09-29T10:00:00+02:00',additionalObjects:{vaknaam:'Engels',vakuuid:'other-fixture-subject',resultaatkolom:{type:'school-specific-column'}}};
 const otherCard=card.replaceAll('sl-laatste-resultaat-item','sl-vakresultaat-item').replaceAll('Wiskunde A','Engels').replaceAll('8,3','6,75').replaceAll('4 okt · Hoofdstuk 3','29 sep.').replaceAll('2x','1,0 ×');
 const f=await launch(false,'dist',false,{student,raw:different,card:otherCard,subject:true,exam:true});
 try{
  await expect(f.page.locator('sl-vakresultaat-item')).toBeVisible();await expect(f.page.locator('.cijfer')).toHaveText('?');await expect(f.page.getByRole('button',{name:'Open cijfer'})).toBeVisible();
  await f.page.locator('.po-safe-native').hover();await f.page.getByRole('button',{name:'Open cijfer'}).click();const cdp=await f.context.newCDPSession(f.page);await clickAXButton(cdp,'Open Cijfer');
  await expect.poll(async()=> (await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState)).collection.length,{timeout:12000}).toBe(1);
  const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);
  expect(saved.collection[0]).toMatchObject({value:'6.75',grade:6.75,subject:'Engels',scope:hash(saved.salt,'account',student)});
  expect(saved.collection[0].key).toBe(hash(saved.salt,hash(saved.salt,'account',student),'exam','9876543210123'));
 }finally{await f.dispose();}
});

test('a numeric grade arriving after installation receives its own open button and survives reload',async()=>{
 const f=await launch();try{
  await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(1);
  const published={...raw,links:[{rel:'self',id:'fixture-new-result',type:raw.$type}],formattedResultaat:'7,2',omschrijving:'Nieuwe toets'};
  const newCard=card.replaceAll('8,3','7,2').replaceAll('Hoofdstuk 3','Nieuwe toets');
  await f.context.route('**/rest/v1/geldendvoortgangsdossierresultaten/leerling/fixture-student',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({items:[raw,published]})}));
  await f.context.route('https://leerling.somtoday.nl/cijfers',route=>route.fulfill({status:200,contentType:'text/html',body:fixtureHtml.replace(JSON.stringify(card),JSON.stringify(card+newCard))}));
  await f.page.evaluate(async nextCard=>{window.fixtureCard+=nextCard;await window.mount();},newCard);
  await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(2);
  const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);
  expect(Object.values(saved.records).find(r=>r.display?.description==='Nieuwe toets')).toMatchObject({state:'pending',display:{value:'7,2',grade:7.2}});
  await f.page.reload();await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(2);
 }finally{await f.dispose();}
});

test('an opened star becoming a numeric grade can be opened again without resetting local data',async()=>{
 const f=await launch(true,'dist',true);try{
  await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(2);await f.page.locator('.po-safe-native').first().hover();await f.page.getByRole('button',{name:'Open cijfer'}).first().click();
  const cdp=await f.context.newCDPSession(f.page),readAX=async()=> (await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n=>!n.ignored).map(n=>n.name?.value??'').join('\n');
  await clickAXButton(cdp,'Open Cijfer');await expect.poll(readAX).toContain('Cijfer *');await clickAXButton(cdp,'Terug naar SOMtoday');
  const first={...raw,formattedResultaat:'6,8',links:[{rel:'self',id:1234567890123,type:raw.$type}]},second={...first,formattedResultaat:'*',links:[{rel:'self',id:1234567890124,type:raw.$type}],omschrijving:'Hoofdstuk 4'};
  await f.context.route('https://api.somtoday.nl/**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'https://leerling.somtoday.nl'},body:JSON.stringify({items:[first,second]})}));
  await f.page.evaluate(async()=>{await fetch('https://api.somtoday.nl/rest/v1/geldendvoortgangsdossierresultaten/leerling/fixture-student');document.querySelector('sl-resultaat-item .cijfer span').textContent='6,8';});
  await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(2);await expect(f.page.locator('sl-resultaat-item .cijfer span').first()).toHaveText('?');
  await f.page.locator('.po-safe-native').first().hover();await f.page.getByRole('button',{name:'Open cijfer'}).first().click();await clickAXButton(cdp,'Open Cijfer');await expect.poll(readAX).toContain('Cijfer 6,8');
  const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);expect(saved.collection.map(r=>r.value)).toEqual(['*','6,8']);
 }finally{await f.dispose();}
});
test('desktop and mobile fixture visuals, full reel and reduced motion',async({page})=>{
 await mkdir('.impeccable/review',{recursive:true});await page.goto('http://127.0.0.1:5173/tester.html');await page.getByRole('button',{name:'Test opening',exact:true}).click();await expect(page.locator('.po-preview')).toBeVisible();await expect(page.locator('.po-preview')).not.toContainText('8,9');await expect(page.locator('.po-opening-overlay')).toHaveCSS('opacity','1');await expect(page.locator('.po-preview')).toHaveCSS('opacity','1');const previewTilt=page.locator('.po-preview .po-tilt');const previewBox=await previewTilt.boundingBox();await page.mouse.move(previewBox.x+previewBox.width*.75,previewBox.y+previewBox.height*.25);await expect(previewTilt).toHaveClass(/po-is-hover/);await page.screenshot({path:'.impeccable/review/desktop-preview.png'});await page.keyboard.press('Enter');await expect(page.locator('.po-lane')).toBeVisible();await expect(page.locator('.po-track [data-beam]')).toHaveCount(44);await expect(page.locator('.po-mystery-grade').first()).toContainText(/\d/);await expect(page.locator('.po-opening-overlay')).toHaveCSS('opacity','1');await page.waitForTimeout(850);await expect.poll(()=>page.locator('[data-beam][data-active]').count()).toBeGreaterThan(0);const reelBox=await page.locator('.po-lane').boundingBox();expect(reelBox.height).toBeGreaterThan(330);await page.screenshot({path:'.impeccable/review/desktop-reel.png'});await expect(page.locator('.po-grade')).toHaveText('8,9',{timeout:10000});await expect(page.locator('.po-result')).toHaveCSS('opacity','1');const tilt=page.locator('.po-tilt');const box=await tilt.boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.2);await expect(tilt).toHaveClass(/po-is-hover/);await page.waitForTimeout(450);await page.screenshot({path:'.impeccable/review/desktop.png'});await page.getByRole('button',{name:'Terug naar SOMtoday'}).click();await page.setViewportSize({width:390,height:844});await page.getByLabel('Verminder beweging').check();await page.getByRole('button',{name:'Test opening',exact:true}).click();await expect(page.getByRole('button',{name:'Open Cijfer',exact:true})).toBeVisible();await expect(page.locator('.po-opening-overlay')).toHaveCSS('opacity','1');await expect(page.locator('.po-preview')).toHaveCSS('opacity','1');await page.screenshot({path:'.impeccable/review/mobile-preview.png'});await page.keyboard.press('Enter');await expect(page.locator('.po-grade')).toHaveText('8,9');await expect(page.locator('.po-result')).toHaveCSS('opacity','1');await page.screenshot({path:'.impeccable/review/mobile.png'});await expect(page.locator('.po-lane')).toHaveCount(0);
});

test('star is visible on its real reel card and lands at center without a second reveal',async({page})=>{
 await page.goto('http://127.0.0.1:5173/tester.html');await page.getByLabel('Cijfer').selectOption('*');await page.getByRole('button',{name:'Test opening',exact:true}).click();await page.getByRole('button',{name:'Open Cijfer',exact:true}).click();const lane=page.locator('.po-lane');await expect(lane).toBeVisible();await expect(page.locator('[data-target-folio="true"] .po-mystery-grade')).toHaveText('*');await expect(lane.locator('.po-mystery-grade').first()).toContainText(/\d/);await expect(page.locator('.po-grade')).toHaveCount(0);await captureLanding(page);await expect(page.locator('.po-grade')).toHaveText('*',{timeout:9000});const offset=await page.evaluate(()=>window.fixtureLandingOffset);expect(offset).toBeLessThan(1);await expect(page.locator('.po-grade')).toHaveText('*',{timeout:5000});await expect(page.locator('.po-grade')).toHaveAttribute('aria-label','Cijfer *');await expect(page.locator('.po-grade .po-digit-strip')).toHaveCount(0);
});

test('inventory is a native tab, protects only its route content, filters opened grades and survives browser history',async()=>{
 const f=await launch(true);try{
 const state=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState),entries=[opened('a','8,3',8.3,'Wiskunde A','Hoofdstuk 3',300),opened('b','5,8',5.8,'Engels','Essay',100),opened('c','*',null,'Bedrijfseconomie','Toets geldzaken',200)];
 const pendingKey='d'.repeat(64),pendingVersion='e'.repeat(64);state.records={[pendingKey]:{key:pendingKey,scope,version:pendingVersion,state:'pending',numeric:true,firstSeen:1,display:{...display,key:pendingKey,version:pendingVersion,value:'9,9',grade:9.9}}};state.collection=entries;await f.worker.evaluate(async s=>chrome.storage.local.set({poState:s}),state);
 await f.page.evaluate(({scope,record})=>window.postMessage({protocol:'po/1',surface:'recent',scope,records:[record],complete:false},location.origin),{scope,record:observedRecord});
 // Exercise a shell with the native header and tabs nested in the route,
 // which the former whole-route display:none strategy hid entirely.
 await expect(f.page.locator('sl-cijfers')).toBeVisible();
 await f.page.evaluate(()=>{const route=document.querySelector('sl-cijfers'),main=document.createElement('main');main.className='fixture-content';main.style.gridArea='content';main.append(...route.children);route.append(main);route.style.display='grid';route.style.gridTemplateAreas='"header" "tabs" "content"';const bar=document.querySelector('sl-tab-bar'),header=document.querySelector('.fixture-header');bar.style.gridArea='tabs';header.style.gridArea='header';route.prepend(bar);route.prepend(header);});
 const button=f.page.getByRole('tab',{name:'Inventaris',exact:true});await expect(button).toBeVisible();expect(await f.page.getByRole('tab',{name:'Inventaris'}).count()).toBe(1);await button.click();
 const cdp=await f.context.newCDPSession(f.page),host=f.page.locator('.po-inventory-host');await expect(host).toBeVisible();await expect(button).toHaveAttribute('aria-selected','true');await expect(f.page.locator('sl-cijfers')).toBeVisible();await expect(f.page.locator('.fixture-content')).toBeVisible();await expect(f.page.locator('sl-laatsteresultaten')).toBeHidden();await expect(f.page.locator('.fixture-header')).toBeVisible();await expect(f.page.getByRole('tab',{name:'Rooster',exact:true})).toBeVisible();expect(await host.evaluate(n=>n.parentElement.className)).toBe('fixture-content');
 const view=await readInventory(cdp);expect(view).toMatchObject({title:'Inventaris',values:['8,3','*','5,8'],cardCount:3});expect(view.text).toContain('7,1');expect(view.text).toContain('8,3');expect(view.text).not.toContain('9,9');expect(view.text).not.toContain('veilig bewaard');expect(await f.page.locator('sl-cijfers').getAttribute('aria-hidden')).toBeNull();
 expect(await inventoryEval(cdp,function(root){const page=root.querySelector('.po-inventory-page');return{scheme:getComputedStyle(page).colorScheme,background:getComputedStyle(page).backgroundColor};})).toEqual({scheme:'dark',background:'rgb(27, 31, 34)'});
 await inventoryEval(cdp,function(root){const select=root.querySelector('.po-inventory-controls select');select.value='Engels';select.dispatchEvent(new Event('change',{bubbles:true}));});await expect.poll(()=>readInventory(cdp)).toMatchObject({values:['5,8'],cardCount:1});await inventoryEval(cdp,function(root){const select=root.querySelector('.po-inventory-controls select');select.value='';select.dispatchEvent(new Event('change',{bubbles:true}));});await expect.poll(()=>readInventory(cdp)).toMatchObject({cardCount:3});
 await inventoryEval(cdp,function(root){root.querySelector('.po-inventory-card').click();});await expect.poll(()=>inventoryEval(cdp,function(root){const dialog=root.querySelector('.po-grade-detail');return{open:dialog.open,title:dialog.querySelector('h2')?.textContent?.trim(),details:dialog.innerText};})).toMatchObject({open:true,title:'8,3'});await expect.poll(()=>inventoryEval(cdp,function(root){return root.querySelector('.po-grade-detail').innerText;})).toContain('Geopend');await f.page.keyboard.press('Escape');await expect.poll(()=>inventoryEval(cdp,function(root){return root.querySelector('.po-grade-detail').open;})).toBe(false);
 await f.page.waitForTimeout(850);
 await f.page.screenshot({path:'.impeccable/review/inventory.png'});
 await f.page.setViewportSize({width:390,height:844});await expect(f.page.locator('.fixture-header')).toBeVisible();await expect(button).toBeVisible();expect(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await f.page.screenshot({path:'.impeccable/review/inventory-mobile.png'});await f.page.setViewportSize({width:1280,height:720});
 // Return the synthetic shell to its persistent fixture location before the
 // fixture replaces sl-root on history navigation (Angular keeps its real shell).
 await f.page.evaluate(()=>{document.body.prepend(document.querySelector('sl-tab-bar'));document.body.prepend(document.querySelector('.fixture-header'));});
 await f.page.goBack();await expect(host).toHaveCount(0);
 await button.focus();await f.page.keyboard.press('ArrowRight');await expect(f.page.getByRole('tab',{name:'Berichten',exact:true})).toHaveAttribute('aria-selected','true');await expect(host).toHaveCount(0);await expect(f.page.locator('sl-root')).toContainText('Rooster');
 }finally{await f.dispose();}
});

test('inventory empty state contains no sample grades and returns to Cijfers',async()=>{
 const f=await launch(true);try{await f.page.evaluate(({scope,record})=>window.postMessage({protocol:'po/1',surface:'recent',scope,records:[record],complete:false},location.origin),{scope,record:observedRecord});const tab=f.page.getByRole('tab',{name:'Inventaris',exact:true});await expect(tab).toBeVisible();await tab.click();const host=f.page.locator('.po-inventory-host'),cdp=await f.context.newCDPSession(f.page);await expect(host).toBeVisible();await expect.poll(()=>readInventory(cdp)).toMatchObject({heading:'Nog geen geopende cijfers',cardCount:0});await inventoryEval(cdp,function(root){root.querySelector('button').click();});await expect(host).toHaveCount(0);await expect(f.page.locator('sl-cijfers')).toBeVisible();}finally{await f.dispose();}
});

test('development document-start diagnostic emits only stage/timing/component/visibility/route',async()=>{
 const f=await launch(false,'dist-dev');try{
 await expect(f.page.locator('.po-safe-native')).toBeVisible();
 const report=await f.worker.evaluate(async()=>{const tabs=await chrome.tabs.query({url:'https://leerling.somtoday.nl/*'});return chrome.tabs.sendMessage(tabs[0].id,{protocol:'po/diagnostics'});});
 expect(report.status,JSON.stringify(report)).toBe('success');expect(report.entries.some(e=>e.stage==='static-css')).toBe(true);expect(report.entries.some(e=>e.stage==='owner-mount')).toBe(true);expect(report.entries.some(e=>e.stage==='classification')).toBe(true);expect(report.entries.some(e=>e.stage==='safe-presentation')).toBe(true);
 expect(JSON.stringify(report)).not.toContain('8,3');expect(JSON.stringify(report)).not.toContain('fixture-result');expect(JSON.stringify(report)).not.toContain('Wiskunde');
 }finally{await f.dispose();}
});

test('two stars including a legacy observed record open, reveal stars and persist on reload',async()=>{
 const f=await launch(true,'dist',true);try{
 await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(2);
 await f.page.locator('.po-safe-native').first().hover();await f.page.getByRole('button',{name:'Open cijfer'}).first().click();
 const cdp=await f.context.newCDPSession(f.page);const readAX=async()=>{const r=await cdp.send('Accessibility.getFullAXTree');return r.nodes.filter(n=>!n.ignored).map(n=>n.name?.value??'').join('\n');};
 await clickAXButton(cdp,'Open Cijfer');await expect.poll(readAX).toContain('Cijfer *');
 const ax=await cdp.send('Accessibility.getFullAXTree');const next=ax.nodes.find(n=>!n.ignored&&n.role?.value==='button'&&n.name?.value==='Volgende openen');expect(next).toBeTruthy();const resolved=await cdp.send('DOM.resolveNode',{backendNodeId:next.backendDOMNodeId});await cdp.send('Runtime.callFunctionOn',{objectId:resolved.object.objectId,functionDeclaration:'function(){this.click();}'});
 await clickAXButton(cdp,'Open Cijfer');
 await expect.poll(async()=> (await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState)).collection.length).toBe(2);
 await expect.poll(readAX).toContain('Cijfer *');
 const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);expect(saved.collection.map(r=>({value:r.value,grade:r.grade}))).toEqual([{value:'*',grade:null},{value:'*',grade:null}]);
 await f.page.reload();await expect(f.page.getByRole('button',{name:'Open cijfer'})).toHaveCount(0);await expect(f.page.locator('sl-resultaat-item .cijfer span')).toHaveText(['*','*']);
 await f.page.getByRole('tab',{name:'Inventaris',exact:true}).click();expect(await readAX()).toContain('*');
 }finally{await f.dispose();}
});

test('popup uses clear local settings, correct pending copy and confirmed reset',async()=>{
 const f=await launch(true);try{
  const popup=await f.context.newPage();await popup.goto(`chrome-extension://${f.id}/popup.html`);
  await expect(popup.getByRole('heading',{name:'Pack Opening voor SOMtoday'})).toBeVisible();
  await expect(popup.locator('.po-popup-count')).toHaveText('1 ongeopend cijfer');
  const sound=popup.getByRole('checkbox',{name:'Geluid'}),motion=popup.getByRole('checkbox',{name:'Verminder beweging'});
  await expect(sound).not.toBeChecked();await sound.check();await motion.check();
  await expect.poll(async()=>f.worker.evaluate(async()=>{const s=(await chrome.storage.local.get('poState')).poState;return [s.settings.sound,s.settings.motion];})).toEqual([true,'reduce']);
  await popup.getByText('Instellingen en gegevens').click();await popup.getByRole('button',{name:'Extensie opnieuw instellen'}).click();
  await expect(popup.getByText('Alle lokale gegevens wissen? De baseline wordt opnieuw opgebouwd.')).toBeVisible();
  await popup.getByRole('button',{name:'Annuleren'}).click();
  const saved=await f.worker.evaluate(async()=> (await chrome.storage.local.get('poState')).poState);expect(saved.records[key].state).toBe('pending');
 }finally{await f.dispose();}
});



test('mobile landing respects its CSS gap and Enter advances into the next subject preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/tester.html');
 await page.getByLabel('Cijfer').selectOption('*');await page.getByLabel('Aantal').fill('2');
 await page.getByRole('button',{name:'Test opening',exact:true}).click();await expect(page.getByRole('button',{name:'Open Cijfer',exact:true})).toBeVisible();await page.keyboard.press('Enter');
 await expect(page.locator('.po-lane')).toBeVisible();await captureLanding(page);
 await expect(page.locator('.po-grade')).toHaveText('*',{timeout:9000});
 const offset=await page.evaluate(()=>window.fixtureLandingOffset);
 expect(offset).toBeLessThan(1);await expect(page.locator('.po-grade')).toHaveText('*');
 await page.keyboard.press('Enter');await expect(page.locator('.po-preview h2')).toHaveText('Nederlands');await expect(page.locator('.po-preview .po-grade')).toHaveCount(0);
 await page.keyboard.press('Escape');await expect(page.locator('.po-opening-overlay')).toHaveCount(0);
});
