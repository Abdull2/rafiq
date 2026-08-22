/* Tadaruq Storage v1 — local-first, IndexedDB primary with safe localStorage compatibility mirror. */
(function(root){
  'use strict';
  const DB_NAME='tadaruq-local-v1', STORE_NAME='kv', DB_VERSION=1;
  let dbPromise=null;

  function hasHostStorage(){return !!(root.storage&&typeof root.storage.get==='function'&&typeof root.storage.set==='function')}
  function openDb(){
    if(!('indexedDB' in root))return Promise.resolve(null);
    if(dbPromise)return dbPromise;
    dbPromise=new Promise(resolve=>{
      let req;
      try{req=indexedDB.open(DB_NAME,DB_VERSION)}catch(_){resolve(null);return}
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME)};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
      req.onblocked=()=>resolve(null);
    });
    return dbPromise;
  }
  async function idbGet(key){
    const db=await openDb();if(!db)return {found:false,raw:null};
    return new Promise(resolve=>{try{const tx=db.transaction(STORE_NAME,'readonly'),r=tx.objectStore(STORE_NAME).get(key);r.onsuccess=()=>resolve(r.result===undefined?{found:false,raw:null}:{found:true,raw:String(r.result?.raw??r.result)});r.onerror=()=>resolve({found:false,raw:null})}catch(_){resolve({found:false,raw:null})}});
  }
  async function idbSet(key,raw){
    const db=await openDb();if(!db)return false;
    return new Promise(resolve=>{try{const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put({raw:String(raw),updatedAt:Date.now()},key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch(_){resolve(false)}});
  }
  async function idbRemove(key){
    const db=await openDb();if(!db)return false;
    return new Promise(resolve=>{try{const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false)}catch(_){resolve(false)}});
  }
  async function idbKeys(){
    const db=await openDb();if(!db)return [];
    return new Promise(resolve=>{try{const tx=db.transaction(STORE_NAME,'readonly'),r=tx.objectStore(STORE_NAME).getAllKeys();r.onsuccess=()=>resolve((r.result||[]).map(String));r.onerror=()=>resolve([])}catch(_){resolve([])}});
  }
  function localRead(key){try{const raw=localStorage.getItem(key);return raw===null?{found:false,raw:null}:{found:true,raw}}catch(_){return {found:false,raw:null}}}
  function localWrite(key,raw){try{localStorage.setItem(key,String(raw));return true}catch(_){return false}}
  function localRemove(key){try{localStorage.removeItem(key);return true}catch(_){return false}}

  async function rawRead(key){
    if(hasHostStorage()){
      try{const r=await root.storage.get(key,false);if(r&&r.value!==undefined&&r.value!==null)return {found:true,raw:String(r.value),backend:'host'}}catch(_){}
      const local=localRead(key);return {...local,backend:local.found?'localStorage':'none'};
    }
    const idb=await idbGet(key);
    if(idb.found)return {...idb,backend:'indexedDB'};
    const local=localRead(key);
    if(local.found){await idbSet(key,local.raw);return {...local,backend:'localStorage-migrated'}}
    return {found:false,raw:null,backend:'none'};
  }
  async function rawSet(key,raw){
    const value=String(raw);
    if(hasHostStorage()){
      try{await root.storage.set(key,value,false);localWrite(key,value);return {ok:true,backend:'host'}}catch(_){}
    }
    const idbOk=await idbSet(key,value),localOk=localWrite(key,value);
    if(!idbOk&&!localOk)throw new Error('تعذر حفظ البيانات محليًا');
    return {ok:true,backend:idbOk?'indexedDB':'localStorage'};
  }
  async function remove(key){
    if(hasHostStorage()){
      try{if(typeof root.storage.delete==='function')await root.storage.delete(key,false);else if(typeof root.storage.remove==='function')await root.storage.remove(key,false)}catch(_){}
    }
    await idbRemove(key);localRemove(key);return true;
  }
  async function keys(prefix=''){
    const set=new Set();
    if(hasHostStorage())try{const r=await root.storage.list(prefix,false);for(const k of r?.keys||[])set.add(String(k))}catch(_){}
    for(const k of await idbKeys())if(k.startsWith(prefix))set.add(k);
    try{for(const k of Object.keys(localStorage))if(k.startsWith(prefix))set.add(k)}catch(_){}
    return [...set].sort();
  }
  async function get(key){const r=await rawRead(key);if(!r.found)return null;try{return JSON.parse(r.raw)}catch(_){return null}}
  async function set(key,value){await rawSet(key,JSON.stringify(value));return value}
  async function diagnostics(){
    const db=await openDb();
    return {backend:hasHostStorage()?'host+mirror':db?'indexedDB+localStorage-mirror':'localStorage',indexedDB:!!db,hostStorage:hasHostStorage(),keyCount:(await keys()).length};
  }

  root.TadaruqStorage=Object.freeze({get,set,keys,remove,rawRead,rawSet,diagnostics});
})(window);
