// Run against an unpacked npm pack, never the source checkout's aliases.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const consumer=process.argv[2];if(!consumer)throw Error('Consumer directory required');
const load=createRequire(path.resolve(consumer,'verify.cjs')),objects=load('@blueprint-modular/core/objects'),React=load('react'),{renderToStaticMarkup}=load('react-dom/server');
const packageRoot=path.resolve(path.dirname(load.resolve('@blueprint-modular/core/objects')),'../..');
assert.equal(objects.FORM_IDS.length,4);
for(const id of objects.FORM_IDS)for(const style of ['photorealistic','illustration']){
 const ref={schemaVersion:1,kind:'modular-object',id,version:'1.0.0',style,animation:{playing:false,speed:.5}};
 assert.deepEqual(objects.parseModularObjectAttachment(ref),ref);
 assert.ok(renderToStaticMarkup(React.createElement(objects.ModularObject,{id,variant:style,thumbnail:true})).includes(objects.formPosterPath(id,style)));
 assert.ok(fs.existsSync(path.join(packageRoot,'dist/assets/objects/forms-v1',objects.formPosterPath(id,style))));
}
assert.ok(fs.readdirSync(path.join(packageRoot,'dist')).some(n=>/^forms-renderer.*\.js$/.test(n)));
assert.ok(!fs.readdirSync(path.join(packageRoot,'dist/assets/objects/forms-v1')).some(n=>n.endsWith('.mp4')));
console.log('PASS: actual package /objects exports, eight exact references, SSR posters, distributed assets, lazy renderer, no runtime video. No npm publication.');
