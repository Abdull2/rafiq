#!/usr/bin/env python3
from pathlib import Path
import re, sys

ROOT=Path(__file__).resolve().parents[1]
idx=(ROOT/'index.html').read_text(encoding='utf-8')
sw=(ROOT/'sw.js').read_text(encoding='utf-8')
pwa=(ROOT/'pwa-register.js').read_text(encoding='utf-8')
workflow=(ROOT/'.github/workflows/quality.yml').read_text(encoding='utf-8')
errors=[]

def need(condition,message):
    if not condition: errors.append(message)

# CSP: executable JavaScript on the main page must be external.
need("script-src 'self';" in idx,'main CSP is not self-only for scripts')
need("script-src 'self' 'unsafe-inline'" not in idx,'unsafe-inline script permission remains')
need(not re.search(r'<script(?![^>]*\bsrc=)[^>]*>',idx,re.I),'inline executable script remains in index.html')
need((ROOT/'boot.js').is_file(),'boot.js missing after CSP extraction')
for page in ROOT.glob('*.html'):
    text=page.read_text(encoding='utf-8')
    need("script-src 'self' 'unsafe-inline'" not in text,f'unsafe-inline script permission remains in {page.name}')
    need(not re.search(r'<script(?![^>]*\bsrc=)[^>]*>',text,re.I),f'inline executable script remains in {page.name}')

# Mobile forms: avoid Safari focus zoom and preserve text scale setting.
need('@media(max-width:768px)' in idx and 'font-size:calc(16px + var(--user-text-add))!important' in idx,'mobile 16px form control rule missing')
for control in ('todo-new','datepick','profile-edit-age','lat','lng'):
    m=re.search(rf'<(?:input|select)[^>]*id="{re.escape(control)}"[^>]*>',idx)
    need(bool(m),f'control missing: {control}')
    if not m: continue
    tag=m.group(0)
    labelled=('aria-label=' in tag) or bool(re.search(rf'<label[^>]*for="{re.escape(control)}"',idx))
    need(labelled,f'control lacks accessible label: {control}')
for button in ('saved-close','profile-close','close-settings'):
    m=re.search(rf'<button[^>]*id="{re.escape(button)}"[^>]*>',idx)
    need(bool(m and 'aria-label=' in m.group(0)),f'close control lacks accessible name: {button}')

# Dialog semantics and focus containment.
for title in ('saved-panel-title','profile-panel-title','settings-title'):
    need(f'aria-labelledby="{title}"' in idx,f'dialog label missing: {title}')
need('./a11y-dialogs.js' in idx and (ROOT/'a11y-dialogs.js').is_file(),'dialog accessibility helper missing')
need('./network-status.js' in idx and (ROOT/'network-status.js').is_file(),'global offline/reconnect status helper missing')

# PWA install must not eagerly download the large JSON corpus.
install=sw.split("self.addEventListener('install'",1)[1].split("self.addEventListener('activate'",1)[0]
need('OPTIONAL_CONTENT_URLS' not in install and 'warmOptionalContent' not in install,'optional corpus is still warmed during install')
need("type==='WARM_OFFLINE_CONTENT'" in sw,'service worker warm message handler missing')
need("type:'WARM_OFFLINE_CONTENT'" in pwa,'PWA warm request missing')
need("display-mode: standalone" in pwa,'offline warming is not limited to installed PWA mode')
need('saveData' in pwa and "'slow-2g','2g'" in pwa,'data-saver/slow-network guard missing')
need('Array.from({length:4}' in sw,'offline warm concurrency limit missing')

# Standalone tasbih: imported/custom text must not become HTML or escape its storage namespace.
tas=(ROOT/'tasbih.js').read_text(encoding='utf-8')
need('escHtml(d.t)' in tas,'tasbih custom text is not HTML-escaped')
need('safeHttpUrl' in tas,'tasbih imported source URLs are not protocol-validated')
need(r"/^tas:(?:cfg|custom|\d{4}-\d{2}-\d{2})$/" in tas,'tasbih import is not restricted to tas: keys')
need('f.size>2*1024*1024' in tas,'tasbih import size cap missing')

# Regression tests should be part of CI, not only manual commands.
for script in ('knowledge_first_render_static.py','performance_static.py','production_readiness_static.py'):
    need(script in workflow,f'CI does not run {script}')

if errors:
    for error in errors: print('FAIL:',error)
    print(f'Production-readiness static regression: FAIL ({len(errors)})')
    sys.exit(1)
print('Production-readiness static regression: PASS')
