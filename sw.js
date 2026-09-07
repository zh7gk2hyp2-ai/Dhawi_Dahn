const CACHE = 'dhawi-v3';
const ASSETS = ['./', './index.html', './agency.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

// app.js هو التطبيق نفسه ويُبنى مع index.html في كل نشر. كان يُخدَم بـ
// stale-while-revalidate (`cached || network`) بينما الـHTML شبكة-أولاً — أي أن
// كل جهاز مثبِّت كان يفتح صفحةً جديدة مع حزمة قديمة بنسخة كاملة. هذا التفاوت
// يكسر التطبيق بعد كل نشر. الآن: الشبكة أولاً للمستند وللحزمة معاً، والتخزين
// المؤقّت احتياطٌ للعمل بلا إنترنت فقط. أما vendor/ والصور فثابتة ولا تتغيّر
// مع النشر، فتبقى على stale-while-revalidate لأنها الأسرع ولا خطر منها.
function networkFirst(req) {
  return fetch(req).then(res => {
    if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
    return res;
  }).catch(() => caches.match(req).then(c => c || caches.match('./index.html')));
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  const isAppBundle = /\/app\.js$/.test(url.pathname);

  if (isDoc || isAppBundle) { e.respondWith(networkFirst(e.request)); return; }

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'ضاوي الدهن', body: 'تنبيه جديد' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './icon.svg',
    dir: 'rtl',
    lang: 'ar',
    badge: './icon.svg'
  }));
});
