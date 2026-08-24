#!/usr/bin/env python3
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
SOURCES=[
 ('knowledge.json','العلم','sunnah'),('prophet-stories.json','قصص الأنبياء','sunnah'),('quran-stories.json','قصص القرآن','sunnah'),('aqeedah.json','العقيدة','sunnah'),('fiqh-life.json','فقه الحياة','sunnah'),('fiqh-busola.json','فقه البوصلة','sunnah'),('tajweed.json','التجويد','sunnah'),('hadith-sciences.json','علوم الحديث','sunnah'),('nawawi40.json','الأربعون النووية','sunnah'),('riyad.json','رياض الصالحين','sunnah'),('agreed-hadith.json','اللؤلؤ والمرجان','sunnah'),('seerah.json','السيرة','sunnah'),('companions.json','الصحابة','sunnah'),('islamic-history.json','التاريخ','sunnah'),('akhlaq.json','الأخلاق','sunnah'),('adab.json','الآداب','sunnah'),('digital-life.json','الحياة الرقمية','sunnah'),('qawaid-fiqh.json','القواعد الفقهية','sunnah'),('usul-fiqh.json','أصول الفقه','sunnah'),('usul-tafsir.json','أصول التفسير','sunnah'),
 ('qalb.json','التزكية','qalb'),('manazil-sairin.json','منازل السائرين','qalb'),('suwiya-mumin.json','سوية المؤمن','qalb'),('ishkaliat.json','إشكاليات','qalb'),
 ('azkar.json','الأذكار','azkar'),('adiya.json','الدعاء','dua'),('asma.json','أسماء الله الحسنى','asma')
]
TEXT_KEYS=('subtitle','sub','lead','summary','description','meaning','impact','text','answer','explain','practice','note')

def entry_text(v):
    return ' '.join(v[k] for k in TEXT_KEYS if isinstance(v.get(k),str))

def walk(v,meta,path=(),out=None):
    if out is None: out=[]
    if v is None or len(path)>8:return out
    if isinstance(v,list):
        for i,x in enumerate(v):walk(x,meta,path+(str(i),),out)
        return out
    if not isinstance(v,dict):return out
    keys=list(v)
    is_source=bool((v.get('u') or v.get('url') or v.get('href')) and len(keys)<=4 and not v.get('items') and not v.get('points') and not v.get('steps'))
    title=v.get('title') or v.get('name') or v.get('q') or ''
    if not title and isinstance(v.get('t'),str) and len(v['t'])<=150:title=v['t']
    if isinstance(title,str) and title.strip() and not is_source:
        snippet=entry_text(v).strip()
        if snippet or v.get('id') or v.get('items') or v.get('points') or v.get('steps'):
            subkind=''
            if 'obstacles' in path:subkind='obstacles'
            elif 'problems' in path:subkind='problems'
            elif 'works' in path:subkind='works'
            elif 'nafs' in path:subkind='nafs'
            out.append({'title':title.strip()[:180],'snippet':snippet[:260],'group':meta[1],'dest':meta[2],'subkind':subkind,'file':meta[0]})
    for k,x in v.items():
        if k in ('sources','source','meta','methodology') and len(path)>1:continue
        walk(x,meta,path+(k,),out)
    return out

items=[]
for meta in SOURCES:
    p=ROOT/meta[0]
    if not p.exists():continue
    data=json.loads(p.read_text(encoding='utf-8'))
    items.extend(walk(data,meta))
seen=set();out=[]
for x in items:
    key=x['group']+'|'+x['title']
    if key in seen:continue
    seen.add(key);out.append(x)
path=ROOT/'search-index.json'
path.write_text(json.dumps({'version':1,'entries':out},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print(f'search-index.json: {len(out)} entries, {path.stat().st_size/1024:.1f} KiB')
