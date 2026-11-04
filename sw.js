/* Tagalong service worker. Bump V on every deploy: the old cache is dropped on activate.
   - pages (index.html, admin/): network first, cache fallback, so an installed app still opens offline with what it last saw
   - Google Fonts css + woff2: cache first (immutable per URL)
   - the API host is never cached (auth, joins, live seats); everything else passes through untouched */
const V='tagalong-20261105a',API=/workers\.dev$/,FONTS=/^fonts\.(googleapis|gstatic)\.com$/;
const PAGES=['./','./index.html'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(PAGES).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const isPage=(req,u)=>req.mode==='navigate'||(u.origin===location.origin&&(u.pathname.endsWith('/')||/\.html$/.test(u.pathname)));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  let u;try{u=new URL(req.url);}catch(x){return;}
  if(API.test(u.hostname))return;
  if(isPage(req,u)){
    e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(k=>k.put(req,c));}return r;})
      .catch(()=>caches.match(req,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))));
    return;
  }
  if(FONTS.test(u.hostname)){
    e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(V).then(k=>k.put(req,c));}return r;})));
  }
});
