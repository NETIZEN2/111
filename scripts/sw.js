const SW_VERSION = 'v1.0.0';
const CACHE_SHELL = `tripdash-shell-${SW_VERSION}`;
const CACHE_DATA  = `tripdash-data-${SW_VERSION}`;
const CACHE_TILES = `tripdash-tiles-${SW_VERSION}`;
const PRECACHE_URLS = [
  '/', '/index.html',
  '/styles/tokens.css','/styles/base.css','/styles/components.css','/styles/layout.css','/styles/theme.css','/styles/map.css','/styles/print.css',
  '/scripts/init.js','/scripts/router.js','/scripts/data.js','/scripts/state.js','/scripts/ui.js',
  '/assets/icons.svg','/manifest.webmanifest'
];

self.addEventListener('install', event=>{
  event.waitUntil(
    caches.open(CACHE_SHELL).then(cache=>cache.addAll(PRECACHE_URLS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', event=>{
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>![CACHE_SHELL,CACHE_DATA,CACHE_TILES].includes(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll();
    clients.forEach(c=>c.postMessage({type:'SW_UPDATE_READY'}));
  })());
});

self.addEventListener('fetch', event=>{
  const req = event.request;
  const url = new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(caches.match('/index.html'));
    return;
  }
  if(PRECACHE_URLS.includes(url.pathname)){
    event.respondWith(cacheFirst(req, CACHE_SHELL));
    return;
  }
  if(url.pathname.startsWith('/data/')){
    event.respondWith(staleWhileRevalidate(req, CACHE_DATA));
    return;
  }
  if(url.hostname.match(/tile.openstreetmap.org/)){
    event.respondWith(tileLRUFetch(req));
  }
});

function cacheFirst(req, cacheName){
  return caches.open(cacheName).then(cache=>cache.match(req).then(res=>res||fetch(req).then(r=>{cache.put(req,r.clone());return r;})));
}

function staleWhileRevalidate(req, cacheName){
  return caches.open(cacheName).then(async cache=>{
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then(r=>{cache.put(req,r.clone());return r;}).catch(()=>cached);
    return cached||fetchPromise;
  });
}

async function tileLRUFetch(req){
  const cache = await caches.open(CACHE_TILES);
  const match = await cache.match(req);
  if(match){
    updateLRU(req.url, match); // update access
    return match;
  }
  const res = await fetch(req);
  cache.put(req, res.clone());
  await updateLRU(req.url, res.clone());
  await enforceLRU(cache);
  return res;
}

const DB_NAME='tripdash-tiles';
function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{req.result.createObjectStore('meta',{keyPath:'url'});};
    req.onerror=()=>reject(req.error);
    req.onsuccess=()=>resolve(req.result);
  });
}
async function updateLRU(url,res){
  const db=await openDB();
  const tx=db.transaction('meta','readwrite');
  const store=tx.objectStore('meta');
  const size=Number(res.headers.get('content-length'))||0;
  store.put({url,lastAccess:Date.now(),size});
  await tx.done;
  db.close();
}
async function enforceLRU(cache){
  const db=await openDB();
  const tx=db.transaction('meta','readwrite');
  const store=tx.objectStore('meta');
  const all=[];store.openCursor().onsuccess=e=>{const cur=e.target.result;if(cur){all.push(cur.value);cur.continue();}};await tx.complete;
  let total=all.reduce((s,x)=>s+x.size,0);
  const maxEntries=2000,maxBytes=50*1024*1024;
  all.sort((a,b)=>a.lastAccess-b.lastAccess);
  for(const meta of all){
    if(all.length<=maxEntries && total<=maxBytes) break;
    await cache.delete(meta.url);
    const tx2=db.transaction('meta','readwrite');tx2.objectStore('meta').delete(meta.url);await tx2.done;
    total-=meta.size;
    all.shift();
  }
  db.close();
}

self.addEventListener('message', event=>{
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});
