const PREF_KEY='rafiqChromePrefs';
const NOTEBOOK_KEY='rafiqNotebook';
const PRAYER_KEY='rafiqPrayerConfig';
const LAST_NOTIFY_KEY='rafiqLastPrayerNotification';

async function configurePanel(){
  try{await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true});}catch(e){}
}

function installMenus(){
  chrome.contextMenus.removeAll(()=>{
    chrome.contextMenus.create({id:'rafiq-smart',title:'ابحث بذكاء في رفيق عن: “%s”',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-parent',title:'ابحث في قسم محدد',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-quran',parentId:'rafiq-parent',title:'القرآن',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-sunnah',parentId:'rafiq-parent',title:'رياض الصالحين',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-asma',parentId:'rafiq-parent',title:'أسماء الله الحسنى',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-sep',type:'separator',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-save',title:'احفظ النص في دفتر رفيق',contexts:['selection']});
    chrome.contextMenus.create({id:'rafiq-todo',title:'أضف النص إلى مهام اليوم',contexts:['selection']});
  });
}

chrome.runtime.onInstalled.addListener(async()=>{
  await configurePanel();
  installMenus();
  const {rafiqChromePrefs}=await chrome.storage.local.get(PREF_KEY);
  if(!rafiqChromePrefs) await chrome.storage.local.set({[PREF_KEY]:{badge:true,notifications:false}});
  chrome.alarms.create('rafiq-prayer-tick',{periodInMinutes:1});
  updatePrayerBadge();
});
chrome.runtime.onStartup.addListener(async()=>{
  await configurePanel();
  chrome.alarms.create('rafiq-prayer-tick',{periodInMinutes:1});
  updatePrayerBadge();
});

async function activeTab(){
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  return tab;
}

async function openPanelAndSend(payload){
  const tab=await activeTab();
  if(!tab || tab.id===undefined) return;
  await chrome.storage.session.set({pendingSearch:payload});
  try{await chrome.sidePanel.open({tabId:tab.id});}catch(e){}
  try{await chrome.runtime.sendMessage({type:'RAFIQ_SEARCH',payload});}catch(e){}
}

async function openNotebook(tabId){
  await chrome.storage.session.set({openNotebook:true});
  try{if(tabId!==undefined) await chrome.sidePanel.open({tabId});}catch(e){}
  try{await chrome.runtime.sendMessage({type:'RAFIQ_OPEN_NOTEBOOK'});}catch(e){}
}

chrome.contextMenus.onClicked.addListener(async(info,tab)=>{
  const text=(info.selectionText||'').trim().slice(0,1000);
  if(info.menuItemId==='rafiq-save' && text){
    const data=await chrome.storage.local.get(NOTEBOOK_KEY);
    const list=Array.isArray(data[NOTEBOOK_KEY])?data[NOTEBOOK_KEY]:[];
    list.unshift({
      id:String(Date.now())+'-'+Math.random().toString(36).slice(2,8),
      text,
      title:(tab&&tab.title)||'صفحة ويب',
      url:(tab&&tab.url)||'',
      note:'',
      createdAt:Date.now()
    });
    await chrome.storage.local.set({[NOTEBOOK_KEY]:list.slice(0,500)});
    await openNotebook(tab&&tab.id);
    return;
  }
  if(info.menuItemId==='rafiq-todo' && text){
    const payload={text:text.slice(0,180),ts:Date.now()};
    await chrome.storage.session.set({pendingTodo:payload});
    try{if(tab&&tab.id!==undefined)await chrome.sidePanel.open({tabId:tab.id});}catch(e){}
    try{await chrome.runtime.sendMessage({type:'RAFIQ_ADD_TODO',payload});}catch(e){}
    return;
  }
  const target={
    'rafiq-smart':'smart',
    'rafiq-quran':'quran',
    'rafiq-sunnah':'sunnah',
    'rafiq-asma':'asma'
  }[info.menuItemId];
  if(!target || !text || !tab || tab.id===undefined) return;
  const payload={target,query:text.slice(0,300),ts:Date.now()};
  await chrome.storage.session.set({pendingSearch:payload});
  try{await chrome.sidePanel.open({tabId:tab.id});}catch(e){}
  try{await chrome.runtime.sendMessage({type:'RAFIQ_SEARCH',payload});}catch(e){}
});

chrome.omnibox.setDefaultSuggestion({description:'ابحث في رفيق: <match>%s</match>'});
chrome.omnibox.onInputEntered.addListener(async text=>{
  const query=(text||'').trim();
  if(!query) return;
  await openPanelAndSend({target:'smart',query:query.slice(0,300),ts:Date.now()});
});

chrome.commands.onCommand.addListener(async command=>{
  if(command==='open-rafiq-search'){
    const tab=await activeTab();
    if(!tab||tab.id===undefined)return;
    await chrome.storage.session.set({focusRafiqSearch:true});
    try{await chrome.sidePanel.open({tabId:tab.id});}catch(e){}
    try{await chrome.runtime.sendMessage({type:'RAFIQ_FOCUS_SEARCH'});}catch(e){}
  }
  if(command==='open-rafiq-notebook'){
    const tab=await activeTab();
    await openNotebook(tab&&tab.id);
  }
  if(command==='open-rafiq-plan'){
    const tab=await activeTab();
    if(!tab||tab.id===undefined)return;
    await chrome.storage.session.set({openDailyPlan:true});
    try{await chrome.sidePanel.open({tabId:tab.id});}catch(e){}
    try{await chrome.runtime.sendMessage({type:'RAFIQ_OPEN_PLAN'});}catch(e){}
  }
});

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg&&msg.type==='RAFIQ_PRAYER_CONFIG'){
    chrome.storage.local.set({[PRAYER_KEY]:msg.payload||{}}).then(()=>updatePrayerBadge());
  }
  if(msg&&msg.type==='RAFIQ_PREFS_CHANGED'){
    chrome.storage.local.set({[PREF_KEY]:msg.payload||{badge:true,notifications:false}}).then(()=>updatePrayerBadge());
  }
});

chrome.alarms.onAlarm.addListener(alarm=>{
  if(alarm.name==='rafiq-prayer-tick') updatePrayerBadge(true);
});

const METHODS={EGYPT:{fajr:19.5,isha:17.5},MAKKAH:{fajr:18.5,isha:'90 min'},MWL:{fajr:18,isha:17},KARACHI:{fajr:18,isha:18},ISNA:{fajr:15,isha:15}};
const dtr=d=>d*Math.PI/180, rtd=r=>r*180/Math.PI;
const fixA=a=>{a=a-360*Math.floor(a/360);return a<0?a+360:a};
const fixH=a=>{a=a-24*Math.floor(a/24);return a<0?a+24:a};
function julian(y,m,d){if(m<=2){y-=1;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(jd){const D=jd-2451545.0,g=fixA(357.529+0.98560028*D),q=fixA(280.459+0.98564736*D),L=fixA(q+1.915*Math.sin(dtr(g))+0.020*Math.sin(dtr(2*g))),e=23.439-0.00000036*D,RA=fixH(rtd(Math.atan2(Math.cos(dtr(e))*Math.sin(dtr(L)),Math.cos(dtr(L))))/15);return{decl:rtd(Math.asin(Math.sin(dtr(e))*Math.sin(dtr(L)))),eqt:q/15-RA}}
function computeTimes(date,lat,lng,method,asrF){
  const jd=julian(date.getFullYear(),date.getMonth()+1,date.getDate())-lng/(15*24),tz=-date.getTimezoneOffset()/60,M=METHODS[method]||METHODS.EGYPT;
  const midDay=t=>fixH(12-sunPos(jd+t/24).eqt);
  const angleTime=(ang,t,ccw)=>{const d=sunPos(jd+t/24).decl,x=(-Math.sin(dtr(ang))-Math.sin(dtr(d))*Math.sin(dtr(lat)))/(Math.cos(dtr(d))*Math.cos(dtr(lat)));if(x>1||x<-1)return NaN;const h=rtd(Math.acos(x))/15;return midDay(t)+(ccw?-h:h)};
  const asrTime=(f,t)=>{const d=sunPos(jd+t/24).decl,ang=-rtd(Math.atan(1/(f+Math.tan(Math.abs(dtr(lat)-dtr(d))))));return angleTime(ang,t,false)};
  const sunrise=angleTime(0.833,6,true),sunset=angleTime(0.833,18,false),fajr=angleTime(M.fajr,5,true),dhuhr=midDay(12),asr=asrTime(asrF,13),isha=typeof M.isha==='string'?sunset+parseInt(M.isha,10)/60:angleTime(M.isha,18,false);
  const adj=t=>isNaN(t)?NaN:fixH(t+tz-lng/15);
  return{fajr:adj(fajr),dhuhr:adj(dhuhr)+1/60,asr:adj(asr),maghrib:adj(sunset)+1/60,isha:adj(isha)};
}
function atDate(base,hour){let h=Math.floor(hour),m=Math.round((hour-h)*60);if(m===60){m=0;h++}const d=new Date(base);d.setHours(h%24,m,0,0);return d}
function fmtTime(d){return new Intl.DateTimeFormat('ar-EG',{hour:'numeric',minute:'2-digit'}).format(d)}

async function updatePrayerBadge(allowNotify=false){
  const data=await chrome.storage.local.get([PREF_KEY,PRAYER_KEY,LAST_NOTIFY_KEY]);
  const prefs=data[PREF_KEY]||{badge:true,notifications:false},cfg=data[PRAYER_KEY]||{};
  if(!cfg.lat || !cfg.lng){
    await chrome.action.setBadgeText({text:''});
    return;
  }
  const now=new Date(), T=computeTimes(now,+cfg.lat,+cfg.lng,cfg.method||'EGYPT',+(cfg.asr||1));
  const names={fajr:'الفجر',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
  const order=['fajr','dhuhr','asr','maghrib','isha'];
  const prayers=order.map(k=>({key:k,name:names[k],at:atDate(now,T[k])})).filter(x=>!isNaN(x.at));
  let next=prayers.find(x=>x.at>now);
  if(!next){
    const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);
    const TT=computeTimes(tomorrow,+cfg.lat,+cfg.lng,cfg.method||'EGYPT',+(cfg.asr||1));
    next={key:'fajr',name:'الفجر',at:atDate(tomorrow,TT.fajr)};
  }
  const mins=Math.max(0,Math.round((next.at-now)/60000));
  const badge=mins<60?`${mins}د`:`${Math.floor(mins/60)}س`;
  if(prefs.badge){
    await chrome.action.setBadgeText({text:badge});
    await chrome.action.setBadgeBackgroundColor({color:'#3F5C34'});
    await chrome.action.setTitle({title:`رفيق يومك — ${next.name} بعد ${mins<60?mins+' دقيقة':Math.floor(mins/60)+' س '+mins%60+' د'} · ${fmtTime(next.at)}`});
  }else{
    await chrome.action.setBadgeText({text:''});
    await chrome.action.setTitle({title:'فتح رفيق يومك'});
  }

  if(allowNotify && prefs.notifications){
    const current=prayers.find(x=>now>=x.at && now-x.at<120000);
    if(current){
      const stamp=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}:${current.key}`;
      if(data[LAST_NOTIFY_KEY]!==stamp){
        const has=await chrome.permissions.contains({permissions:['notifications']});
        if(has){
          chrome.notifications.create(`prayer-${stamp}`,{
            type:'basic',iconUrl:'icons/icon-128.png',title:`حان وقت صلاة ${current.name}`,
            message:'حيّ على الصلاة — افتح رفيق لمواقيت اليوم ومحاسبة الصلاة.',priority:1
          });
          await chrome.storage.local.set({[LAST_NOTIFY_KEY]:stamp});
        }
      }
    }
  }
}
