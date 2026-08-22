#!/usr/bin/env python3
from __future__ import annotations
import json, re, sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[1]
FAIL=[]; WARN=[]; STATS={}

REQUIRED=['index.html','app.js','version.js','storage.js','data-safety.js','diagnostics.js','pwa-register.js','sw.js','manifest.webmanifest','quran.json','azkar.json','qalb.json','sources.html','privacy.html','tasbih.html']
for name in REQUIRED:
    if not (ROOT/name).is_file(): FAIL.append(f'missing required file: {name}')

# JSON validity and sibling-id uniqueness
json_files=sorted(ROOT.glob('*.json'))+[ROOT/'manifest.webmanifest']
source_urls=[]
content_objects=0
for path in json_files:
    try: data=json.loads(path.read_text(encoding='utf-8'))
    except Exception as e: FAIL.append(f'{path.name}: invalid JSON: {e}'); continue
    def walk(v,p='$'):
        nonlocal_dummy=None
        global content_objects
        if isinstance(v,list):
            ids={}
            for i,item in enumerate(v):
                if isinstance(item,dict) and isinstance(item.get('id'),(str,int)):
                    ident=str(item['id'])
                    if ident in ids: FAIL.append(f'{path.name}: duplicate sibling id {ident!r} at {p}[{ids[ident]}] and {p}[{i}]')
                    else: ids[ident]=i
                walk(item,f'{p}[{i}]')
        elif isinstance(v,dict):
            if any(k in v for k in ('title','text','t','lead','meaning','summary')): content_objects+=1
            for k,val in v.items():
                lk=k.lower()
                if lk in ('url','u','href','sourceurl','catalogurl','detailurl','expansionurl','repository','crosscheckurl','canonicalbookurl') and isinstance(val,str) and val.startswith(('http://','https://')):
                    source_urls.append((path.name,p+'.'+k,val))
                walk(val,p+'.'+k)
    walk(data)

for file,p,u in source_urls:
    if u.startswith('http://'): FAIL.append(f'{file}: insecure source URL at {p}: {u}')
    try:
        parsed=urlparse(u)
        if parsed.scheme!='https' or not parsed.netloc: FAIL.append(f'{file}: invalid external URL at {p}: {u}')
    except Exception: FAIL.append(f'{file}: malformed URL at {p}: {u}')
STATS['external_source_urls']=len(source_urls)
STATS['content_like_objects']=content_objects

class RefParser(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]; self.blank=[]; self.ids=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'): self.ids.append(d['id'])
        for key in ('src','href'):
            v=d.get(key)
            if v: self.refs.append((tag,key,v))
        if tag=='a' and d.get('target')=='_blank': self.blank.append(d)

for html in ROOT.glob('*.html'):
    parser=RefParser()
    try: parser.feed(html.read_text(encoding='utf-8'))
    except Exception as e: FAIL.append(f'{html.name}: HTML parse failed: {e}'); continue
    for tag,key,ref in parser.refs:
        if ref.startswith(('#','mailto:','tel:','data:','javascript:','https://')): continue
        clean=ref.split('#',1)[0].split('?',1)[0]
        if clean.startswith('./'): clean=clean[2:]
        if clean and not (ROOT/clean).exists(): FAIL.append(f'{html.name}: missing local {key} target {ref}')
    for d in parser.blank:
        rel=set((d.get('rel') or '').split())
        if 'noopener' not in rel: WARN.append(f'{html.name}: target=_blank without noopener: {d.get("href","")[:100]}')
    seen=set()
    for ident in parser.ids:
        if ident in seen: FAIL.append(f'{html.name}: duplicate HTML id {ident!r}')
        seen.add(ident)

# Manifest local references
try:
    m=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
    refs=[]
    for x in m.get('icons',[]): refs.append(x.get('src'))
    for x in m.get('screenshots',[]): refs.append(x.get('src'))
    for x in m.get('shortcuts',[]):
        refs.append(x.get('url'))
        refs.extend(i.get('src') for i in x.get('icons',[]))
    for ref in filter(None,refs):
        clean=ref.split('#',1)[0].split('?',1)[0].removeprefix('./')
        if clean and not (ROOT/clean).exists(): FAIL.append(f'manifest: missing local target {ref}')
except Exception as e: FAIL.append(f'manifest parse: {e}')

# Local fetch references in JS
for js in ROOT.glob('*.js'):
    text=js.read_text(encoding='utf-8')
    for ref in re.findall(r"fetch\(\s*['\"](\./[^'\"]+)['\"]",text):
        clean=ref.split('?',1)[0][2:]
        if not (ROOT/clean).exists(): FAIL.append(f'{js.name}: fetches missing local file {ref}')

# Release invariants
version=(ROOT/'version.js').read_text(encoding='utf-8') if (ROOT/'version.js').exists() else ''
for needle in ["appVersion:'24.58.0'","release:'R58'","dataSchema:3"]:
    if needle not in version: FAIL.append(f'version.js missing invariant {needle}')
sw_text=(ROOT/'sw.js').read_text(encoding='utf-8')
if "importScripts('./version.js')" not in sw_text: FAIL.append('sw.js does not import centralized version metadata')
install_body=sw_text.split("self.addEventListener('install'",1)[1].split("self.addEventListener('activate'",1)[0] if "self.addEventListener('install'" in sw_text else ''
if 'skipWaiting()' in install_body: FAIL.append('sw.js must not force skipWaiting during install; updates are opt-in')
if './version.js' not in (ROOT/'index.html').read_text(encoding='utf-8'): FAIL.append('index.html does not load version.js')
if './storage.js' not in (ROOT/'index.html').read_text(encoding='utf-8'): FAIL.append('index.html does not load storage.js')


# Release manifest integrity
try:
    rel=json.loads((ROOT/'release-manifest.json').read_text(encoding='utf-8'))
    import hashlib
    if rel.get('appVersion')!='24.58.0' or rel.get('release')!='R58': FAIL.append('release-manifest version mismatch')
    for name,meta in rel.get('files',{}).items():
        fp=ROOT/name
        if not fp.is_file(): FAIL.append(f'release-manifest references missing file {name}'); continue
        raw=fp.read_bytes()
        if len(raw)!=meta.get('bytes'): FAIL.append(f'release-manifest size mismatch: {name}')
        if hashlib.sha256(raw).hexdigest()!=meta.get('sha256'): FAIL.append(f'release-manifest hash mismatch: {name}')
except Exception as e: FAIL.append(f'release-manifest validation failed: {e}')

# Security basics
idx=(ROOT/'index.html').read_text(encoding='utf-8')
if 'Content-Security-Policy' not in idx: FAIL.append('index.html missing Content-Security-Policy')
if 'object-src \'none\'' not in idx: FAIL.append('CSP must block object-src')

print('Tadaruq static validation')
print(f'JSON files: {len(json_files)} | source URLs: {STATS["external_source_urls"]} | content-like objects: {STATS["content_like_objects"]}')
for w in WARN[:50]: print('WARN:',w)
if len(WARN)>50: print(f'WARN: ... {len(WARN)-50} more')
if FAIL:
    for f in FAIL: print('FAIL:',f)
    print(f'FAILED with {len(FAIL)} error(s), {len(WARN)} warning(s).')
    sys.exit(1)
print(f'PASS with {len(WARN)} warning(s).')
