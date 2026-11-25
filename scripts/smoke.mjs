// Smoke test: serves the repo, opens the lab and the store in headless Chromium and fails on
// any runtime error or missing core UI. Runs in CI (see .github/workflows/smoke.yml) and locally:
//   node scripts/smoke.mjs
// Optional env: DHAWI_SMOKE_PIN (lab PIN → also checks the logged-in screens),
//               PW_EXECUTABLE_PATH (use a specific Chromium binary).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  let body = fs.readFileSync(file);
  if (file.endsWith('agency.html')) body = Buffer.from(body.toString('utf8').replace(/var MAINTENANCE\s*=\s*true;/, 'var MAINTENANCE = false;'));
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const failures = [];
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) failures.push(msg); };
const browser = await chromium.launch(process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ar-SA', isMobile: true, hasTouch: true, serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('lab: ' + e.message.slice(0, 200)));
page.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR/.test(m.text())) errors.push('lab console: ' + m.text().slice(0, 200)); });

// ── lab ──
await page.goto(`${base}/index.html`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);
check(await page.$('input[type="password"]') !== null, 'lab: PIN screen renders');
check(await page.evaluate(() => /DHAWI OUD|ضاوي عود/.test(document.body.innerText)), 'lab: brand present');
const pin = process.env.DHAWI_SMOKE_PIN;
if (pin) {
  await page.fill('input[type="password"]', pin); await page.press('input[type="password"]', 'Enter'); await page.waitForTimeout(2500);
  check(await page.evaluate(() => /الوصفات/.test(document.body.innerText)), 'lab: dashboard after login');
  const tab = await page.$('.nav-btn:has-text("الوصفات")') || await page.$('text=الوصفات');
  if (tab) { await tab.click({ force: true }); await page.waitForTimeout(1200); }
  const count = await page.evaluate(() => { const m = document.body.innerText.match(/الوصفات\s*\((\d+)\)/); return m ? +m[1] : 0; });
  check(count >= 100, `lab: recipe count ${count} ≥ 100`);
  const search = await page.$('input[placeholder*="ابحث"]'); if (search) { await search.fill('عسل العنبر'); await page.waitForTimeout(700); }
  const cards = await page.$$('text=عسل العنبر'); if (cards.length) { await cards[cards.length - 1].click({ force: true }); await page.waitForTimeout(1500); }
  const txt = await page.evaluate(() => document.body.innerText);
  check(/المكونات/.test(txt), 'lab: recipe detail opens');
  check(/توقّع الأداء/.test(txt), 'lab: performance forecast box');
  check(/قائمة الامتثال/.test(txt), 'lab: compliance checklist');
  const inv = await page.$('.nav-btn:has-text("المخزون")') || await page.$('text=المخزون');
  if (inv) { await inv.click({ force: true }); await page.waitForTimeout(1000); }
  check(await page.evaluate(() => /قائمة التسوق/.test(document.body.innerText)), 'lab: inventory tab');
  const stats = await page.$('.nav-btn:has-text("إحصائيات")') || await page.$('text=إحصائيات');
  if (stats) { await stats.click({ force: true }); await page.waitForTimeout(1000); }
  check(await page.evaluate(() => /المزامنة السحابية/.test(document.body.innerText)), 'lab: cloud sync card');
} else {
  console.log('· DHAWI_SMOKE_PIN not set — logged-in checks skipped');
}

// ── store ──
const sp = await ctx.newPage();
sp.on('pageerror', e => errors.push('store: ' + e.message.slice(0, 200)));
sp.on('console', m => { if (m.type() === 'error' && !/favicon|net::ERR/.test(m.text())) errors.push('store console: ' + m.text().slice(0, 200)); });
await sp.goto(`${base}/agency.html`, { waitUntil: 'networkidle', timeout: 60000 });
await sp.waitForTimeout(2000);
const cards = await sp.$$('.pcard');
check(cards.length >= 50, `store: ${cards.length} product cards ≥ 50`);
const imgs = await sp.evaluate(() => [...document.querySelectorAll('.pcard img')].map(i => i.getAttribute('src')));
const missing = imgs.filter(src => src && !fs.existsSync(path.join(ROOT, src.split('?')[0])));
check(missing.length === 0, `store: all product images exist (${missing.length} missing${missing.length ? ': ' + missing.slice(0, 3).join(', ') : ''})`);
const btn = await sp.$('.pcard-btn');
if (btn) { await btn.evaluate(el => el.click()); await sp.waitForTimeout(500); }
await sp.evaluate(() => { try { openCart(); } catch (e) { } }); await sp.waitForTimeout(700);
check(await sp.evaluate(() => !!document.querySelector('#ov') && /السلة|إتمام|الطلب/.test(document.querySelector('#ov').innerText || '')), 'store: cart opens with an item');
check(await sp.evaluate(() => /2027/.test(document.body.innerText)), 'store: © 2027 footer');
const videos = await sp.evaluate(() => [...document.querySelectorAll('video source')].map(s => s.getAttribute('src')));
check(videos.every(v => fs.existsSync(path.join(ROOT, v))), 'store: hero/cinema video files exist');

// ── service worker file sanity ──
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
check(/const CACHE = 'dhawi-v\d+';/.test(sw), 'sw.js: versioned cache name');

await browser.close(); server.close();
if (errors.length) { console.log('runtime errors:'); errors.forEach(e => console.log('  ' + e)); failures.push(`${errors.length} runtime error(s)`); }
if (failures.length) { console.error(`\nSMOKE FAILED — ${failures.length} problem(s)`); process.exit(1); }
console.log('\nSMOKE PASSED');
