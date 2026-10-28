import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const load=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const quiz=load('quiz-cars.json');
const films=load('fast-furious-cars.json');
const errors=[];
function check(ok,msg){if(!ok)errors.push(msg);}
const base='https://raw.githubusercontent.com/taka0717biz-oss/car-world-quiz-content/main/images/';
const countries=new Set(['Japan','Germany','USA','California','UK','France','Italy','Sweden','Korea','China','Czechia','Spain','Australia','India','Brazil']);
check(quiz.schema===1&&Array.isArray(quiz.cars),'Invalid quiz schema');
check(films.schema===1&&Array.isArray(films.cars),'Invalid film catalog');
const ids=new Set(),models=new Set();
let previousId='';
for(const c of quiz.cars||[]){
 const id=String(c.id||'');
 const model=String(c.make||'').toLowerCase()+'|'+String(c.model||'').toLowerCase();
 check(/^[a-z0-9][a-z0-9-]{1,70}$/.test(id),'Bad ID: '+id);
 check(!ids.has(id),'Duplicate ID: '+id);
 check(!models.has(model),'Duplicate model: '+model);
 check(id>previousId,'Unsorted ID (breaks stable daily question order): '+id);
 ids.add(id);models.add(model);previousId=id;
 check(typeof c.make==='string'&&c.make.length>0&&c.make.length<=65,'Bad make: '+id);
 check(typeof c.model==='string'&&c.model.length>0&&c.model.length<=110,'Bad model: '+id);
 check(Number.isInteger(c.year)&&c.year>=1760&&c.year<=2030,'Bad year: '+id);
 check(typeof c.city==='string'&&countries.has(c.city.split(',').at(-1).trim()),'Unrecognized country: '+id);
 check(Number.isFinite(c.lat)&&Math.abs(c.lat)<=90&&Number.isFinite(c.lon)&&Math.abs(c.lon)<=180,'Bad coordinates: '+id);
 check(typeof c.description==='string'&&c.description.length>0&&c.description.length<=500&&!/[<>]/.test(c.description),'Bad description: '+id);
 check(c.published===true&&c.originVerified===true&&c.imageRightsApproved===true,'Not approved: '+id);
 check(Array.isArray(c.collections)&&c.collections.includes('fast-furious'),'Bad collection: '+id);
 check(/^\d{4}-\d{2}-\d{2}$/.test(c.availableFrom)&&!Number.isNaN(Date.parse(c.availableFrom)),'Bad date: '+id);
 check(typeof c.image==='string'&&c.image.startsWith(base),'External image URL: '+id);
 if(typeof c.image==='string'&&c.image.startsWith(base)){
  const name=c.image.slice(base.length);
  check(/^[a-z0-9][a-z0-9-]{1,90}\.webp$/.test(name),'Bad image filename: '+id);
  const file=path.join(root,'images',name);
  if(!fs.existsSync(file))check(false,'Missing image: '+id);
  else{
   const b=fs.readFileSync(file);
   check(b.length>5000&&b.length<2000000&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP','Invalid WEBP image: '+id);
  }
 }
}
const ready=(films.cars||[]).filter(x=>x.quizReady===true);
check(ready.length===quiz.cars.length,'Quiz/catalog count mismatch: '+ready.length+' vs '+quiz.cars.length);
const idx=process.argv.indexOf('--as-of'),asOf=idx>=0?process.argv[idx+1]:null;
if(asOf)check(/^\d{4}-\d{2}-\d{2}$/.test(asOf),'Bad as-of date');
console.log('Production entries: '+quiz.cars.length+'; catalog: '+films.cars.length+'; ready: '+ready.length);
if(asOf)console.log('Eligible by '+asOf+' JST: '+quiz.cars.filter(x=>x.availableFrom<=asOf).length);
if(errors.length){for(const x of errors)console.error('FAIL '+x);process.exitCode=1;}
else console.log('PASS content, images, dates, order and country data');
