// Run from an unpacked-package consumer (NODE_PATH is not required).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const consumer=process.argv[2];if(!consumer)throw Error('Consumer directory required');
const {createRequire}=require('node:module'),load=createRequire(path.resolve(consumer,'verify.cjs'));
const objects=load('@blueprint-modular/core/objects'),React=load('react'),{renderToStaticMarkup}=load('react-dom/server');
const entry=load.resolve('@blueprint-modular/core/objects'),packageRoot=path.resolve(path.dirname(entry),'../..');
assert.equal(objects.WEATHER_IDS.length,6);
for(const id of objects.WEATHER_IDS)for(const style of ['photorealistic','illustration']){
 const ref={schemaVersion:1,kind:'modular-object',id,version:'1.0.0',style,animation:{playing:true,speed:1}};
 assert.deepEqual(objects.parseModularObjectAttachment(ref),ref);
 assert.match(renderToStaticMarkup(React.createElement(objects.ModularObject,{id,version:'1.0.0',variant:style,thumbnail:true})),new RegExp(`${id}-${style}\\.webp`));
 for(const name of objects.weatherAssetPaths(id,style))assert.ok(fs.existsSync(path.join(packageRoot,'dist/assets/objects/weather-v1',name)),name);
}
assert.ok(fs.readdirSync(path.join(packageRoot,'dist')).some(n=>/^weather-renderer.*\.js$/.test(n)));
assert.ok(!fs.readdirSync(path.join(packageRoot,'dist/assets/objects/weather-v1')).some(n=>n.endsWith('.mp4')));
console.log('PASS: public package exports, 12 exact references, SSR posters, selected materials and lazy renderer chunk. No npm publication.');
