import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
await build({entryPoints:['face-entry.js'],bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'face-engine.js',minify:true,logLevel:'info'});
const src='node_modules/@mediapipe/tasks-vision/wasm';
const dest='vendor/mediapipe';fs.mkdirSync(dest,{recursive:true});
for(const name of fs.readdirSync(src)){fs.copyFileSync(path.join(src,name),path.join(dest,name));}
console.log('local face engine + wasm built');
