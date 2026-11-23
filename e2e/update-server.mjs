// Local Playwright harness only: never copied to dist or used for hosting.
import http from 'node:http';import {readFileSync,statSync} from 'node:fs';import {resolve,extname,sep} from 'node:path';
let directory='dist';const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4176');
 if(url.pathname==='/__test/release'){directory=url.searchParams.get('next')==='1'?'.test-release':'dist';res.end('ok');return;}
 const root=resolve(directory);let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 try{if(!statSync(path).isFile())path=resolve(root,'index.html');}catch{path=resolve(root,'index.html');}
 try{res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(path));}catch{res.writeHead(404);res.end();}
}).listen(4176,'127.0.0.1');
