// Generador de Promptario.
// Lee los datos (datos/), los textos (contenido/) y los archivos estáticos (publico/),
// valida el contenido y escribe el sitio completo en la carpeta dist/.
// Uso: node build.mjs   (Netlify lo ejecuta automáticamente en cada publicación)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { pagina } from "./generador/plantilla.mjs";
import { sustituir, fechaLarga } from "./generador/utilidades.mjs";
import { validar } from "./generador/validar.mjs";
import * as M from "./generador/paginas-marcos.mjs";
import * as R from "./generador/paginas-rp.mjs";
import * as G from "./generador/paginas-generales.mjs";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(RAIZ, "dist");
const leerJSON = (f) => JSON.parse(fs.readFileSync(path.join(RAIZ, "datos", f), "utf8"));
const leerTexto = (f) => fs.readFileSync(path.join(RAIZ, "contenido", f), "utf8").replace(/^<!--[\s\S]*?-->\s*/, "");
const huella = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(RAIZ, "publico", f))).digest("hex").slice(0, 10);

const inicio = Date.now();

/* 1. Datos */
let datos;
try {
  datos = {
    sitio: leerJSON("sitio.json"),
    marcos: leerJSON("marcos.json"),
    rp: leerJSON("resolver-problemas.json"),
    versiones: leerJSON("versiones.json"),
  };
} catch (e) {
  console.error(`\n✖ No se pudo leer un archivo de datos: ${e.message}\n  Revisa que el JSON esté bien formado (comas, comillas y llaves).\n`);
  process.exit(1);
}

/* 2. Validación */
const { errores, avisos } = validar(datos);
avisos.forEach((a) => console.warn(`⚠ ${a}`));
if (errores.length) {
  console.error(`\n✖ Se encontraron ${errores.length} error(es). El sitio no se generó:\n`);
  errores.forEach((e) => console.error(`  • ${e}`));
  console.error("");
  process.exit(1);
}
const cff = fs.existsSync(path.join(RAIZ, "CITATION.cff")) ? fs.readFileSync(path.join(RAIZ, "CITATION.cff"), "utf8") : "";
const versionCff = (cff.match(/^version:\s*"?([\d.]+)"?/m) || [])[1];
if (versionCff && versionCff !== datos.sitio.version)
  console.warn(`⚠ CITATION.cff indica la versión ${versionCff}, pero sitio.json indica ${datos.sitio.version}. Actualiza ambas.`);

/* 3. Contexto compartido por las plantillas */
const ctx = {
  ...datos,
  huellas: { css: huella("css/promptario.css"), js: huella("js/promptario.js") },
};
const s = ctx.sitio;
const marcas = {
  version: s.version,
  fechaVersion: fechaLarga(s.fechaVersion),
  numMarcos: ctx.marcos.marcos.length,
  numPrompts: ctx.rp.prompts.length,
  autorCompleto: s.autor.nombreCompleto,
  orcid: s.autor.orcid,
  web: s.autor.web,
  versionHistorica: s.versionHistorica.url,
  contactoTalleres: s.talleres.contactoUrl,
  contactoTalleresTexto: s.talleres.contactoTexto,
};
const fragmento = (f) => sustituir(leerTexto(f), marcas);

/* 4. Carpeta de salida limpia y archivos estáticos */
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(RAIZ, "publico"), DIST, { recursive: true });

/* 5. Páginas */
const paginas = [
  G.portada(ctx),
  G.acerca(ctx, fragmento("acerca.html")),
  G.talleres(ctx, fragmento("talleres.html")),
  G.apertura(ctx),
  G.citar(ctx),
  G.novedades(ctx),
  G.noEncontrada(ctx),
  M.catalogoMarcos(ctx),
  M.comparativa(ctx),
  M.guiaMarcos(ctx),
  M.buenasPracticasMarcos(ctx, fragmento("marcos-buenas-practicas.html")),
  ...ctx.marcos.marcos.map((m, i) => M.fichaMarco(ctx, m, i)),
  R.inicioRP(ctx),
  R.guiaRP(ctx),
  R.rutasRP(ctx),
  R.buenasPracticasRP(ctx, fragmento("rp-buenas-practicas.html")),
  R.fundamentosRP(ctx, fragmento("rp-fundamentos.html")),
  ...ctx.rp.prompts.map((p, i) => R.fichaPrompt(ctx, p, i)),
];

const rutas = new Set();
for (const p of paginas) {
  if (rutas.has(p.ruta)) {
    console.error(`✖ Dos páginas comparten la dirección ${p.ruta}.`);
    process.exit(1);
  }
  rutas.add(p.ruta);
  const archivo = p.ruta.endsWith(".html") ? path.join(DIST, p.ruta) : path.join(DIST, p.ruta, "index.html");
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, pagina(ctx, p));
}

/* 6. Mapa del sitio, robots.txt e índice del buscador */
const indexables = paginas.filter((p) => !p.robots || !p.robots.startsWith("noindex"));
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexables.map((p) => `  <url><loc>${s.url}${p.ruta}</loc><lastmod>${s.fechaVersion}</lastmod></url>`).join("\n")}
</urlset>
`
);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${s.url}/sitemap.xml\n`);

const indice = [
  ...ctx.marcos.marcos.map((m) => ({
    t: M.etiquetaMarco(m),
    d: `Marco · ${m.nombreEspanol}`,
    u: M.rutaMarco(m),
    k: [m.sigla, m.variante, m.nombreIngles, m.nombreEspanol, m.descripcion, ctx.marcos.categorias[m.categoria].nombre, ...m.usos,
      ...ctx.marcos.necesidades.filter((n) => n.marcos.includes(m.id)).map((n) => n.necesidad)].filter(Boolean).join(" "),
  })),
  ...ctx.rp.prompts.map((p) => ({
    t: `${p.numero}. ${p.titulo}`,
    d: `Prompt · ${ctx.rp.familias[p.familia].nombre}`,
    u: R.rutaPrompt(p),
    k: [p.titulo, p.obtienes, p.cuandoUsarlo, ctx.rp.familias[p.familia].nombre,
      ...ctx.rp.necesidades.filter((n) => n.prompts.includes(p.numero)).map((n) => n.necesidad)].join(" "),
  })),
  ...[
    ["Guía para elegir un marco", "/marcos/guia/", "elegir necesidad tarea recomendación"],
    ["Tabla comparativa de marcos", "/marcos/comparativa/", "comparar componentes complejidad evidencia"],
    ["Buenas prácticas para elaborar prompts", "/marcos/buenas-practicas/", "reglas consejos ética datos"],
    ["Guía para elegir un prompt", "/resolver-problemas/guia/", "elegir necesidad problema"],
    ["Rutas de encadenamiento", "/resolver-problemas/rutas/", "encadenar secuencia ruta"],
    ["Talleres", "/talleres/", "capacitación curso formación docentes"],
    ["Cómo citar Promptario", "/citar/", "cita referencia APA BibTeX DOI"],
    ["Acerca de Promptario", "/acerca/", "nombre latín promptarium autor créditos licencia"],
  ].map(([t, u, k]) => ({ t, d: "Página", u, k })),
];
fs.writeFileSync(path.join(DIST, "indice-busqueda.json"), JSON.stringify(indice));

console.log(
  `✔ Promptario ${s.version}: ${paginas.length} páginas generadas en dist/ ` +
    `(${ctx.marcos.marcos.length} marcos, ${ctx.rp.prompts.length} prompts) en ${Date.now() - inicio} ms.`
);
