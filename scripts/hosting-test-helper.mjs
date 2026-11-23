// Real Caddy loopback test, not a remote deployment. Never use these test credentials remotely.
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
export const testUser = 'zaad-local-test-only';
export const testPassword = 'not-a-deployment-password';
export async function startHostingTest() {
  const binary = process.env.CADDY_BIN || resolve('.tools/caddy/caddy.exe');
  if (!existsSync(binary)) throw Error('Caddy is required. Set CADDY_BIN to an installed, verified Caddy >=2.8 binary. See docs/REVIEWER_STAGING_DEPLOYMENT.md.');
  const hash = spawnSync(binary, ['hash-password', '--plaintext', testPassword], { encoding:'utf8', windowsHide:true });
  if (hash.status !== 0) throw Error(hash.stderr || 'Cannot hash local test password');
  const env = { ...process.env, ZAAD_PUBLIC_DOMAIN:'http://127.0.0.1:4280', ZAAD_REVIEW_DOMAIN:'http://127.0.0.1:4281', ZAAD_REVIEW_USER:testUser, ZAAD_REVIEW_PASSWORD_HASH:hash.stdout.trim() };
  // Same route/auth/cache directives as production; only listener, root paths and admin differ.
  const config = '{\n admin off\n}\n' + readFileSync('hosting/Caddyfile','utf8')
    .replace('/srv/zaad/public/current', '"' + resolve('dist').replaceAll('\\','/') + '"')
    .replace('/srv/zaad/review/current', '"' + resolve('.staging-dist').replaceAll('\\','/') + '"');
  const path = resolve('.tools/Caddyfile-test');
  writeFileSync(path, config);
  const valid = spawnSync(binary, ['validate','--config',path,'--adapter','caddyfile'], {env, encoding:'utf8', windowsHide:true});
  if (valid.status !== 0) throw Error(valid.stderr || 'Caddy validation failed');
  const server = spawn(binary,['run','--config',path,'--adapter','caddyfile'], {env,stdio:['ignore','ignore','pipe'],windowsHide:true});
  let errors = '';
  server.stderr.on('data',data => { errors += data.toString(); });
  server.on('error', e => { errors += e.message; });
  for (let i=0; i<100; i++) {
    try {
      const response = await fetch('http://127.0.0.1:4281/review');
      if (response.status === 401) return server;
    } catch { /* bounded local startup polling */ }
    if (server.exitCode !== null) throw Error(errors);
    await new Promise(resolve => setTimeout(resolve,100));
  }
  server.kill();
  throw Error('Local Caddy did not become ready: ' + errors);
}
