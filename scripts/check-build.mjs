// Guards against the two ways this build can silently go wrong:
//   1. app.js committed while stale (someone edited app.jsx and forgot to build)
//   2. index.html drifting back to loading Babel or a CDN
import { readFileSync, statSync } from 'node:fs';

const fail = m => { console.error('✗ ' + m); process.exitCode = 1; };
const ok   = m => console.log('✓ ' + m);

const html = readFileSync('index.html', 'utf8');
if (html.includes('text/babel')) fail('index.html still has an inline text/babel block');
else ok('no in-browser Babel');

for (const cdn of ['cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com']) {
  if (html.includes(cdn)) fail(`index.html still loads a script from ${cdn}`);
}
ok('no CDN script tags');

if (!html.includes('src="app.js"')) fail('index.html does not load app.js');
else ok('index.html loads app.js');

const jsx = statSync('app.jsx').mtimeMs;
const js  = statSync('app.js').mtimeMs;
if (js < jsx) fail('app.js is older than app.jsx — run: npm run build');
else ok('app.js is newer than app.jsx');

const bundle = readFileSync('app.js', 'utf8');
if (bundle.length < 100_000) fail(`app.js looks truncated (${bundle.length} bytes)`);
else ok(`app.js is ${(bundle.length / 1024).toFixed(0)} KB`);

// the bundle must actually contain the app, not just React
for (const marker of ['dw_recipes', 'dw_inv', 'ATELIER DHAWI']) {
  if (!bundle.includes(marker)) fail(`app.js is missing "${marker}" — wrong entry point?`);
}
ok('bundle contains the app');

console.log(process.exitCode ? '\nBUILD CHECK FAILED' : '\nBUILD CHECK PASSED');
