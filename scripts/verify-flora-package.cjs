// Run against an unpacked npm pack, never source aliases.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const consumer=process.argv[2];if(!consumer)throw Error('Consumer directory required');
const load=createRequire(path.resolve(consumer,'verify.cjs')),objects=load('@blueprint-modular/core/objects'),React=load('react'),{renderToStaticMarkup}=load('react-dom/server'),packageRoot=path.resolve(path.dirname(load.resolve('@blueprint-modular/core/objects')),'../..');
assert.equal(objects.FLORA_IDS.length,4);
for(const id of objects.FLORA_IDS)for(const style of ['photorealistic','illustration']){const ref={schemaVersion:1,kind:'modular-object',id,version:'1.0.0',style,animation:{playing:false,speed:.5}};assert.deepEqual(objects.parseModularObjectAttachment(ref),ref);assert.ok(renderToStaticMarkup(React.createElement(objects.ModularObject,{id,variant:style,thumbnail:true})).includes(objects.floraPosterPath(id,style)));assert.ok(fs.existsSync(path.join(packageRoot,'dist/assets/objects/flora-v1',objects.floraPosterPath(id,style))));}
assert.ok(fs.readdirSync(path.join(packageRoot,'dist')).some(n=>/^flora-renderer.*\.js$/.test(n)));console.log('PASS: flora exports, references, SVG posters and lazy renderer are present in the built package.');
