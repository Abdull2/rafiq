// Tadaruq R26 — Cloudflare Worker proxy for the official Al-Mukhtasar API.
// Store MOKHTASAR_TOKEN as a Worker secret. Never commit it.
const API='https://admin.mokhtasr.com/api/v1/book-contents';

function cors(origin, env){
  const allowed=(env.ALLOWED_ORIGIN||'https://abdull2.github.io').trim();
  return {
    'Access-Control-Allow-Origin':allowed,
    'Access-Control-Allow-Methods':'GET,OPTIONS',
    'Access-Control-Allow-Headers':'Accept,Content-Type',
    'Vary':'Origin',
    'Cache-Control':'public, max-age=3600'
  };
}
function json(body,status,headers){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}})}
function pickText(payload){
  const root=payload?.data?.[0]||payload?.data||payload;
  const books=Array.isArray(root?.books)?root.books:[];
  const book=books[0]||{};
  const candidates=[book.text,book.content,book.tafsir,book.translation,book.book_content,root?.text,root?.content];
  return candidates.find(v=>typeof v==='string'&&v.trim())?.trim()||'';
}
export default {
  async fetch(request,env){
    const origin=request.headers.get('Origin')||''; const headers=cors(origin,env);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    const u=new URL(request.url);
    if(request.method!=='GET'||u.pathname!=='/tafsir')return json({error:'not_found'},404,headers);
    const sura=Number(u.searchParams.get('sura')),aya=Number(u.searchParams.get('aya'));
    if(!Number.isInteger(sura)||sura<1||sura>114||!Number.isInteger(aya)||aya<1||aya>286)return json({error:'invalid_reference'},400,headers);
    if(!env.MOKHTASAR_TOKEN)return json({error:'server_not_configured'},503,headers);
    const target=`${API}?lang=ar&sura=${sura}&aya=${aya}&books=200`;
    const r=await fetch(target,{headers:{'Accept':'application/json','Authorization':`Bearer ${env.MOKHTASAR_TOKEN}`}});
    if(!r.ok)return json({error:'upstream_error',status:r.status},502,headers);
    const payload=await r.json(); const text=pickText(payload);
    if(!text)return json({error:'empty_upstream'},502,headers);
    return json({sura,aya,text,source:'المختصر في تفسير القرآن الكريم',official:'https://mokhtasr.com/ar/books/200'},200,headers);
  }
};
