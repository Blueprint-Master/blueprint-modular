import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({resolve:{alias:{'@/lib/i18n/LocaleProvider':resolve(__dirname,'preview-locale.ts')}},server:{host:'0.0.0.0',allowedHosts:['terminal.local']}});
