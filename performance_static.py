#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
app=(ROOT/'app.js').read_text(encoding='utf-8')
idx=json.loads((ROOT/'search-index.json').read_text(encoding='utf-8'))
errors=[]
entries=idx.get('entries',[])
if len(entries)<1000: errors.append(f'search index unexpectedly small: {len(entries)}')
if (ROOT/'search-index.json').stat().st_size>600*1024: errors.append('search index over 600 KiB')
if "fetch('./search-index.json',{cache:'force-cache'})" not in app: errors.append('global search does not use compact prebuilt index')
if "buildStrip(); renderAzkar(); renderQuran();" in app: errors.append('day load still eagerly renders azkar on every load')
if "if(tab==='azkar'||AZ.sets.length)renderAzkar();" not in app: errors.append('conditional azkar render missing')
if "savedSettings,savedQada,savedProfile" not in app or 'Promise.all([' not in app[app.find('/* ================= boot ================= */'):]: errors.append('parallel boot reads missing')
if errors:
    for e in errors: print('FAIL:',e)
    sys.exit(1)
print(f'Performance static regression: PASS ({len(entries)} search entries)')
