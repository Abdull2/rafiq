const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'app/qalb.json'),'utf8'));
const ish=JSON.parse(fs.readFileSync(path.join(root,'app/ishkaliat.json'),'utf8'));
const expected=['ikhlas','mahabba','tawakkul','khawf','sabr','shukr','tawba','muraqaba','yaqeen'];
const ids=d.works.map(x=>x.id);
if(JSON.stringify(ids)!==JSON.stringify(expected)) throw new Error('works IDs/order changed');

const seen=new Set();
let topics=0,itemsChecked=0;
function depthKey(x){return x.depthId||x.id}
function validateTopic(x,label){
  const key=depthKey(x); if(!key)throw new Error(`${label}: missing depth key`);
  if(seen.has(key))throw new Error(`${label}: duplicate depth key ${key}`); seen.add(key);
  if(!Array.isArray(x.levels)||x.levels.length!==4)throw new Error(`${label}: expected 4 levels`);
  const ns=x.levels.map(l=>l.n).join(',');if(ns!=='1,2,3,4')throw new Error(`${label}: bad level numbers ${ns}`);
  if(x.levels.some(l=>l.pending))throw new Error(`${label}: pending level leaked`);
  for(const lv of x.levels){
    if(!lv.title?.trim())throw new Error(`${label}: level ${lv.n} missing title`);
    const lvHasText=!!lv.tx?.trim(); const lvHasSource=!!lv.s?.t?.trim();
    if(lv.s?.u&&!/^https:\/\//.test(lv.s.u))throw new Error(`${label}: level ${lv.n} non-https source`);
    const arr=lv.items||[];
    if(lvHasText&&!lvHasSource&&arr.length===0)throw new Error(`${label}: level ${lv.n} text has no visible source`);
    for(const [i,it] of arr.entries()){
      itemsChecked++;
      if(!it.t?.trim())throw new Error(`${label}: level ${lv.n} item ${i} empty`);
      if(!it.s?.t?.trim())throw new Error(`${label}: level ${lv.n} item ${i} missing visible source`);
      if(it.s.u&&!/^https:\/\//.test(it.s.u))throw new Error(`${label}: level ${lv.n} item ${i} non-https source`);
    }
  }
  topics++;
}
for(const w of d.works)validateTopic(w,`work:${w.id}`);
for(const p of d.problems){if(p.depthId!==`problem:${p.id}`)throw new Error(`${p.id}: bad problem depthId`);validateTopic(p,`problem:${p.id}`)}
for(const n of d.nafs){if(n.depthId!==`nafs:${n.id}`)throw new Error(`${n.id}: bad nafs depthId`);validateTopic(n,`nafs:${n.id}`)}
let obstacleCount=0;
for(const c of d.obstacles)for(const it of c.items||[]){obstacleCount++;if(it.depthId!==`obstacle:${c.id}:${it.id}`||it.depthParent!==c.id)throw new Error(`${c.id}/${it.id}: bad obstacle depth identity`);validateTopic(it,`obstacle:${c.id}:${it.id}`)}
for(const it of ish.items||[]){if(it.depthId!==`ish:${it.id}`)throw new Error(`${it.id}: bad ish depthId`);validateTopic(it,`ish:${it.id}`)}

const app=fs.readFileSync(path.join(root,'app/app.js'),'utf8');
for(const must of ["qalb-levels-v1","data-lvreview","data-depth-open","تقدّم في الدراسة والفهم، لا رتبة إيمانية","hDepthParseToken","hDepthRender","hDepthContinueHtml(N,'nafs')","hDepthContinueHtml(allItems,'obstacles')"]){
  if(!app.includes(must))throw new Error(`app.js missing ${must}`);
}
if(!app.includes("await store.set('qalb-levels-v1',hLevels)"))throw new Error('levels persistence missing');
console.log('PASS: Tazkiyah depth coverage',JSON.stringify({works:d.works.length,problems:d.problems.length,nafs:d.nafs.length,obstacleItems:obstacleCount,ishkaliat:ish.items.length,topics,itemsChecked}));
