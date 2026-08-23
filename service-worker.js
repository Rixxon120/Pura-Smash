const CACHE_NAME="pura-smash-shell-v14";
const APP_SHELL=["/","/index.html","/manifest.webmanifest","/assets/app.2976bb2ab3.min.js","/assets/styles.eb314dab60.min.css","/assets/icons/icon-192.png","/assets/icons/icon-512.png","/assets/icons/icon-maskable-192.png","/assets/icons/icon-maskable-512.png","/assets/icons/apple-touch-icon.png"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  const url=new URL(req.url);

  if(url.origin!==self.location.origin) return;
  if(req.method!=="GET") return;

  if(req.mode==="navigate"){
    event.respondWith(
      fetch(req)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put("/index.html",copy));
          return res;
        })
        .catch(()=>caches.match("/index.html"))
    );
    return;
  }

  if(url.pathname.startsWith("/assets/")||url.pathname==="/manifest.webmanifest"){
    event.respondWith(
      caches.match(req).then(cached=>cached||fetch(req).then(res=>{
        const copy=res.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));
        return res;
      }))
    );
  }
});
