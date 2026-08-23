/* Tadaruq release metadata. Keep every runtime component on one version source. */
(function(root){
  'use strict';
  const meta=Object.freeze({
    appVersion:'24.58.0',
    release:'R58',
    dataSchema:3,
    backupVersion:2,
    cacheVersion:'20260823-r58-renderfix1',
    buildDate:'2026-08-23'
  });
  try{Object.defineProperty(root,'TADARUQ_META',{value:meta,writable:false,configurable:false})}
  catch(_){root.TADARUQ_META=meta}
})(typeof self!=='undefined'?self:globalThis);
