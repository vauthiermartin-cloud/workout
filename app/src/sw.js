/* Ce fichier n'est pas servi tel quel : le build remplace les deux marqueurs
   ci-dessous par la liste réelle des fichiers produits et par un nom de cache
   dérivé de cette liste. Voir le plugin `serviceWorker` dans vite.config.js.

   Les fichiers construits portent un nom haché : un contenu qui change change
   de nom, donc le cache n'a jamais à décider si une entrée est périmée. */
const CACHE = "__CACHE__";
const ASSETS = "__ASSETS__";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

/* Tout autre cache appartient à un build précédent, y compris les caches
   `workout-vNN` de la version d'avant le build. */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* La page : réseau d'abord, pour recevoir les mises à jour. Une réponse en
     erreur est traitée comme une panne réseau — un 404 servi pendant un
     déploiement ne doit ni remplacer la coquille en cache, ni s'afficher
     alors qu'une version qui marche est disponible. */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (!res.ok) return caches.match("./index.html").then((hit) => hit || res);
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Le reste (scripts, styles, polices, icônes) : cache d'abord. */
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
