import { startHostingTest } from './hosting-test-helper.mjs';
const server = await startHostingTest();
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { server.kill(); process.exit(0); });
server.on('exit', code => process.exit(code || 0));
console.log('Loopback-only Caddy hosting test ready on 4280/4281.');
