#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
limits={
    'index.html':350*1024,
    'app.js':450*1024,
    'storage.js':40*1024,
    'data-safety.js':80*1024,
    'diagnostics.js':30*1024,
    'sw.js':35*1024,
}
failed=[]
for name,limit in limits.items():
    size=(ROOT/name).stat().st_size
    print(f'{name}: {size/1024:.1f} KiB / {limit/1024:.0f} KiB')
    if size>limit: failed.append(f'{name} exceeds budget')
critical=['index.html','app.js','version.js','storage.js','data-safety.js','diagnostics.js','pwa-register.js','manifest.webmanifest']
critical_size=sum((ROOT/x).stat().st_size for x in critical)
print(f'critical code shell: {critical_size/1024:.1f} KiB / 800 KiB')
if critical_size>800*1024: failed.append('critical code shell exceeds 800 KiB')
json_size=sum(p.stat().st_size for p in ROOT.glob('*.json'))
print(f'local JSON corpus: {json_size/1024/1024:.2f} MiB / 6 MiB')
if json_size>6*1024*1024: failed.append('local JSON corpus exceeds 6 MiB')
search_index=ROOT/'search-index.json'
if search_index.exists():
    search_size=search_index.stat().st_size
    print(f'search-index.json: {search_size/1024:.1f} KiB / 600 KiB')
    if search_size>600*1024: failed.append('search-index.json exceeds 600 KiB')
if failed:
    for x in failed: print('FAIL:',x)
    sys.exit(1)
print('Performance budgets: PASS')
