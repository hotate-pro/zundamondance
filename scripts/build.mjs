import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';
const html=fs.readFileSync('index.html','utf8');
const m=html.match(/<script type="text\/plain" id="build-source">([\s\S]*?)<\/script>/);
if(!m)throw Error('Missing build-source script');
await build({stdin:{contents:m[1],resolveDir:process.cwd(),sourcefile:'app.js',loader:'js'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'bundle.js',logLevel:'info'});
const dest='vendor/mediapipe';fs.mkdirSync(dest,{recursive:true});
const src='node_modules/@mediapipe/tasks-vision/wasm';
for(const name of fs.readdirSync(src)){if(name.startsWith('vision_wasm'))fs.copyFileSync(path.join(src,name),path.join(dest,name))}
console.log('Local JS and MediaPipe WASM ready');
