#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
version=(ROOT/'version.js').read_text(encoding='utf-8')
m=re.search(r"appVersion:'([^']+)'",version); r=re.search(r"release:'([^']+)'",version)
allowed={'.html','.js','.json','.webmanifest','.svg','.woff2','.png'}
files={}
for p in sorted(ROOT.iterdir()):
    if not p.is_file() or p.name=='release-manifest.json' or p.suffix.lower() not in allowed: continue
    b=p.read_bytes(); files[p.name]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
out={'appVersion':m.group(1) if m else None,'release':r.group(1) if r else None,'algorithm':'SHA-256','files':files}
(ROOT/'release-manifest.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'release-manifest.json: {len(files)} runtime files hashed')
