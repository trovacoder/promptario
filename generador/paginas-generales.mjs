// Páginas generales del sitio: portada, Acerca, Talleres, pantalla de apertura, Cómo citar, Novedades y 404.
import { esc, sinMarcas, fechaLarga, tintaSobre } from "./utilidades.mjs";
import { bloqueLema, simboloMarca } from "./plantilla.mjs";
import { etiquetaMarco, rutaMarco } from "./paginas-marcos.mjs";

/* ---------- Portada ---------- */
export function portada(ctx) {
  const { sitio: s, marcos: D, rp } = ctx;
  const porId = (id) => D.marcos.find((m) => m.id === id);
  const cajones = s.portada.gavetero.map(porId).map((m) => {
    const piezas = m.pasos.map((p, i) => `<span style="background:${D.paleta[i % 6]};color:${tintaSobre(i)}">${esc(p.letra)}</span>`).join("");
    return `<li><a class="cajon" href="${rutaMarco(m)}" style="--c:${D.categorias[m.categoria].color}">
<span class="cajon__piezas" aria-hidden="true">${piezas}</span>
<span class="cajon__nombre">${esc(etiquetaMarco(m))}<span class="solo-lectores">: ${esc(m.nombreEspanol)}</span></span>
<span class="cajon__tirador" aria-hidden="true"></span></a></li>`;
  }).join("\n");

  const contenido = `<section class="portada">
<div class="portada__texto">
<h1 class="portada__titulo">${esc(s.nombre)}</h1>
${bloqueLema(ctx, "lema--portada")}
<p class="entradilla">${D.marcos.length} marcos de trabajo para elaborar prompts y ${rp.prompts.length} prompts para resolver problemas, con pasos, ejemplos educativos, fundamentos y un constructor. Para docentes y estudiantes que quieren dar mejores instrucciones a la inteligencia artificial.</p>
<div class="fila"><a class="boton boton--principal" href="/marcos/">Explorar los marcos</a><a class="boton" href="/resolver-problemas/">Resolver un problema</a></div>
</div>
<div class="gavetero-envoltura">
<ul class="gavetero" aria-label="Doce marcos del Promptario">
${cajones}
</ul>
<p class="gavetero__pie">Cada cajón guarda un marco listo para usarse.</p>
</div>
</section>

<section class="principio" aria-labelledby="principio">
<h2 id="principio" class="solo-lectores">Principio</h2>
<blockquote><p>«${esc(s.principio)}»</p></blockquote>
<p class="principio__intro">Antes de elegir un marco, asegúrate de darle a la IA:</p>
<ul class="principio__lista"><li><span aria-hidden="true">🎭</span> un rol claro</li><li><span aria-hidden="true">🗺️</span> suficiente contexto</li><li><span aria-hidden="true">✅</span> una tarea específica</li><li><span aria-hidden="true">📄</span> el resultado que quieres</li></ul>
</section>

<section class="colecciones" aria-labelledby="colecciones">
<h2 id="colecciones">Dos colecciones</h2>
<div class="colecciones__rejilla">
<a class="coleccion" href="/marcos/">
<span class="coleccion__nombre">${D.marcos.length} marcos de trabajo</span>
<span class="coleccion__texto">Esquemas como RTF, CO-STAR o GROW para estructurar una instrucción: qué rol, qué contexto, qué tarea y qué formato. Agrupados en ${Object.keys(D.categorias).length} categorías y con su nivel de evidencia.</span>
<span class="coleccion__accion">Ver los marcos</span></a>
<a class="coleccion coleccion--rp" href="/resolver-problemas/">
<span class="coleccion__nombre">${rp.prompts.length} prompts para resolver problemas</span>
<span class="coleccion__texto">Plantillas para diagnosticar causas, decidir, replantear, planear y anticipar riesgos, con rutas para encadenarlas en una misma conversación.</span>
<span class="coleccion__accion">Ver los prompts</span></a>
</div>
</section>

<section class="necesidades" aria-labelledby="necesidades">
<h2 id="necesidades">¿Qué necesitas hacer?</h2>
<ul class="necesidades__lista">${s.portada.necesidades.map((n) => `<li><a href="${esc(n.enlace)}">${esc(n.texto)}</a></li>`).join("")}</ul>
<p class="tenue">Más opciones en las guías de selección de <a href="/marcos/guia/">marcos</a> y de <a href="/resolver-problemas/guia/">prompts</a>.</p>
</section>

<section class="franja-talleres" aria-labelledby="talleres">
<div>
<h2 id="talleres">Talleres para docentes y estudiantes</h2>
<p>Aprende a escribir instrucciones claras a la IA y a usarlas con criterio en la docencia, el estudio y la investigación.</p>
</div>
<a class="boton boton--principal" href="/talleres/">Conoce los talleres</a>
</section>`;

  return {
    ruta: "/",
    titulo: s.nombre,
    descripcion: s.descripcion,
    seccion: "",
    clase: "pagina-portada",
    jsonld: [{
      "@type": "WebApplication",
      "@id": `${s.url}/#aplicacion`,
      name: s.nombre,
      alternateName: sinMarcas(s.titulo),
      url: `${s.url}/`,
      description: s.descripcion,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      browserRequirements: "Navegador actual; el constructor de prompts requiere JavaScript.",
      softwareVersion: s.version,
      datePublished: s.fechaVersion,
      inLanguage: s.idioma,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "MXN" },
      author: { "@id": `${s.url}/#autor` },
      license: s.licencias.codigo.url,
      ...(s.doi ? { identifier: `https://doi.org/${s.doi}` } : {}),
      audience: { "@type": "EducationalAudience", educationalRole: ["teacher", "student"] },
    }],
    contenido,
  };
}

/* ---------- Acerca de ---------- */
export function acerca(ctx, fragmento) {
  const ruta = "/acerca/";
  return {
    ruta,
    titulo: "Acerca de Promptario",
    descripcion: "Origen del nombre Promptario, propósito del proyecto, cómo se elaboró, autoría, colaboración con IA, versiones y licencias.",
    seccion: "acerca",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Acerca de Promptario", ruta }],
    jsonld: [{ "@type": "AboutPage", name: "Acerca de Promptario", url: ctx.sitio.url + ruta, isPartOf: { "@id": `${ctx.sitio.url}/#sitio` }, about: { "@id": `${ctx.sitio.url}/#aplicacion` } }],
    contenido: `<header class="encabezado-pagina encabezado-pagina--lema"><h1>Acerca de Promptario</h1>${bloqueLema(ctx, "lema--pagina")}</header>
<div class="prosa">${fragmento}</div>`,
  };
}

/* ---------- Talleres ---------- */
export function talleres(ctx, fragmento) {
  const ruta = "/talleres/";
  return {
    ruta,
    titulo: "Talleres de elaboración de prompts",
    descripcion: "Talleres para docentes y estudiantes sobre cómo escribir prompts, elegir un marco de trabajo, resolver problemas con IA y usarla con responsabilidad.",
    seccion: "talleres",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Talleres", ruta }],
    jsonld: [{
      "@type": "Service",
      name: "Talleres de elaboración de prompts",
      serviceType: "Capacitación docente",
      provider: { "@id": `${ctx.sitio.url}/#autor` },
      url: ctx.sitio.url + ruta,
      areaServed: "MX",
      audience: { "@type": "EducationalAudience", educationalRole: ["teacher", "student"] },
    }],
    contenido: `<header class="encabezado-pagina encabezado-pagina--lema"><h1>Talleres</h1>${bloqueLema(ctx, "lema--pagina")}</header>
<div class="prosa">${fragmento}</div>`,
  };
}

/* ---------- Pantalla de apertura para proyectar ---------- */
export function apertura(ctx) {
  const s = ctx.sitio;
  return {
    ruta: "/talleres/apertura/",
    titulo: "Pantalla de apertura",
    descripcion: "Pantalla para proyectar el lema de Promptario al iniciar un taller.",
    robots: "noindex, follow",
    clase: "pagina-apertura",
    seccion: "talleres",
    contenido: `<section class="apertura">
${simboloMarca("apertura__simbolo")}
<h1 class="apertura__nombre">${esc(s.nombre)}</h1>
${bloqueLema(ctx, "lema--apertura")}
<p class="apertura__pie">${esc(s.url.replace("https://", ""))}<br>${esc(s.autor.nombreCompleto)}</p>
<p class="apertura__ayuda"><button class="boton" type="button" data-accion="pantalla-completa">Pantalla completa</button> <a href="/talleres/">Volver a Talleres</a></p>
</section>`,
  };
}

/* ---------- Cómo citar ---------- */
export function citar(ctx) {
  const s = ctx.sitio;
  const ruta = "/citar/";
  const orcidId = s.autor.orcid.replace("https://orcid.org/", "");
  const localizador = s.doi ? `https://doi.org/${s.doi}` : s.url;
  const referencia = `${esc(s.autor.apellidosCita)}, ${esc(s.autor.inicialesCita)} (${s.anioPublicacion}). <i>${esc(sinMarcas(s.titulo))}</i> (Versión ${esc(s.version)}) [Aplicación web]. ${esc(localizador)}`;
  const bibtex = `@software{defuentes_promptario_${s.anioPublicacion},
  author   = {${s.autor.apellidosCita}, ${s.autor.nombre.split(" ")[0]}},
  title    = {${sinMarcas(s.titulo)}},
  year     = {${s.anioPublicacion}},
  version  = {${s.version}},
  url      = {${s.url}},${s.doi ? `\n  doi      = {${s.doi}},` : ""}
  note     = {Aplicación web. ORCID del autor: ${orcidId}},
  language = {spanish}
}`;
  return {
    ruta,
    titulo: "Cómo citar Promptario",
    descripcion: "Referencia de Promptario en formato APA 7 y BibTeX, y cómo citar una ficha concreta de un marco o de un prompt.",
    seccion: "acerca",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Cómo citar", ruta }],
    contenido: `<header class="encabezado-pagina"><h1>Cómo citar Promptario</h1>
<p class="entradilla">Si usas Promptario en una clase, un taller, una tesis o una publicación, cítalo como desarrollo tecnológico.</p></header>
<div class="prosa">
<h2 id="apa">Referencia en formato APA 7</h2>
<p class="referencia" id="referencia-apa">${referencia}</p>
<p><button class="boton boton--principal" type="button" data-accion="copiar-cita" data-objetivo="referencia-apa">Copiar la referencia</button></p>
<h2 id="bibtex">BibTeX</h2>
<pre class="codigo" id="referencia-bibtex">${esc(bibtex)}</pre>
<p><button class="boton" type="button" data-accion="copiar-cita" data-objetivo="referencia-bibtex">Copiar BibTeX</button></p>
<h2 id="citar-una-ficha">Citar una ficha</h2>
<p>Cada ficha de un marco o de un prompt incluye al final su propia referencia, en el apartado «Cita esta ficha». Por ejemplo:</p>
<p class="referencia">${esc(s.autor.apellidosCita)}, ${esc(s.autor.inicialesCita)} (${s.anioPublicacion}). CO-STAR: Contexto, Objetivo, Estilo, Tono, Audiencia, Respuesta. En <i>${esc(sinMarcas(s.titulo))}</i> (Versión ${esc(s.version)}). ${esc(s.url)}/marcos/costar/</p>
<h2 id="datos-del-desarrollo">Datos del desarrollo</h2>
<div class="tabla-envoltura"><table class="tabla-resumen"><tbody>
<tr><th scope="row">Autor</th><td>${esc(s.autor.nombreCompleto)}. ORCID: <a href="${esc(s.autor.orcid)}">${esc(orcidId)}</a></td></tr>
<tr><th scope="row">Versión</th><td>${esc(s.version)}, del ${esc(fechaLarga(s.fechaVersion))}. <a href="/novedades/">Ver novedades</a></td></tr>
<tr><th scope="row">Identificador</th><td>${s.doi ? `DOI: <a href="https://doi.org/${esc(s.doi)}">${esc(s.doi)}</a>` : "El DOI se asignará al archivar esta versión en Zenodo."}</td></tr>
${s.repositorio ? `<tr><th scope="row">Código fuente</th><td><a href="${esc(s.repositorio)}">${esc(s.repositorio)}</a></td></tr>` : ""}
<tr><th scope="row">Licencias</th><td>Contenido: <a href="${s.licencias.contenido.url}">${s.licencias.contenido.nombre}</a>. Código: <a href="${s.licencias.codigo.url}">${s.licencias.codigo.nombre}</a>.</td></tr>
<tr><th scope="row">Colaboración con IA</th><td>${esc(s.colaboracionIA.nombre)}: ${esc(s.colaboracionIA.rol.charAt(0).toLowerCase() + s.colaboracionIA.rol.slice(1))}.</td></tr>
</tbody></table></div>
</div>`,
  };
}

/* ---------- Novedades ---------- */
export function novedades(ctx) {
  const ruta = "/novedades/";
  return {
    ruta,
    titulo: "Novedades y versiones",
    descripcion: "Historial de versiones de Promptario: qué cambió en cada actualización.",
    seccion: "acerca",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Novedades", ruta }],
    contenido: `<header class="encabezado-pagina"><h1>Novedades</h1>
<p class="entradilla">Qué cambió en cada versión de Promptario.</p></header>
<div class="prosa">${ctx.versiones.versiones.map((v) => `<section class="version" id="v${esc(v.version)}">
<h2>Versión ${esc(v.version)}: ${esc(v.titulo)}</h2>
<p class="version__fecha"><time datetime="${esc(v.fecha)}">${esc(fechaLarga(v.fecha))}</time></p>
<ul>${v.cambios.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
</section>`).join("\n")}</div>`,
  };
}

/* ---------- 404 ---------- */
export function noEncontrada() {
  return {
    ruta: "/404.html",
    titulo: "Página no encontrada",
    descripcion: "La página que buscas no existe o cambió de dirección.",
    robots: "noindex, follow",
    seccion: "",
    contenido: `<header class="encabezado-pagina"><h1>No encontramos esta página</h1>
<p class="entradilla">Puede que la dirección haya cambiado. Usa el buscador de arriba o vuelve a una de estas secciones:</p></header>
<ul class="necesidades__lista"><li><a href="/">Inicio</a></li><li><a href="/marcos/">Marcos de trabajo</a></li><li><a href="/resolver-problemas/">Prompts para resolver problemas</a></li></ul>`,
  };
}
