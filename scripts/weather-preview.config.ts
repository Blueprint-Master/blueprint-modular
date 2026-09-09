import {defineConfig} from "vite";
import {resolve} from "node:path";
export default defineConfig({root:resolve(__dirname),publicDir:resolve(__dirname,"../public"),server:{host:"0.0.0.0",port:4173,fs:{allow:[resolve(__dirname,"..")]}},resolve:{dedupe:["react","react-dom"]}});
