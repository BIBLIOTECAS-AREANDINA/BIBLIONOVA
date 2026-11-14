import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(process.argv[2] || 'work/source');
const dir = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const sources = [];
function read(repo, file) {
  const s = fs.readFileSync(path.join(root, repo, file), 'utf8');
  sources.push({repo, file, sha256: crypto.createHash('sha256').update(s).digest('hex')});
  return s;
}
function test(id, product, description, expected, fn) {
  let actual;
  try { actual = fn(); } catch (e) { actual = {exception: e.message}; }
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({id, product, layer:'Código original en Node VM; servicios externos simulados', description, expected, actual, status:pass?'PASS':'FAIL'});
}
const h = vm.createContext({window:{}});
for (const f of ['js/core/utils.js','js/core/registry.js','js/sources/generic.js','js/sources/gruplac.js','js/sources/scopus.js','js/sources/dimensions.js','js/sources/scholar.js','js/core/analyze.js']) {
  if (f==='js/sources/generic.js') vm.runInContext('var HI=window.HI',h);
  vm.runInContext(read('Generador-ndice-H',f),h,{filename:f});
}
const HI=h.window.HI;
const rows=[['Título','Año','Scopus','Dimensions','Scholar','Altmetric','Tipo','Autores'],...[9,6,5,3,1].map((c,i)=>[`Obra ficticia QA ${i+1}`,2021+i,c,Math.max(0,c-1),0,999,'Artículo','Autora QA A']),['Obra ficticia QA 1',2021,8,0,0,999,'Artículo','Autora QA A']];
const fin=HI.finalize(HI.analyzeRows(rows).items);
test('H01','Índice H','Seis filas, un título duplicado; máximo entre fuentes, Altmetric excluido',{h:3,g:4,i10:0,total:24,max:9,n:5},()=>HI.metrics(fin.NUC.map(x=>x.cites)));
test('H02','Índice H','Cero citas y lista vacía producen h=0/g=0',[0,0,0],()=>[HI.hIndex([0,0]),HI.gIndex([0,0]),HI.hIndex([])]);
test('H03','Índice H','Título duplicado conserva mayor valor y no suma citas',9,()=>fin.NUC.find(x=>x.n==='Obra ficticia QA 1').cites);
test('H04','Índice H','Excluir prensa/opinión aunque tenga muchas citas',1,()=>HI.finalize(HI.analyzeRows([rows[0],['Artículo QA',2024,2,0,0,0,'Artículo','QA'],['Opinión QA',2024,900,0,0,0,'Columna de opinión','QA']]).items).NUC.length);
test('H05','Índice H','Archivo sin citas conserva obra y calcula cero',[1,0],()=>{const r=HI.finalize(HI.analyzeRows([['Título','Año'],['Obra ficticia sin citas',2024]]).items);return [r.NUC.length,HI.metrics(r.NUC.map(x=>x.cites)).h];});
test('H06','Índice H','Encabezado después de título introductorio detectado',5,()=>HI.finalize(HI.analyzeRows([['INFORME QA'],[],...rows]).items).NUC.length);
test('H07','Índice H','Citas negativas textuales no deben convertirse a positivas',0,()=>HI.num('-5'));

const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{value:'',style:{},innerHTML:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return[]},getContext(){return{}}});return elements.get(id);};
const b=vm.createContext({document:{getElementById:element,querySelectorAll(){return[]}},Chart:{defaults:{font:{},plugins:{legend:{labels:{}}}}},console});
const html=read('BibliometriX','index.html');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.includes('function parseTabular'));
if(scripts.length!==1)throw Error('No se identifica un único script BibliometriX');
vm.runInContext(scripts[0],b);
const csv=fs.readFileSync(path.join(dir,'fixtures/bibliometrix-scopus-sintetico.csv'),'utf8');
const rec=b.dedupeByDOI(b.parseTabular(csv));
test('B01','BibliometriX','Scopus CSV con BOM, seis filas y DOI duplicado',{n:5,total:24,h:3,g:4},()=>{const c=rec.map(x=>x.cited).sort((a,b)=>b-a);return {n:rec.length,total:c.reduce((a,b)=>a+b,0),h:b.calcH(c),g:b.calcG(c)};});
test('B02','BibliometriX','Deduplicar DOI insensible a mayúsculas y conservar mayor cita',9,()=>rec.find(x=>x.doi.toLowerCase()==='10.9999/qa1').cited);
test('B03','BibliometriX','WoS TSV con encabezados documentados',[{title:'Estudio QA WoS',year:2024,cited:7}],()=>b.parseTabular('Article Title\tPublication Year\tTimes Cited\tAuthors\nEstudio QA WoS\t2024\t7\tAutor QA').map(({title,year,cited})=>({title,year,cited})));
test('B04','BibliometriX','CSV con título entrecomillado, salto de línea y comillas escapadas','Línea 1, "QA"\nLínea 2',()=>b.parseTabular('Title,Year,Cited by\n"Línea 1, ""QA""\nLínea 2",2024,2')[0].title);
test('B05','BibliometriX','Rechazar texto sin campos bibliográficos',0,()=>b.parseTabular('foo,bar\na,b').length);
test('B06','BibliometriX','Filtro temporal 2023–2025 deja tres registros y nueve citas',{n:3,total:9,h:2},()=>{b.dataInput=rec;vm.runInContext('allData=dataInput; renderAll=function(){};',b);element('filterYearMin').value='2023';element('filterYearMax').value='2025';b.applyFilters();return vm.runInContext('({n:activeData.length,total:activeData.reduce((s,r)=>s+r.cited,0),h:calcH(activeData.map(r=>r.cited).sort((a,b)=>b-a))})',b);});
test('B07','BibliometriX','Open Access=No debe clasificarse como cerrado',false,()=>b.parseTabular('Title,Year,Open Access\nObra QA,2024,No')[0].openAccess);
test('B08','BibliometriX','Citas negativas deben rechazarse o normalizarse a cero',0,()=>b.parseTabular('Title,Year,Cited by\nObra QA,2024,-7')[0].cited);

const code=read('digitk-cargue-repositorio','codigo.gs');
const proc=read('digitk-cargue-repositorio','procesador.gs');
function digitk({configured=true,failUpload=false}={}){
  const trace={rows:[],mails:[],folders:0,files:[],writes:[],logs:[]};
  const row=Array(18).fill('');Object.assign(row,{0:'QA-1',2:'solicitante@qa.invalid',6:'Documento ficticio',7:'Autora QA',14:'Recibido - archivos en Drive'});
  const sheet={appendRow(r){trace.rows.push(r)},getDataRange(){return {getValues(){return [Array(18).fill('encabezado'),row]}}},getRange(r,c){return {setValue(v){trace.writes.push({row:r,column:c,value:v});row[c-1]=v}}}};
  const folder={addViewer(){},getUrl(){return 'https://drive.invalid/qa-folder'},createFile(blob){if(failUpload)throw Error('Fallo de carga simulado');trace.files.push(blob);return {getName(){return blob.name},getUrl(){return 'https://drive.invalid/qa-file-'+trace.files.length}}}};
  const c=vm.createContext({Logger:{log(x){trace.logs.push(x)}},GmailApp:{sendEmail(...x){trace.mails.push({kind:'error',args:x})}},Utilities:{base64Decode(s){return Array.from(Buffer.from(s,'base64'))},newBlob(bytes,type,name){return{bytes,type,name}}},SpreadsheetApp:{openById(){return{getSheetByName(){return sheet}}}},HtmlService:{createHtmlOutput(s){return {html:s}}},ContentService:{MimeType:{JSON:'json'},createTextOutput(s){return{content:s,setMimeType(){return this}}}}});
  const configCode=configured?code.replace('PEGAR_ID_DE_GOOGLE_SHEET_AQUI','QA_SHEET').replace('PEGAR_ID_DE_CARPETA_RAIZ_DRIVE_AQUI','QA_DRIVE').replace('CORREO_ADMIN: "admin@tu-dominio.edu.co"','CORREO_ADMIN: "admin@qa.invalid"').replace('DOMINIO_INSTITUCIONAL: "@tu-dominio.edu.co"','DOMINIO_INSTITUCIONAL: "@qa.invalid"'):code;
  vm.runInContext(configCode+'\n'+proc,c);
  c.folder=folder;c.trace=trace;
  vm.runInContext(`_crearCarpetaEnDrive=function(){trace.folders++;return folder};_generarID=function(){return 'QA-1'};_obtenerCorreoColaborador=function(){return 'colaborador@qa.invalid'};_correoConfirmacionSolicitante=function(){trace.mails.push({kind:'confirmacion'})};_correoNotificacionColaborador=function(){trace.mails.push({kind:'colaborador'})};_correoActualizacionEstado=function(){trace.mails.push({kind:'estado'})};_moverAProcesoTerminado=function(){};`,c);
  return {c,trace,row};
}
const file={nombre:'qa.pdf',tipo:'application/pdf',datos:Buffer.from('%PDF-1.4\n%QA ficticio\n%%EOF').toString('base64')};
const payload={correo:'solicitante@qa.invalid',sede:'Sede QA',facultad:'Facultad QA',programa:'Programa QA',titulo:'Documento ficticio QA',autores:['Autora QA'],tipoDoc:'Trabajo de grado',anio:'2024',archivos:{turnitin:file,permisos:file,trabajo:file}};
function submit(d,p){return d.c.procesarFormulario(JSON.stringify(p));}
test('D01','Digitk plantilla','Configuración pública sin reemplazar bloquea uso',false,()=>submit(digitk({configured:false}),payload).ok);
test('D02','Digitk plantilla','Solicitud válida crea tres archivos, fila de 18 campos y dos notificaciones simuladas',{ok:true,files:3,rows:1,columns:18,mails:2},()=>{const d=digitk();const r=submit(d,payload);return {ok:r.ok,files:d.trace.files.length,rows:d.trace.rows.length,columns:d.trace.rows[0]?.length,mails:d.trace.mails.length};});
test('D03','Digitk plantilla','Dominio ajeno rechazado antes de crear datos',{ok:false,folders:0,rows:0},()=>{const d=digitk();const r=submit(d,{...payload,correo:'qa@example.invalid'});return {ok:r.ok,folders:d.trace.folders,rows:d.trace.rows.length};});
test('D04','Digitk plantilla','Título obligatorio vacío no crea datos',{ok:false,folders:0,rows:0},()=>{const d=digitk();const r=submit(d,{...payload,titulo:''});return {ok:r.ok,folders:d.trace.folders,rows:d.trace.rows.length};});
test('D05','Digitk plantilla','Adjunto obligatorio ausente rechaza solicitud',false,()=>submit(digitk(),{...payload,archivos:{turnitin:file,permisos:file}}).ok);
test('D06','Digitk plantilla','Objetos de adjunto vacíos no deben aceptar solicitud ni crear fila',{ok:false,rows:0},()=>{const d=digitk();const r=submit(d,{...payload,archivos:{turnitin:{},permisos:{},trabajo:{}}});return {ok:r.ok,rows:d.trace.rows.length};});
test('D07','Digitk plantilla','Fallo de almacenamiento no debe devolver éxito ni registrar solicitud completa',{ok:false,rows:0},()=>{const d=digitk({failUpload:true});const r=submit(d,payload);return {ok:r.ok,rows:d.trace.rows.length};});
test('D08','Digitk plantilla','Aprobar solicitud actualiza columna de estado y notifica en mock','Aprobado - pendiente Digitk',()=>{const d=digitk();d.c._procesarAccionGestion('aprobar','QA-1','Revisión QA');return d.row[14];});
test('D09','Digitk plantilla','Acción desconocida o ID inexistente no debe escribir en la hoja',0,()=>{const d=digitk();d.c._procesarAccionGestion('desconocida','QA-1','');d.c._procesarAccionGestion('aprobar','QA-NO-EXISTE','');return d.trace.writes.length;});
test('D10','Digitk plantilla','Una solicitud ya cargada no debe retroceder a aprobada por enlace antiguo','Cargado en Digitk',()=>{const d=digitk();d.row[14]='Cargado en Digitk';d.c._procesarAccionGestion('aprobar','QA-1','');return d.row[14];});

const v2=read('Digitek_sistema_repositorio','DigitK_Sistema_Repositorio_v2.gs');
function variant(){const trace={rows:[],mails:[]};const c=vm.createContext({Logger:{log(){}},SpreadsheetApp:{openById(){return{getSheetByName(){return{appendRow(r){trace.rows.push(r)}}}}}},GmailApp:{sendEmail(){trace.mails.push('error')}}});vm.runInContext(v2,c);c.trace=trace;vm.runInContext(`_generarID=function(){return 'QA-V2'};_crearCarpetaEnDrive=function(){return {getUrl(){return 'https://drive.invalid/qa'}}};_enviarCorreoSolicitante=function(){trace.mails.push('solicitante')};_obtenerCorreoColaborador=function(){return 'colaborador@qa.invalid'};_enviarNotificacionColaborador=function(){trace.mails.push('colaborador')};`,c);return{c,trace};}
const event={namedValues:{'Correo institucional':['solicitante@areandina.edu.co'],'Sede':['QA'],'Facultad':['QA'],'Programa académico':['QA'],'Autor(es)':['Autora QA'],'Año':['2024'],'Título del material':['Título ficticio QA'],'Nombre completo':['Persona QA'],'Tipo de material':['Trabajo de grado']}};
test('V01','Digitk v2','Evento completo crea fila de 26 columnas y dos notificaciones simuladas',{rows:1,columns:26,mails:2},()=>{const d=variant();d.c.onFormSubmitIndividual(event);return{rows:d.trace.rows.length,columns:d.trace.rows[0]?.length,mails:d.trace.mails.length};});
test('V02','Digitk v2','Evento con solo correo y sin metadatos obligatorios no debe crear fila',0,()=>{const d=variant();d.c.onFormSubmitIndividual({namedValues:{'Correo institucional':['solicitante@areandina.edu.co']}});return d.trace.rows.length;});

const report={date:'2026-11-13',timezone:'America/Bogota',environment:{node:process.version,network:'Sin red en las VM de prueba; todos los servicios de Google son mocks en memoria',sourceChanges:false},sources,results,summary:{total:results.length,pass:results.filter(x=>x.status==='PASS').length,fail:results.filter(x=>x.status==='FAIL').length},limits:['No verifica integración real de Google Apps Script, Drive, Sheets, Gmail ni permisos institucionales.','Las pruebas de navegador y exportación se registran por separado.','La aceptación de cargas usa bytes ficticios con cabecera PDF; no se validó renderizado PDF.','No se corrigió código de aplicación ni se ejecutaron operaciones productivas.']};
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2));
for(const r of results)console.log(`${r.status} ${r.id} ${r.description} | esperado=${JSON.stringify(r.expected)} obtenido=${JSON.stringify(r.actual)}`);
console.log(JSON.stringify(report.summary));
