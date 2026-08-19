const fs=require('fs');
const qalbPath='app/qalb.json';
const ishPath='app/ishkaliat.json';
const q=JSON.parse(fs.readFileSync(qalbPath,'utf8'));
const clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
const src=x=>clone(x||null);
const itemFrom=x=>({t:x.t||'',s:src(x.s||x.source)});

for(const p of q.problems||[]){
  const list=(p.causes||p.fruits||[]).map(itemFrom);
  const steps=(p.cure||p.means||[]).map(x=>({t:[x.t,x.d].filter(Boolean).join(' — '),s:src(x.s||x.source)}));
  p.depthId=`problem:${p.id}`;
  p.depthType='problem';
  p.levels=[
    {n:1,title:'التعريف والفهم',tx:p.def||'',s:src(p.defSource),items:[]},
    {n:2,title:'الأسباب والجذور',tx:'افهم ما يغذي هذا الباب قبل الانتقال إلى العلاج. كل سبب تحته مرجعه الظاهر.',items:list},
    {n:3,title:'في القرآن والسنة',tx:p.proof||'ارجع إلى الأصل الشرعي الذي يضبط فهم هذا الباب.',s:src(p.proofSource),items:[]},
    {n:4,title:'العلاج العملي',tx:'حوّل الفهم إلى خطوات عملية من المحتوى الموثق نفسه. المتابعة تقيس ما سجّلته من عمل، لا صلاح القلب.',items:steps}
  ];
}

for(const it of q.nafs||[]){
  it.depthId=`nafs:${it.id}`;
  it.depthType='nafs';
  const qs=(it.questions||[]).map(x=>({t:x,s:src(it.questionsSource)}));
  const steps=(it.steps||[]).map(x=>({t:[x.t,x.d].filter(Boolean).join(' — '),s:src(x.s||x.source)}));
  it.levels=[
    {n:1,title:'افهم الفكرة',tx:it.summary||'',s:src(it.summarySource),items:[]},
    {n:2,title:'ما الذي يحدث في النفس؟',tx:it.psych||'',s:src(it.psychSource),items:[]},
    {n:3,title:'البوصلة الإيمانية',tx:it.iman||'',s:src(it.imanSource),items:[]},
    {n:4,title:'أسئلة وتطبيق',tx:'راجع الأسئلة ثم اختر خطوة عملية مناسبة. هذا تثقيف وتنظيم ذاتي، وليس تشخيصًا أو علاجًا طبيًا.',items:[...qs,...steps]}
  ];
}

for(const cat of q.obstacles||[]){
  for(const it of cat.items||[]){
    it.depthId=`obstacle:${cat.id}:${it.id}`;
    it.depthType='obstacle';
    it.depthParent=cat.id;
    const why=(it.why||[]).map(itemFrom);
    const steps=(it.steps||[]).map(x=>({t:[x.t,x.d].filter(Boolean).join(' — '),s:src(x.s||x.source)}));
    it.levels=[
      {n:1,title:'حدّد الموقف',tx:it.q||'',s:src(it.answerSource),items:[]},
      {n:2,title:'لماذا قد يحدث؟',tx:'افهم الاحتمالات الموثقة قبل أن تحكم على نفسك أو على غيرك.',items:why},
      {n:3,title:'الجواب والبوصلة',tx:it.answer||'',s:src(it.answerSource),items:[]},
      {n:4,title:'خطوات التجاوز',tx:'اختر خطوة قابلة للتطبيق من التوجيهات الموثقة، ثم راجع أثرها في «مساري» إن كانت هذه مشكلتك الحالية.',items:steps}
    ];
  }
}
fs.writeFileSync(qalbPath,JSON.stringify(q,null,2)+'\n');

const ish=JSON.parse(fs.readFileSync(ishPath,'utf8'));
function timedSource(it,p,label){
  const sec=Math.max(0,+p.sec||0); const at=p.at||'00:00';
  const join=it.video.includes('?')?'&':'?';
  return {t:`${label||it.title} — ${at}`,u:`${it.video}${join}t=${sec}s`};
}
for(const it of ish.items||[]){
  it.depthId=`ish:${it.id}`;
  it.depthType='ish';
  const pts=it.points||[];
  const first=pts.slice(0,2).map(p=>({t:`${p.title}: ${p.text}`,s:timedSource(it,p,it.title)}));
  const rest=pts.slice(2).map(p=>({t:`${p.title}: ${p.text}`,s:timedSource(it,p,it.title)}));
  const introSrc=timedSource(it,{at:it.introAt||'00:00',sec:it.introSec||0},it.title);
  it.levels=[
    {n:1,title:'الفكرة العامة',tx:it.intro||'',s:introSrc,items:[]},
    {n:2,title:'المحاور الأولى',tx:'ابدأ بالمحاور الأولى مع الرجوع إلى توقيتها في المحاضرة الأصلية.',items:first},
    {n:3,title:'التعمّق في المحاور',tx:'أكمل بقية المحاور، وكل ملخص تحته رابط السياق الأصلي من توقيته.',items:rest},
    {n:4,title:'العودة للسياق الكامل',tx:'بعد قراءة الملخصات، ارجع إلى المحاضرة الأصلية كاملة قبل بناء حكم أو نقل الفكرة.',s:{t:`المحاضرة الأصلية — ${it.title}`,u:it.video},items:[]}
  ];
}
fs.writeFileSync(ishPath,JSON.stringify(ish,null,2)+'\n');
console.log('R24_ALL_TAZKIYAH_DEPTH_BUILT',JSON.stringify({problems:q.problems.length,works:q.works.length,obstacleItems:q.obstacles.reduce((n,c)=>n+(c.items||[]).length,0),nafs:q.nafs.length,ish:ish.items.length}));
