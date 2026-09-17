// Verify the package a consumer actually installs, not source aliases.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const consumer=process.argv[2];if(!consumer)throw Error('Consumer directory required');
const load=createRequire(path.resolve(consumer,'verify.cjs')),objects=load('@blueprint-modular/core/objects'),React=load('react'),{renderToStaticMarkup}=load('react-dom/server'),packageRoot=path.resolve(path.dirname(load.resolve('@blueprint-modular/core/objects')),'../..');
for(const name of ['AtomicOrbitalLayer','AtomicDensityLayer','AtomSphereLayer','MoleculeLayer','parseMoleculeGraph','parseMoleculeSettings','bondLength','bondAngle','recognizeMolecule','moleculeFormula','electronConfiguration'])assert.equal(typeof objects[name],'function',name);
for(const preset of Object.keys(objects.MOLECULE_PRESETS))for(const style of ['midnight','paper','transparent']){
 const science={...objects.DEFAULT_SCIENCE_SETTINGS,molecule:{...objects.moleculePresetSettings(preset),motion:true,motionSpeed:.75}};
 const ref={schemaVersion:1,kind:'modular-object',id:'science-molecule',version:'1.0.0',style,science,animation:{playing:false,speed:1}};
 assert.deepEqual(objects.parseModularObjectAttachment(ref),ref);
 const html=renderToStaticMarkup(React.createElement(objects.ModularObject,{id:ref.id,version:ref.version,variant:style,molecule:science.molecule}));
 assert.ok(html.includes('data-science-layer="molecule"'));assert.ok(!html.includes('Objet indisponible'));
 assert.ok(fs.existsSync(path.join(packageRoot,'dist/assets/objects/science-v1',objects.sciencePosterPath(ref.id,style))));
}
assert.ok(objects.recognizeMolecule(objects.MOLECULE_PRESETS.ethanol.graph).connectivity.includes('ethanol'));
console.log(`PASS: packed /objects exports, ${Object.keys(objects.MOLECULE_PRESETS).length*3} molecular variants, references and distributed SVG assets.`);
