// Páginas de la sección «Marcos de trabajo»: catálogo, fichas, tabla comparativa, guía y buenas prácticas.
import { esc, slug, recortar, tintaSobre, jsonIncrustado, sinMarcas } from "./utilidades.mjs";
import { figuraMarco } from "./figura.mjs";

export const etiquetaMarco = (m) => m.sigla + (m.variante ? ` (${m.variante})` : "");
export const rutaMarco = (m) => `/marcos/${m.id}/`;
const textoEvidencia = (D, m) => m.evidenciaTexto || D.evidencias[m.evidencia];

/** Piezas de letras con los colores de la paleta de pasos. */
export const tipos = (m, paleta) =>
  m.pasos.map((p, i) => `<span style="background:${paleta[i % 6]};color:${tintaSobre(i)}">${esc(p.letra)}</span>`).join("");

/** Tarjeta de un marco para catálogos y guías. */
export const tarjetaMarco = (D, m) => {
  const cat = D.categorias[m.categoria];
  return `<a class="tarjeta" href="${rutaMarco(m)}" data-cat="${m.categoria}" data-ev="${m.evidencia}" style="--c:${cat.color}">
<span class="tarjeta__tipos" aria-hidden="true">${tipos(m, D.paleta)}</span>
<span class="tarjeta__icono" aria-hidden="true">${m.icono}</span>
<span class="tarjeta__nombre">${esc(etiquetaMarco(m))}</span>
<span class="tarjeta__sub">${esc(m.nombreEspanol)}</span>
</a>`;
};

/** Menú lateral de la sección. */
export function lateralMarcos(ctx, rutaActual) {
  const D = ctx.marcos;
  const enlace = (ruta, html, clase = "") =>
    `<a class="lateral__enlace ${clase}" href="${ruta}"${ruta === rutaActual ? ' aria-current="page"' : ""}>${html}</a>`;
  let h = `<div class="lateral__seccion"><p class="lateral__titulo">Marcos de trabajo</p>
${enlace("/marcos/", "Catálogo")}
${enlace("/marcos/comparativa/", "Tabla comparativa")}
${enlace("/marcos/guia/", "Guía de selección")}
${enlace("/marcos/buenas-practicas/", "Buenas prácticas")}</div>`;
  for (const [k, cat] of Object.entries(D.categorias)) {
    const lista = D.marcos.filter((m) => m.categoria === k);
    h += `<div class="lateral__seccion"><p class="lateral__grupo"><i style="--c:${cat.color}"></i>${esc(cat.nombre)}</p>`;
    h += lista
      .map((m) =>
        enlace(rutaMarco(m), `<span aria-hidden="true">${m.icono}</span><span>${esc(etiquetaMarco(m))}</span><small>${esc(m.nombreEspanol)}</small>`, "lateral__enlace--elemento")
      )
      .join("");
    h += `</div>`;
  }
  return h;
}

const recursoAprendizaje = (ctx, ruta, nombre, descripcion, extra = {}) => ({
  "@type": "LearningResource",
  "@id": `${ctx.sitio.url}${ruta}#recurso`,
  name: nombre,
  description: descripcion,
  url: `${ctx.sitio.url}${ruta}`,
  inLanguage: ctx.sitio.idioma,
  isPartOf: { "@id": `${ctx.sitio.url}/#sitio` },
  author: { "@id": `${ctx.sitio.url}/#autor` },
  license: ctx.sitio.licencias.contenido.url,
  isAccessibleForFree: true,
  audience: { "@type": "EducationalAudience", educationalRole: ["teacher", "student"] },
  ...extra,
});

/** Referencia APA 7 de una ficha. */
export const referenciaFicha = (ctx, titulo, ruta) => {
  const s = ctx.sitio;
  return `${esc(s.autor.apellidosCita)}, ${esc(s.autor.inicialesCita)} (${s.anioPublicacion}). ${esc(titulo)}. En <i>${esc(sinMarcas(s.titulo))}</i> (Versión ${esc(s.version)}). ${esc(s.url + ruta)}`;
};

export const bloqueCita = (ctx, titulo, ruta) => `<details class="cita-ficha">
<summary>Cita esta ficha</summary>
<p class="referencia" id="referencia-ficha">${referenciaFicha(ctx, titulo, ruta)}</p>
<button class="boton" type="button" data-accion="copiar-cita" data-objetivo="referencia-ficha">Copiar la referencia</button>
</details>`;

/* ---------- Catálogo ---------- */
export function catalogoMarcos(ctx) {
  const D = ctx.marcos;
  const ruta = "/marcos/";
  const contenido = `<header class="encabezado-pagina">
<h1>Marcos de trabajo para la elaboración de prompts</h1>
<p class="entradilla">${D.marcos.length} marcos documentados, con sus pasos, origen, nivel de evidencia, buenas prácticas, ejemplos traducidos y un constructor para armar tu propio prompt.</p>
</header>
<section class="catalogo" data-catalogo>
<h2 class="solo-lectores">Catálogo</h2>
<div class="filtros" role="group" aria-label="Filtrar el catálogo">
<button class="chip" type="button" data-filtro-cat="" aria-pressed="true">Todos</button>
${Object.entries(D.categorias).map(([k, c]) => `<button class="chip" type="button" data-filtro-cat="${k}" aria-pressed="false"><i style="--c:${c.color}"></i>${esc(c.nombre)}</button>`).join("\n")}
<label class="solo-lectores" for="filtro-evidencia">Filtrar por evidencia</label>
<select id="filtro-evidencia" data-filtro-ev><option value="">Cualquier evidencia</option>${Object.entries(D.evidencias).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
</div>
<p class="contador" data-contador aria-live="polite">${D.marcos.length} marcos</p>
<div class="rejilla">
${D.marcos.map((m) => tarjetaMarco(D, m)).join("\n")}
</div>
<p class="vacio" data-vacio hidden>Ningún marco cumple estos filtros. Quita alguno para ver más resultados.</p>
</section>
<section>
<h2 id="elementos-comunes">Elementos comunes a casi todos los marcos</h2>
<p class="tenue">Los acrónimos recombinan estos elementos; dominarlos importa más que memorizar siglas.</p>
<div class="tabla-envoltura"><table>
<thead><tr><th scope="col">Elemento</th><th scope="col">Función</th><th scope="col">Aparece como</th></tr></thead>
<tbody>${D.elementosComunes.map((e) => `<tr><td class="celda-titulo"><span aria-hidden="true">${e.icono}</span> ${esc(e.elemento)}</td><td>${esc(e.funcion)}</td><td>${esc(e.apareceComo)}</td></tr>`).join("")}</tbody>
</table></div>
</section>`;
  return {
    ruta,
    titulo: "Marcos de trabajo para la elaboración de prompts",
    descripcion: `Catálogo de ${D.marcos.length} marcos para elaborar prompts (RTF, CO-STAR, CRISPE, GROW y más), con pasos, ejemplos educativos y un constructor.`,
    seccion: "marcos",
    lateral: lateralMarcos(ctx, ruta),
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Marcos", ruta }],
    jsonld: [{
      "@type": "CollectionPage",
      name: "Marcos de trabajo para la elaboración de prompts",
      url: ctx.sitio.url + ruta,
      isPartOf: { "@id": `${ctx.sitio.url}/#sitio` },
      hasPart: D.marcos.map((m) => ({ "@id": `${ctx.sitio.url}${rutaMarco(m)}#recurso` })),
    }],
    contenido,
  };
}

/* ---------- Ficha de un marco ---------- */
export function fichaMarco(ctx, m, i) {
  const D = ctx.marcos;
  const cat = D.categorias[m.categoria];
  const ruta = rutaMarco(m);
  const anterior = D.marcos[i - 1], siguiente = D.marcos[i + 1];
  const P = D.paleta;
  const chip = (j) => `<span class="pieza" style="background:${P[j % 6]};color:${tintaSobre(j)}">${esc(m.pasos[j].letra)}</span>`;
  const ejemploHTML = (ej) => `<div class="ejemplo"><p class="ejemplo__fuente">${esc(ej.fuente)}</p>${ej.segmentos
    .map(([k, t]) => `<mark style="--c:${P[k % 6]}" title="${esc(m.pasos[k].espanol)}">${esc(t)}</mark>`)
    .join(" ")}</div>`;
  const pestanas = [["resumen", "Resumen"], ["pasos", "Pasos"], ["ejemplos", "Ejemplos"], ["constructor", "Constructor de prompt"]];
  const datos = {
    tipo: "marco",
    id: m.id,
    pasos: m.pasos.map((p) => ({ letra: p.letra, espanol: p.espanol })),
    ejemplo: m.ejemplo,
    ejemploEducativo: m.ejemploEducativo || null,
  };

  const contenido = `<article class="ficha" data-modulo="ficha-marco">
<header class="ficha__cabecera">
<h1><span aria-hidden="true">${m.icono}</span> ${esc(m.sigla)}${m.variante ? ` <small>${esc(m.variante)}</small>` : ""}</h1>
<p class="ficha__ingles" lang="en">${esc(m.nombreIngles)}</p>
<p class="ficha__espanol">${esc(m.nombreEspanol)}</p>
<ul class="insignias" aria-label="Clasificación">
<li class="insignia insignia--categoria" style="--c:${cat.color}"><span aria-hidden="true">${cat.icono}</span> ${esc(cat.nombre)}</li>
<li class="insignia ev-${m.evidencia}">Evidencia: ${esc(textoEvidencia(D, m))}</li>
<li class="insignia">Complejidad: ${esc(m.complejidad)}</li>
<li class="insignia">Nivel: ${esc(m.nivel)}</li>
</ul>
</header>
<figure class="figura-marco">${figuraMarco(m, cat, P)}<figcaption>Toca un bloque del diagrama para ver la descripción de ese paso.</figcaption></figure>
<p class="ficha__descripcion">${esc(m.descripcion)}</p>
<div class="pestanas" data-pestanas="marco">
<div class="pestanas__lista" role="tablist" aria-label="Contenido de la ficha">
${pestanas.map(([k, t], j) => `<button type="button" role="tab" id="pestana-${k}" aria-controls="panel-${k}" aria-selected="${j === 0}" data-pestana="${k}">${t}</button>`).join("")}
</div>
<section class="panel" id="panel-resumen" role="tabpanel" aria-labelledby="pestana-resumen">
<h2 class="panel__titulo">Resumen</h2>
<div class="tabla-envoltura"><table class="tabla-resumen"><tbody>
<tr><th scope="row">Nombre</th><td><strong>${esc(etiquetaMarco(m))}</strong><br><span lang="en">${esc(m.nombreIngles)}</span><br><span class="tenue">${esc(m.nombreEspanol)}</span></td></tr>
<tr><th scope="row">Descripción</th><td>${esc(m.descripcion)}</td></tr>
<tr><th scope="row">Origen y evidencia</th><td>${esc(m.origen)}<br><span class="insignia ev-${m.evidencia}">${esc(textoEvidencia(D, m))}</span></td></tr>
<tr><th scope="row">Componentes</th><td><ol class="lista-componentes">${m.pasos.map((p, j) => `<li>${chip(j)}<strong>${esc(p.espanol)}</strong> <span class="tenue">(<span lang="en">${esc(p.ingles)}</span>)</span>: ${esc(p.descripcion)}</li>`).join("")}</ol></td></tr>
<tr><th scope="row">Flujo</th><td>${m.pasos.map((p) => esc(p.espanol)).join(" → ")}</td></tr>
<tr><th scope="row">Casos de uso</th><td><ul>${m.usos.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></td></tr>
<tr><th scope="row">Buenas prácticas</th><td><ul>${m.buenasPracticas.map((u) => `<li>${esc(u)}</li>`).join("")}</ul></td></tr>
<tr><th scope="row">Ejemplo</th><td>${esc(m.ejemplo.segmentos.map((s) => s[1]).join(" "))}</td></tr>
</tbody></table></div>
</section>
<section class="panel" id="panel-pasos" role="tabpanel" aria-labelledby="pestana-pasos">
<h2 class="panel__titulo">Pasos</h2>
<div class="pasos">${m.pasos.map((p, j) => `<button type="button" class="paso" data-paso="${j}" aria-pressed="${j === 0}">
<span class="paso__letra" style="background:${P[j % 6]};color:${tintaSobre(j)}">${esc(p.letra)}</span>
<span><span class="paso__titulo">${j + 1}. <span aria-hidden="true">${p.icono}</span> ${esc(p.espanol)} <span class="paso__ingles" lang="en">${esc(p.ingles)}</span></span><span class="paso__texto">${esc(p.descripcion)}</span></span>
</button>`).join("")}</div>
<div class="fila fila--js"><button class="boton" type="button" data-accion="paso-anterior">Paso anterior</button><button class="boton boton--principal" type="button" data-accion="paso-siguiente">Paso siguiente</button></div>
</section>
<section class="panel" id="panel-ejemplos" role="tabpanel" aria-labelledby="pestana-ejemplos">
<h2 class="panel__titulo">Ejemplos</h2>
<div class="leyenda">${m.pasos.map((p, j) => `<span><i style="--c:${P[j % 6]}"></i>${esc(p.letra)}: ${esc(p.espanol)}</span>`).join("")}</div>
${ejemploHTML(m.ejemplo)}
${m.ejemploEducativo ? ejemploHTML(m.ejemploEducativo) : ""}
<div class="fila fila--js"><button class="boton" type="button" data-accion="llevar-ejemplo">Llevar el ejemplo al constructor</button></div>
</section>
<section class="panel" id="panel-constructor" role="tabpanel" aria-labelledby="pestana-constructor">
<h2 class="panel__titulo">Constructor de prompt</h2>
<p class="tenue">Escribe cada componente; el prompt se arma abajo en el orden del marco. Lo que escribas se guarda en tu navegador.</p>
<div class="constructor">${m.pasos.map((p, j) => `<div class="campo"><label for="campo-${j}">${chip(j)}${esc(p.espanol)}</label><textarea id="campo-${j}" data-campo="${j}" placeholder="${esc(p.descripcion)}"></textarea></div>`).join("")}</div>
<div class="fila"><label class="casilla"><input type="checkbox" data-opcion="etiquetas" checked> Incluir el nombre de cada componente</label></div>
<div class="salida tenue" data-salida aria-live="polite">Tu prompt aparecerá aquí.</div>
<div class="fila"><button class="boton boton--principal" type="button" data-accion="copiar-prompt">Copiar prompt</button><button class="boton" type="button" data-accion="cargar-ejemplo">Cargar ejemplo</button><button class="boton" type="button" data-accion="borrar-campos">Borrar campos</button></div>
</section>
</div>
<nav class="anterior-siguiente" aria-label="Otros marcos">
${anterior ? `<a href="${rutaMarco(anterior)}" rel="prev"><small>Anterior</small>${anterior.icono} ${esc(etiquetaMarco(anterior))}</a>` : "<span></span>"}
${siguiente ? `<a href="${rutaMarco(siguiente)}" rel="next" class="anterior-siguiente__siguiente"><small>Siguiente</small>${siguiente.icono} ${esc(etiquetaMarco(siguiente))}</a>` : ""}
</nav>
${bloqueCita(ctx, `${etiquetaMarco(m)}: ${m.nombreEspanol}`, ruta)}
<script type="application/json" id="datos-ficha">${jsonIncrustado(datos)}</script>
</article>`;

  const titulo = `${etiquetaMarco(m)}: ${m.nombreEspanol}`;
  return {
    ruta,
    titulo,
    tituloDocumento: `${etiquetaMarco(m)}: marco para elaborar prompts, con ejemplos · Promptario`,
    descripcion: recortar(`${m.sigla} (${m.nombreEspanol}). ${m.descripcion}`),
    seccion: "marcos",
    tipoOG: "article",
    lateral: lateralMarcos(ctx, ruta),
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Marcos", ruta: "/marcos/" }, { nombre: etiquetaMarco(m), ruta }],
    jsonld: [recursoAprendizaje(ctx, ruta, titulo, m.descripcion, {
      learningResourceType: "Marco de trabajo para elaborar prompts",
      educationalLevel: m.nivel,
      keywords: [m.sigla, m.nombreIngles, m.nombreEspanol, cat.nombre, "prompt", "inteligencia artificial", "docentes"].join(", "),
      teaches: m.pasos.map((p) => p.espanol).join(", "),
    })],
    contenido,
  };
}

/* ---------- Tabla comparativa ---------- */
export function comparativa(ctx) {
  const D = ctx.marcos;
  const ruta = "/marcos/comparativa/";
  const contenido = `<header class="encabezado-pagina"><h1>Tabla comparativa</h1>
<p class="entradilla">Todos los marcos en una vista, con sus componentes, complejidad, nivel y tipo de evidencia.</p></header>
<div data-tabla-filtrable>
<div class="filtros">
<label class="solo-lectores" for="tc-cat">Filtrar por categoría</label>
<select id="tc-cat" data-filtro-tabla="cat"><option value="">Todas las categorías</option>${Object.entries(D.categorias).map(([k, c]) => `<option value="${k}">${esc(c.nombre)}</option>`).join("")}</select>
<label class="solo-lectores" for="tc-ev">Filtrar por evidencia</label>
<select id="tc-ev" data-filtro-tabla="ev"><option value="">Cualquier evidencia</option>${Object.entries(D.evidencias).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join("")}</select>
</div>
<div class="tabla-envoltura"><table class="tabla-comparativa">
<thead><tr><th scope="col">Marco</th><th scope="col">Componentes</th><th scope="col">Complejidad</th><th scope="col">Nivel</th><th scope="col">Evidencia</th></tr></thead>
<tbody>${D.marcos.map((m) => `<tr data-cat="${m.categoria}" data-ev="${m.evidencia}">
<td class="celda-titulo"><span class="punto" style="--c:${D.categorias[m.categoria].color}"></span><a href="${rutaMarco(m)}">${m.icono} ${esc(etiquetaMarco(m))}</a></td>
<td>${m.pasos.map((p) => esc(p.espanol)).join(" → ")}</td><td>${esc(m.complejidad)}</td><td>${esc(m.nivel)}</td>
<td><span class="insignia ev-${m.evidencia}">${esc(textoEvidencia(D, m))}</span></td></tr>`).join("\n")}</tbody>
</table></div>
<p class="vacio" data-vacio hidden>Ningún marco cumple estos filtros.</p>
</div>`;
  return {
    ruta,
    titulo: "Tabla comparativa de marcos para elaborar prompts",
    descripcion: `Compara ${D.marcos.length} marcos para elaborar prompts por componentes, complejidad, nivel y evidencia.`,
    seccion: "marcos",
    lateral: lateralMarcos(ctx, ruta),
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Marcos", ruta: "/marcos/" }, { nombre: "Tabla comparativa", ruta }],
    contenido,
  };
}

/* ---------- Guía de selección ---------- */
export function guiaMarcos(ctx) {
  const D = ctx.marcos;
  const ruta = "/marcos/guia/";
  const porId = (id) => D.marcos.find((m) => m.id === id);
  const contenido = `<header class="encabezado-pagina"><h1>Guía de selección</h1>
<p class="entradilla">Elige lo que necesitas hacer y consulta los marcos más adecuados para esa tarea.</p></header>
<nav class="indice-chips" aria-label="Necesidades">${D.necesidades.map((n) => `<a class="chip" href="#${slug(n.necesidad)}">${esc(n.necesidad)}</a>`).join("")}</nav>
${D.necesidades.map((n) => `<section class="recomendacion" id="${slug(n.necesidad)}">
<h2>${esc(n.necesidad)}</h2><p class="tenue">${esc(n.razon)}</p>
<div class="rejilla">${n.marcos.map((id) => tarjetaMarco(D, porId(id))).join("")}</div>
</section>`).join("\n")}
<section><h2 id="secuencia-generica">Secuencia genérica recomendada</h2><p class="tenue">Válida para cualquier marco.</p>
<ol class="secuencia">${D.secuenciaGenerica.map((g) => `<li>${esc(g)}</li>`).join("")}</ol></section>`;
  return {
    ruta,
    titulo: "Guía para elegir un marco de prompts",
    descripcion: "Qué marco de prompts usar según la tarea: enseñar a principiantes, diseñar materiales, tutoría, investigación, planeación o comunicación.",
    seccion: "marcos",
    lateral: lateralMarcos(ctx, ruta),
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Marcos", ruta: "/marcos/" }, { nombre: "Guía de selección", ruta }],
    contenido,
  };
}

/* ---------- Buenas prácticas ---------- */
export function buenasPracticasMarcos(ctx, fragmento) {
  const ruta = "/marcos/buenas-practicas/";
  return {
    ruta,
    titulo: "Buenas prácticas para elaborar prompts",
    descripcion: "Diez reglas prácticas para docentes, recomendaciones de OpenAI, Anthropic y Google, técnicas con respaldo en la literatura y cuidados éticos.",
    seccion: "marcos",
    lateral: lateralMarcos(ctx, ruta),
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Marcos", ruta: "/marcos/" }, { nombre: "Buenas prácticas", ruta }],
    contenido: `<header class="encabezado-pagina"><h1>Buenas prácticas</h1>
<p class="entradilla">Recomendaciones transversales basadas en las guías oficiales y en la literatura académica.</p></header>
<div class="prosa">${fragmento}</div>`,
  };
}
