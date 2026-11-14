// Documenta las iniciativas del tablero: busca dónde aparecen en la biblioteca digital (bidig),
// toma pantallazos y genera una ficha por iniciativa en docs/iniciativas/.
// Uso: npm install && npx playwright install chromium && npm run documentar
// Requiere acceso a bidig: ejecutar desde un equipo institucional (GitHub Actions está bloqueado).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';

const OUT = 'docs/iniciativas';
const IMG = `${OUT}/img`;
mkdirSync(IMG, { recursive: true });
const NOVA = 'https://bibliotecas-areandina.github.io/BIBLIONOVA/';
const fuentes = JSON.parse(readFileSync(`${OUT}/fuentes-bidig.json`, 'utf8'));
const BIDIG = fuentes.bidigBase;
const hoy = new Date().toISOString().slice(0, 10);

// Iniciativas tal como están en el tablero
const html = readFileSync('index.html', 'utf8');
const bloque = html.match(/const INICIATIVAS = (\[[\s\S]*?\n\]);/)[1];
const INICIATIVAS = vm.runInNewContext(bloque);
const PILARES = { pilar1: 'Experiencia al Usuario', pilar2: 'Gestión Institucional', pilar3: 'Academia' };
const ESTADO = { activo: 'En operación', desarrollo: 'En desarrollo', pendiente: 'Por documentar / definir' };
const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'es-CO' });
const avisos = [];

async function abrir(url, espera = 2000) {
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); // algunas páginas nunca quedan en reposo
  await page.waitForTimeout(espera);
  for (const sel of ['.dialog-close-button', '[aria-label="Cerrar"]', '[aria-label="Close"]']) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) await el.click().catch(() => {});
  }
  const texto = await page.locator('body').innerText().catch(() => '');
  if (/Web Page Blocked|Access Denied/i.test(texto)) { await page.close(); throw new Error(`bloqueada: ${url}`); }
  return page;
}

// 1) Páginas de bidig (una captura por ruta)
const rutas = [...new Set(Object.values(fuentes.iniciativas).flatMap((f) => f.paginas))];
const paginas = {};
for (const ruta of rutas) {
  const id = 'bidig-' + (slug(ruta) || 'home');
  try {
    const page = await abrir(BIDIG + ruta);
    const titulo = await page.title();
    await page.screenshot({ path: `${IMG}/${id}.png` });
    paginas[ruta] = { id, titulo: titulo.replace(/ - Bibliotecas Areandina$/, ''), url: BIDIG + ruta };
    await page.close();
  } catch (e) { avisos.push(`${ruta}: ${e.message}`); }
}

// 2) Tarjetas de la página BiblioNova de bidig
const tarjetas = {};
try {
  const page = await abrir(BIDIG + fuentes.paginaBiblionova, 3000);
  await page.addStyleTag({ content: '#main-header, header { position: static !important; }' });
  const n = await page.locator('.bn__proj-card').count();
  for (let i = 0; i < n; i++) {
    const c = page.locator('.bn__proj-card').nth(i);
    const texto = (await c.innerText()).split('\n').map((s) => s.trim()).filter(Boolean);
    const clase = await c.getAttribute('class');
    const estado = /bn--dev/.test(clase) ? 'desarrollo' : 'activo';
    const titulo = texto.find((t) => !/^(EN PRODUCCIÓN|EN DESARROLLO|PILAR \d)/.test(t)) ?? '';
    await c.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await c.screenshot({ path: `${IMG}/bidig-tarjeta-${i}.png` });
    tarjetas[i] = { estado, titulo, texto: texto.filter((t) => !/^(EN PRODUCCIÓN|EN DESARROLLO)$/.test(t)), img: `bidig-tarjeta-${i}.png` };
  }
  await page.close();
} catch (e) { avisos.push(`tarjetas: ${e.message}`); }

// 3) Tarjeta de cada iniciativa en el tablero publicado
const tableroImg = {};
try {
  const page = await ctx.newPage();
  await page.goto(NOVA, { waitUntil: 'networkidle', timeout: 60000 });
  await page.addStyleTag({ content: '#progressBar, nav { display: none !important; }' });
  for (const ini of INICIATIVAS) {
    const card = page.locator('.tool-card', { hasText: ini.nombre }).first();
    if (!(await card.count())) continue;
    const id = `tablero-${slug(ini.nombre)}.png`;
    try { await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(250); await card.screenshot({ path: `${IMG}/${id}`, timeout: 15000 }); tableroImg[ini.nombre] = id; } catch { /* sin captura */ }
  }
  await page.close();
} catch (e) { avisos.push(`tablero: ${e.message}`); }
await browser.close();

// 4) Fichas
const filas = [];
INICIATIVAS.forEach((ini, n) => {
  const num = String(n + 1).padStart(2, '0');
  const f = fuentes.iniciativas[ini.nombre] ?? { paginas: [] };
  const archivo = `${num}-${slug(ini.nombre)}.md`;
  const tarjeta = f.tarjeta !== undefined ? tarjetas[f.tarjeta] : undefined;
  const pags = f.paginas.map((r) => paginas[r]).filter(Boolean);
  const hallazgo = tarjeta || pags.length ? (f.mencion ? 'Mención' : 'Sí') : 'No encontrado';
  const L = [];
  L.push(`# ${num} · ${ini.nombre}`, '', `**${ini.scope}** · ${PILARES[ini.pilar]} · Estado en el tablero: **${ESTADO[ini.estado]}**`, '');
  L.push('## Qué es', '', ini.desc, '');
  const ficha = ini.ficha ?? {};
  const campos = [['Definición', 'definicion'], ['Descripción técnica', 'descripcionTecnica'], ['Objetivo', 'objetivo'], ['Comunidades', 'comunidades'], ['Resultados', 'resultados'], ['Seguimientos', 'seguimientos'], ['Versiones', 'versiones'], ['Proceso', 'proceso'], ['Desarrolladores', 'desarrolladores']];
  const llenos = campos.filter(([, k]) => ficha[k]);
  if (llenos.length) { L.push(...llenos.map(([t, k]) => `- **${t}:** ${ficha[k]}`), ''); }
  if (tableroImg[ini.nombre]) L.push('## En el tablero', '', `![${ini.nombre} en el tablero BiblioNova](img/${tableroImg[ini.nombre]})`, '');
  L.push('## En la biblioteca digital (bidig)', '');
  if (hallazgo === 'No encontrado') {
    L.push(`No se encontró esta iniciativa en bidig (búsqueda en el sitio y revisión de las páginas de BiblioNova, Intelectus, CINAR, servicios y alfabetización, ${hoy}). Pendiente de publicar o de confirmar con quien la lidera.`, '');
  } else {
    if (f.mencion) L.push('Solo aparece mencionada dentro de otras páginas; no tiene página propia.', '');
    if (tarjeta) {
      L.push(`Tarjeta en [BiblioNova en bidig](${BIDIG}${fuentes.paginaBiblionova}) — estado allí: **${tarjeta.estado === 'activo' ? 'en producción' : 'en desarrollo'}**.`, '', `![Tarjeta en bidig](img/${tarjeta.img})`, '');
      L.push(...tarjeta.texto.slice(0, 12).map((t) => `> ${t}`), '');
    }
    for (const p of pags) L.push(`- [${p.titulo}](${p.url})`, '', `  ![${p.titulo}](img/${p.id}.png)`, '');
  }
  const ext = [ini.url, ...(f.externo ?? [])].filter(Boolean);
  if (ext.length) L.push('## Enlaces', '', ...[...new Set(ext)].map((u) => `- ${u}`), '');
  const obs = [];
  if (tarjeta && tarjeta.estado !== ini.estado) obs.push(`El tablero dice **${ESTADO[ini.estado]}** y bidig dice **${tarjeta.estado === 'activo' ? 'en producción' : 'en desarrollo'}**. Hay que unificar el estado.`);
  if (f.relacion) obs.push(`Relacionada con **${f.relacion}**; falta aclarar en qué se diferencia.`);
  if (hallazgo === 'No encontrado' && ini.estado === 'activo') obs.push('Figura como activa en el tablero pero no aparece en bidig.');
  if (obs.length) L.push('## Observaciones', '', ...obs.map((o) => `- ${o}`), '');
  L.push('## Verificación', '', `Revisado el ${hoy}: búsqueda en bidig y captura de las páginas citadas. Que una página cargue no prueba el funcionamiento del servicio; los enlaces externos (Gemini, Odilo, Looker) piden sesión y no se capturaron.`, '');
  writeFileSync(`${OUT}/${archivo}`, L.join('\n'));
  filas.push({ num, ini, archivo, hallazgo, obs: obs.length });
});

// 5) Índice
const I = ['# Iniciativas de BiblioNova en la biblioteca digital', '',
  `Cada iniciativa del [tablero](${NOVA}) se buscó en [bidig](${BIDIG}/) y se documentó con pantallazos. Actualizado el ${hoy}. Se regenera con \`npm run documentar\` desde un equipo institucional.`, '',
  `**Resumen:** ${filas.filter((x) => x.hallazgo === 'Sí').length} con presencia propia en bidig, ${filas.filter((x) => x.hallazgo === 'Mención').length} solo mencionadas, ${filas.filter((x) => x.hallazgo === 'No encontrado').length} sin rastro en bidig, ${filas.filter((x) => x.obs).length} con observaciones por resolver.`, ''];
for (const [pid, pnombre] of Object.entries(PILARES)) {
  I.push(`## ${pnombre}`, '', '| # | Iniciativa | Estado en el tablero | En bidig | Observaciones |', '|---|---|---|---|---|');
  for (const x of filas.filter((r) => r.ini.pilar === pid)) I.push(`| ${x.num} | [${x.ini.nombre}](${x.archivo}) | ${ESTADO[x.ini.estado]} | ${x.hallazgo} | ${x.obs ? 'Sí' : '—'} |`);
  I.push('');
}
if (fuentes.conciliar?.length) I.push("## Cifras por conciliar entre bidig y el tablero", "", ...fuentes.conciliar.map((c) => `- ${c}`), "");
if (avisos.length) I.push('## Avisos de la última ejecución', '', ...avisos.map((a) => `- ${a}`), '');
writeFileSync(`${OUT}/README.md`, I.join('\n'));
console.log(JSON.stringify({ fichas: filas.length, paginas: Object.keys(paginas).length, tarjetas: Object.keys(tarjetas).length, tableroCapturas: Object.keys(tableroImg).length, avisos }, null, 1));
