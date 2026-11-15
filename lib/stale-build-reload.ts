/**
 * Runs before the app starts (inline in <head>). After a new deployment the files of the
 * previous build are gone, so a tab that was left open fails with "ChunkLoadError" and
 * shows "Application error". This reloads such a tab once to pick up the new build.
 * At most one reload a minute per tab, and none when the tab cannot remember that it
 * reloaded, so a real fault can never cause a reload loop.
 */
// String.raw keeps the backslashes of the regular expressions below.
export const STALE_BUILD_RELOAD = String.raw`(function(){
  var KEY='cbs-stale-build-reload';
  function stale(text){return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk/i.test(String(text||''));}
  function reload(){
    try{
      var last=Number(sessionStorage.getItem(KEY)||0);
      if(Date.now()-last<60000)return;
      sessionStorage.setItem(KEY,String(Date.now()));
    }catch(e){return;}
    location.reload();
  }
  window.addEventListener('error',function(event){
    var target=event.target;
    if(target&&target.tagName==='SCRIPT'&&/\/_next\/static\//.test(target.src||'')){reload();return;}
    var error=event.error;
    if(stale(event.message)||stale(error&&(error.name+' '+error.message)))reload();
  },true);
  window.addEventListener('unhandledrejection',function(event){
    var reason=event.reason;
    if(stale(reason&&(reason.name+' '+reason.message)))reload();
  });
})();`;
