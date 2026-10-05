// Plantilla común de todas las páginas: <head> con SEO, cabecera, navegación lateral y pie.
import { esc, conCursivas, sinMarcas, jsonIncrustado } from "./utilidades.mjs";

export const simboloMarca = (clase = "marca__simbolo") => `<svg class="${clase}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
<rect x="2.25" y="2.25" width="27.5" height="27.5" rx="6" fill="none" stroke="currentColor" stroke-width="2.5"/>
<rect x="6.5" y="6.5" width="19" height="5.2" rx="1.6" fill="#35a44a"/><circle cx="16" cy="9.1" r="1.15" fill="#fff"/>
<rect x="6.5" y="13.4" width="19" height="5.2" rx="1.6" fill="#e3b800"/><circle cx="16" cy="16" r="1.15" fill="#17212b"/>
<rect x="6.5" y="20.3" width="19" height="5.2" rx="1.6" fill="#1f93d6"/><circle cx="16" cy="22.9" r="1.15" fill="#fff"/>
</svg>`;

const ENLACES_PRINCIPALES = [
  { ruta: "/marcos/", texto: "Marcos", seccion: "marcos" },
  { ruta: "/resolver-problemas/", texto: "Resolver problemas", seccion: "rp" },
  { ruta: "/talleres/", texto: "Talleres", seccion: "talleres" },
  { ruta: "/acerca/", texto: "Acerca", seccion: "acerca" },
];

const navPrincipal = (seccion, clase) =>
  ENLACES_PRINCIPALES.map(
    (e) => `<a class="${clase}" href="${e.ruta}"${e.seccion === seccion ? ' aria-current="true"' : ""}>${esc(e.texto)}</a>`
  ).join("");

const buscador = (id) => `<div class="buscador" role="search">
<label class="solo-lectores" for="${id}">Buscar un marco o un prompt</label>
<input class="campo-busqueda" id="${id}" type="search" placeholder="Buscar un marco o un prompt" autocomplete="off" spellcheck="false" aria-controls="${id}-resultados" aria-expanded="false">
<div class="resultados" id="${id}-resultados" hidden></div>
</div>`;

/** Migas de pan visibles. */
const migasHTML = (migas) =>
  migas && migas.length
    ? `<nav class="migas" aria-label="Ruta de navegación"><ol>${migas
        .map((m, i) =>
          i < migas.length - 1 ? `<li><a href="${m.ruta}">${esc(m.nombre)}</a></li>` : `<li aria-current="page">${esc(m.nombre)}</li>`
        )
        .join("")}</ol></nav>`
    : "";

/** Nodos JSON-LD comunes: el sitio y el autor. */
export const nodosBase = (ctx) => {
  const s = ctx.sitio;
  return [
    {
      "@type": "Person",
      "@id": `${s.url}/#autor`,
      name: s.autor.nombre,
      honorificPrefix: "Dr.",
      url: s.autor.web,
      sameAs: [s.autor.orcid, s.autor.web],
    },
    {
      "@type": "WebSite",
      "@id": `${s.url}/#sitio`,
      name: s.nombre,
      alternateName: sinMarcas(s.titulo),
      url: `${s.url}/`,
      description: s.descripcion,
      inLanguage: s.idioma,
      author: { "@id": `${s.url}/#autor` },
      publisher: { "@id": `${s.url}/#autor` },
      license: s.licencias.contenido.url,
    },
  ];
};

/**
 * Genera una página completa.
 * @param {object} ctx  Contexto del sitio (datos, versiones de archivos).
 * @param {object} p    ruta, titulo, descripcion, contenido, lateral, seccion, migas, jsonld, robots, clase, tipoOG
 */
export function pagina(ctx, p) {
  const s = ctx.sitio;
  const url = s.url + p.ruta;
  const tituloDoc = p.tituloDocumento || (p.ruta === "/" ? `${s.nombre}: ${sinMarcas(s.titulo).split(": ")[1]}` : `${p.titulo} · ${s.nombre}`);
  const imagenOG = `${s.url}/img/promptario-og.png`;
  const migasLD = p.migas && p.migas.length
    ? [{
        "@type": "BreadcrumbList",
        itemListElement: p.migas.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.nombre, item: s.url + m.ruta })),
      }]
    : [];
  const grafo = { "@context": "https://schema.org", "@graph": [...nodosBase(ctx), ...(p.jsonld || []), ...migasLD] };
  const conLateral = Boolean(p.lateral);

  return `<!DOCTYPE html>
<html lang="${s.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(tituloDoc)}</title>
<meta name="description" content="${esc(p.descripcion)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="${p.robots || "index, follow"}">
<meta name="author" content="${esc(s.autor.nombre)}">
<meta name="generator" content="Generador de Promptario ${esc(s.version)}">
<meta name="theme-color" content="#eef2f5" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#10151b" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${p.tipoOG || "website"}">
<meta property="og:site_name" content="${esc(s.nombre)}">
<meta property="og:locale" content="es_MX">
<meta property="og:title" content="${esc(p.tituloOG || tituloDoc)}">
<meta property="og:description" content="${esc(p.descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${imagenOG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(s.nombre)}. ${esc(sinMarcas(s.lema))}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="preload" href="/fuentes/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/promptario.css?v=${ctx.huellas.css}">
<script>document.documentElement.classList.add("js");try{var t=localStorage.getItem("promptario:tema");if(t)document.documentElement.dataset.theme=JSON.parse(t)}catch(e){}</script>
<script type="application/ld+json">${jsonIncrustado(grafo)}</script>
</head>
<body class="${p.clase || ""}">
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera">
  <div class="cabecera__in">
    <button class="boton-icono boton-menu" id="boton-menu" type="button" aria-controls="lateral" aria-expanded="false" aria-label="Abrir el menú">☰</button>
    <a class="marca" href="/">${simboloMarca()}<span class="marca__nombre">${esc(s.nombre)}</span></a>
    <nav class="nav-principal" aria-label="Principal">${navPrincipal(p.seccion, "nav-principal__enlace")}</nav>
    ${buscador("buscar")}
    <button class="boton-icono boton-buscar" id="boton-buscar" type="button" aria-label="Buscar un marco o un prompt"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
    <button class="boton-icono" id="boton-tema" type="button" aria-label="Cambiar entre tema claro y oscuro">◐</button>
  </div>
</header>
<div class="velo" id="velo" hidden></div>
<div class="estructura${conLateral ? " con-lateral" : ""}">
  <nav class="lateral" id="lateral" aria-label="Menú">
    <div class="lateral__movil">
      ${buscador("buscar-movil")}
      <div class="lateral__principal">${navPrincipal(p.seccion, "lateral__enlace lateral__enlace--principal")}</div>
    </div>
    ${p.lateral || ""}
  </nav>
  <main id="contenido" tabindex="-1">
    ${migasHTML(p.migas)}
    ${p.contenido}
  </main>
</div>
${pie(ctx)}
<div class="aviso" id="aviso" role="status" aria-live="polite"></div>
<script src="/js/promptario.js?v=${ctx.huellas.js}" defer></script>
</body>
</html>
`;
}

export function pie(ctx) {
  const s = ctx.sitio;
  return `<footer class="pie">
  <div class="pie__in">
    <div class="pie__marca">
      <a class="marca marca--pie" href="/">${simboloMarca()}<span class="marca__nombre">${esc(s.nombre)}</span></a>
      <p class="pie__lema">${conCursivas(s.lema)}</p>
    </div>
    <div class="pie__creditos">
      <p><span aria-hidden="true">💡</span><span><strong>${esc(s.autor.nombreCompleto)}</strong>${esc(s.autor.rol)}. <a href="${esc(s.autor.orcid)}">ORCID</a></span></p>
      <p><span aria-hidden="true">🤖</span><span><strong>${esc(s.colaboracionIA.nombre)}</strong>${esc(s.colaboracionIA.rol)}</span></p>
    </div>
    <nav class="pie__enlaces" aria-label="Información del proyecto">
      <a href="/acerca/">Acerca de Promptario</a>
      <a href="/citar/">Cómo citar</a>
      <a href="/novedades/">Novedades</a>
      <a href="/talleres/">Talleres</a>
      <a href="${esc(s.versionHistorica.url)}">Versión histórica</a>
    </nav>
    <p class="pie__legal">© ${s.anioPublicacion} ${esc(s.autor.nombre)}. Contenido bajo licencia <a href="${s.licencias.contenido.url}">${s.licencias.contenido.nombre}</a>; código bajo licencia <a href="${s.licencias.codigo.url}">${s.licencias.codigo.nombre}</a>. Versión ${esc(s.version)}.</p>
  </div>
</footer>`;
}

/** Bloque del lema con tratamiento de entrada de diccionario. */
export const bloqueLema = (ctx, clase = "") =>
  `<p class="lema ${clase}">${conCursivas(ctx.sitio.lema)}</p>`;
