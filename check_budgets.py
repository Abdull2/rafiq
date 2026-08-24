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
    'boot.js':5*1024,
    'a11y-dialogs.js':10*1024,
    'tasbih.js':40*1024,
    'network-status.js':5*1024,
}
failed=[]
for name,limit in limits.items():
    size=(ROOT/name).stat().st_size
    print(f'{name}: {size/1024:.1f} KiB / {limit/1024:.0f} KiB')
    if size>limit: failed.append(f'{name} exceeds budget')
critical=['index.html','app.js','version.js','storage.js','data-safety.js','diagnostics.js','boot.js','a11y-dialogs.js','network-status.js','pwa-register.js','manifest.webmanifest']
critical_size=sum((ROOT/x).stat().st_size for x in critical)
print(f'critical code shell: {critical_size/1024:.1f} KiB / 800 KiB')
if critical_size>800*1024: failed.append('critical code shell exceeds 800 KiB')
json_size=sum(p.stat().st_size for p in ROOT.glob('*.json'))
print(f'local JSON corpus: {json_size/1024/1024:.2f} MiB / 6 MiB')
if json_size>6*1024*1024: failed.append('local JSON corpus exceeds 6 MiB')

# Keep the immediate PWA install payload lean. The large content corpus must be warmed later.
import re
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
m=re.search(r'const CRITICAL_URLS=\[(.*?)\];',sw,re.S)
if not m: failed.append('cannot parse CRITICAL_URLS')
else:
    install_refs=re.findall(r"'\./([^']+)'",m.group(1))
    install_size=sum((ROOT/x).stat().st_size for x in install_refs if (ROOT/x).is_file())
    print(f'PWA immediate install shell: {install_size/1024/1024:.2f} MiB / 2 MiB')
    if install_size>2*1024*1024: failed.append('PWA immediate install shell exceeds 2 MiB')
search_index=ROOT/'search-index.json'
if search_index.exists():
    search_size=search_index.stat().st_size
    print(f'search-index.json: {search_size/1024:.1f} KiB / 600 KiB')
    if search_size>600*1024: failed.append('search-index.json exceeds 600 KiB')
if failed:
    for x in failed: print('FAIL:',x)
    sys.exit(1)
print('Performance budgets: PASS')
