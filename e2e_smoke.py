#!/usr/bin/env python3
from __future__ import annotations
import contextlib, http.server, socket, threading, time, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1',0)); return s.getsockname()[1]

@contextlib.contextmanager
def server():
    port=free_port()
    handler=lambda *a,**kw: Quiet(*a,directory=str(ROOT),**kw)
    httpd=http.server.ThreadingHTTPServer(('0.0.0.0',port),handler)
    t=threading.Thread(target=httpd.serve_forever,daemon=True);t.start()
    host=socket.gethostbyname(socket.gethostname())
    try: yield f'http://{host}:{port}'
    finally: httpd.shutdown();t.join(timeout=2)

def run_profile(browser,base,mobile=False):
    opts={'locale':'ar-EG'}
    if mobile: opts.update(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    else: opts.update(viewport={'width':1440,'height':1000})
    ctx=browser.new_context(**opts)
    ctx.add_init_script("localStorage.setItem('onboarding-seen-v3','true'); localStorage.setItem('profile-v1', JSON.stringify({age:30,gender:'male',advancedIssues:false,married:null,hasKids:null,timeBand:null,moneyBand:null,skills:[]})); localStorage.setItem('settings', JSON.stringify({appearance:'sage',khatma:30})); localStorage.setItem('rafiq:data-version','2');")
    page=ctx.new_page(); errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto(base+'/',wait_until='domcontentloaded',timeout=30000)
    page.wait_for_selector('body.app-boot-ready',timeout=10000)
    assert 'تدارُك' in page.title()
    assert page.locator('#main-nav button[data-tab]').count()==5
    if mobile:
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2')
        boxes=page.locator('#main-nav button[data-tab]').evaluate_all('(els)=>els.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})')
        assert all(w>=40 and h>=40 for w,h in boxes)
    page.locator('#btn-more').click()
    page.wait_for_selector('#app-more-panel:not(.hide)')
    page.locator('[data-more-action="settings"]').click()
    page.wait_for_selector('#settings:not(.hide)')
    assert page.locator('[data-appearance]').count()==8
    for palette in ('mishkat','sage','ocean','lavender','rose','sand','indigo','night'):
        page.locator(f'[data-appearance="{palette}"]').click(); page.wait_for_timeout(90)
        expected_theme='dark' if palette=='night' else 'light'
        assert page.locator('html').get_attribute('data-theme')==expected_theme
    page.locator('[data-appearance="mishkat"]').click(); page.wait_for_timeout(120)
    assert page.locator('html').get_attribute('data-palette')=='mishkat'
    page.locator('#btn-data-check').click();page.wait_for_timeout(200)
    txt=page.locator('#data-safety-status').inner_text()
    assert 'إصدار البيانات' in txt or 'جاهزة' in txt
    page.locator('#btn-diagnostics').click();page.wait_for_timeout(200)
    assert '24.58.1' in page.locator('#diagnostics-status').inner_text()
    storage_diag=page.evaluate('TadaruqStorage.diagnostics()')
    assert storage_diag['indexedDB'] is True
    assert page.evaluate("RafiqDataSafety.status().then(x=>x.deviceDataVersion)")==3
    # Backup integrity + restore round-trip. The seeded legacy setting must survive v2 -> v3 migration.
    migrated=page.evaluate("TadaruqStorage.get('settings')")
    assert migrated.get('khatma')==30
    backup=page.evaluate('RafiqDataSafety.createPortableBackup()')
    assert backup['format']=='tadaruq-backup' and backup['appVersion']=='24.58.1' and backup['dataVersion']==3
    page.evaluate("TadaruqStorage.set('settings',{appearance:'rose',khatma:77})")
    page.evaluate("b=>RafiqDataSafety.restorePortableBackup(b,'replace')",backup)
    restored=page.evaluate("TadaruqStorage.get('settings')")
    assert restored.get('khatma')==30
    tampered=dict(backup); tampered['appVersion']='tampered'
    rejected=page.evaluate("b=>RafiqDataSafety.restorePortableBackup(b,'replace').then(()=>false).catch(()=>true)",tampered)
    assert rejected is True
    # Core sections should render without JS exceptions.
    page.locator('#close-settings').click()
    for tab in ('quran','azkar','sunnah','qalb','today'):
        page.locator(f'#main-nav button[data-tab="{tab}"]').click();page.wait_for_timeout(350)

    # Regression: knowledge subpages must render on the FIRST entry, not after leaving/re-entering.
    page.locator('#main-nav button[data-tab="sunnah"]').click();page.wait_for_timeout(120)
    probes=(('quran','prophets'),('sunnah','nawawi'),('aqeedah','aqeedah'),('advanced','usultafsir'),('fiqh','fiqh'),('sunnah','riyad'))
    for category,mode in probes:
        page.evaluate('openKnowledgeHome()')
        page.locator(f'#knowledge-home [data-kcat="{category}"]').click()
        page.wait_for_selector('#learn-seg:not(.hide)',timeout=5000)
        page.locator(f'#learn-seg [data-learn="{mode}"]').click()
        page.wait_for_selector(f'#learn-{mode}:not(.hide)',timeout=5000)
        page.wait_for_function("""mode=>{const el=document.getElementById('learn-'+mode);if(!el)return false;const t=(el.innerText||'').trim();return t.length>20&&!t.includes('جارٍ تحميل المحتوى…')}""",mode,timeout=10000)
        assert page.locator(f'#learn-{mode}').inner_text().strip()
        page.locator('#learn-category-back').click();page.wait_for_timeout(120)
    # Service worker must install; second load should be controlled.
    page.evaluate("navigator.serviceWorker.ready.then(()=>true)")
    page.reload(wait_until='domcontentloaded');page.wait_for_selector('body.app-boot-ready',timeout=10000)
    page.wait_for_timeout(300)
    assert page.evaluate('!!navigator.serviceWorker.controller')
    # Offline navigation after shell/content precache.
    ctx.set_offline(True)
    page.reload(wait_until='domcontentloaded',timeout=30000);page.wait_for_selector('body.app-boot-ready',timeout=10000)
    assert 'تدارُك' in page.title()
    # Core supporting pages are part of the installable app and must stay renderable offline too.
    for path,title in (('/tasbih.html','السبحة'),('/privacy.html','الخصوصية'),('/sources.html','المصادر')):
        page.goto(base+path,wait_until='domcontentloaded',timeout=30000)
        assert title in page.title()
    ctx.set_offline(False)
    if errors: raise AssertionError('page errors: '+' | '.join(errors[:8]))
    ctx.close()

def main():
    with server() as base, sync_playwright() as p:
        exe=Path(p.chromium.executable_path)
        launch={'headless':True,'args':['--no-sandbox',f'--unsafely-treat-insecure-origin-as-secure={base}']}
        if exe.exists(): launch['executable_path']=str(exe)
        elif Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=p.chromium.launch(**launch)
        try:
            run_profile(browser,base,False)
            run_profile(browser,base,True)
        finally: browser.close()
    print('E2E smoke desktop + mobile + offline: PASS')
if __name__=='__main__':
    try: main()
    except Exception as e:
        print('E2E FAIL:',e,file=sys.stderr);raise
