import ts from 'typescript';import {readFileSync,readdirSync} from 'node:fs';
import {en} from '../src/i18n/en.ts';import {messages} from '../src/i18n/messages.ts';
const missing=new Set();const arabic=/[\u0600-\u06ff]/;
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(`${dir}/${d.name}`):[`${dir}/${d.name}`]);
for(const file of walk('src').filter(f=>f.endsWith('.tsx')&&!f.includes('/test/'))){
 const ast=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(n){if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&['tr','t'].includes(n.expression.text)&&ts.isStringLiteral(n.arguments[0])){const key=n.arguments[0].text.trim().replace(/\s+/g,' ');if(!en[key]&&!messages[key])missing.add(`${file}: ${key}`);}ts.forEachChild(n,visit);}visit(ast);
}
for(const file of ['src/content/publication.ts','src/content/stages.ts','src/content/sources.ts','src/db/index.ts']){
 const ast=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
 function visit(n){if(ts.isStringLiteral(n)&&arabic.test(n.text)&&!n.text.startsWith('https://')){const key=n.text.trim().replace(/\s+/g,' ');if(!en[key]&&!messages[key])missing.add(`${file}: ${key}`);}ts.forEachChild(n,visit);}visit(ast);
}
if(missing.size){console.error([...missing].join('\n'));process.exitCode=1;}else console.log('All static UI messages, source labels and validation errors have Arabic/English catalog entries.');
