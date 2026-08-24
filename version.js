/* Tadaruq release metadata. Keep every runtime component on one version source. */
(function(root){
  'use strict';
  const meta=Object.freeze({
    appVersion:'24.58.1',
    release:'R58',
    dataSchema:3,
    backupVersion:2,
    cacheVersion:'20260824-r58-prod1',
    buildDate:'2026-08-24'
  });
  try{Object.defineProperty(root,'TADARUQ_META',{value:meta,writable:false,configurable:false})}
  catch(_){root.TADARUQ_META=meta}
})(typeof self!=='undefined'?self:globalThis);
