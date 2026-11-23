import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { startHostingTest, testUser, testPassword } from './hosting-test-helper.mjs';
const server = await startHostingTest();
const auth = { Authorization:'Basic '+Buffer.from(`${testUser}:${testPassword}`).toString('base64') };
let checks = 0;
try {
  const review = 'http://127.0.0.1:4281';
  const publicOrigin = 'http://127.0.0.1:4280';
  const js = readdirSync('.staging-dist/assets').find(f => f.endsWith('.js'));
  for (const path of ['/review','/review/faq','/index.html',`/assets/${js}`,'/review-build.json','/sw.js','/missing.js']) {
    const r=await fetch(review+path); assert.equal(r.status,401,path); assert.equal(r.headers.get('cache-control'),'private, no-store'); assert.ok(r.headers.get('www-authenticate')?.startsWith('Basic')); checks++;
  }
  assert.equal((await fetch(review+'/review',{headers:{Authorization:'Basic '+Buffer.from('bad:bad').toString('base64')}})).status,401); checks++;
  const page = await fetch(review+'/review/faq',{headers:auth});
  assert.equal(page.status,200); assert.ok((await page.text()).includes('<div id="root">'));
  assert.equal(page.headers.get('cache-control'),'private, no-store');
  assert.ok(page.headers.get('vary').split(/,\s*/).includes('Authorization'));
  assert.ok(page.headers.get('content-security-policy').includes("worker-src 'none'"));
  assert.equal(page.headers.get('x-robots-tag'),'noindex, nofollow, noarchive'); checks++;
  for (const path of ['/sw.js','/manifest.webmanifest','/missing.js']) { assert.equal((await fetch(review+path,{headers:auth})).status,404,path); checks++; }
  assert.equal((await fetch(review+'/review',{method:'POST',headers:auth})).status,405); checks++;
  const p=await fetch(publicOrigin+'/faq'); assert.equal(p.status,200); assert.equal(p.headers.get('cache-control'),'no-cache');
  assert.ok(p.headers.get('content-security-policy').includes("worker-src 'self'")); checks++;
  for (const path of ['/review','/review/faq','/review-build.json','/missing.js']) { assert.equal((await fetch(publicOrigin+path)).status,404,path); checks++; }
  const asset = readdirSync('dist/assets').find(f => f.endsWith('.js'));
  assert.equal((await fetch(publicOrigin+'/assets/'+asset)).headers.get('cache-control'),'public, max-age=31536000, immutable'); checks++;
  const sw=await fetch(publicOrigin+'/sw.js'); assert.equal(sw.status,200); assert.ok(sw.headers.get('content-type').includes('javascript')); assert.equal(sw.headers.get('cache-control'),'no-cache'); checks++;
  console.log(`PASS: ${checks} real Caddy loopback authentication/routing/cache scenarios. No remote deployment or public TLS validation.`);
} finally { server.kill(); }
