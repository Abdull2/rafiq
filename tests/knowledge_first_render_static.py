#!/usr/bin/env python3
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
app=(ROOT/'app.js').read_text(encoding='utf-8')
html=(ROOT/'index.html').read_text(encoding='utf-8')
version=(ROOT/'version.js').read_text(encoding='utf-8')

assert 'async function enterKnowledgeSubpage' in app
assert 'await renderKnowledge()' in app
start=app.index('async function renderKnowledge(){')
end=app.index("document.getElementById('learn-seg').onclick",start)
block=app[start:end]
assert block.index('modes.forEach') < block.index('await loadLearn()'), 'knowledge.json must not block initial subpage shell'
for call in ('renderStoryLibrary(mode)','renderSimpleKnowledge(mode)','renderStructuredKnowledge(mode)','renderAgreed()','renderSunnah()','renderNawawi()','renderSeerah()','renderCompanions()','renderBusola()'):
    assert 'await '+call in block, f'missing await for {call}'
assert 'knowledgeLoading(mode)' in block
assert re.search(r"cacheVersion:'20260823-r58-(?:renderfix\d+|perf\d+)'",version), 'unexpected cache version format'

modes=['agreed','riyad','nawawi','seerah','companions','essentials','fiqh','busola','muyassar','prophets','qstories','usultafsir','usulfiqh','fuqaha','history','aqeedah','fiqhlife','tajweed','hadithsciences','akhlaq','adab','digital','qawaid']
for mode in modes:
    assert f'id="learn-{mode}"' in html, f'missing host for {mode}'

files=['knowledge.json','aqeedah.json','fiqh-life.json','fiqh-busola.json','tajweed.json','hadith-sciences.json','nawawi40.json','riyad.json','agreed-hadith.json','seerah.json','companions.json','islamic-history.json','akhlaq.json','adab.json','digital-life.json','qawaid-fiqh.json','usul-fiqh.json','usul-tafsir.json','fuqaha.json','prophet-stories.json','quran-stories.json']
for name in files:
    data=json.loads((ROOT/name).read_text(encoding='utf-8'))
    assert data, f'empty JSON {name}'
print(f'Knowledge first-entry regression: PASS ({len(modes)} hosts, {len(files)} data files)')
