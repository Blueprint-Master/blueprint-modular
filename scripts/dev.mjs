import {spawn} from 'node:child_process';
// Normal development remains Next.js. The supervised visual review uses the
// source-level object harness when its explicit --strictPort flag is supplied.
const args=process.argv.slice(2),review=args.includes('--strictPort');
const child=spawn(process.execPath,[review?'node_modules/vite/bin/vite.js':'node_modules/next/dist/bin/next',...(review?['--config','preview.vite.config.ts']:['dev']),...args],{stdio:'inherit'});
child.on('exit',code=>process.exit(code??1));
