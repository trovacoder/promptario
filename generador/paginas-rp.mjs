// Páginas de la sección «Resolver problemas»: inicio con catálogo, fichas, guía, rutas, buenas prácticas y fundamentos.
import { esc, slug, recortar, jsonIncrustado } from "./utilidades.mjs";
import { bloqueCita } from "./paginas-marcos.mjs";

export const rutaPrompt = (p) => `/resolver-problemas/${p.id}/`;
const colorFamilia = (k) => `var(--f-${k})`;

/** Plantilla con marcadores: vacíos se resaltan; llenos se subrayan. */
export const plantillaHTML = (p, valores = {}) =>
  esc(p.plantilla).replace(/\{(\w+)\}/g, (m, k) => {
    const v = p.variables.find((x) => x.clave === k);
    const val = String(valores[k] || "").trim();
    return val ? `<span class="relleno" data-clave="${k}">${esc(val)}</span>` : `<span class="marcador" data-clave="${k}">[${esc(v ? v.marcador : k)}]</span>`;
  });

export const tarjetaPrompt = (D, p) => `<a class="tarjeta tarjeta--rp" href="${rutaPrompt(p)}" data-cat="${p.familia}" style="--c:${colorFamilia(p.familia)}">
<span class="tarjeta__numero" aria-hidden="true">${p.numero}</span>
<span class="tarjeta__nombre"><span class="solo-lectores">${p.numero}. </span>${esc(p.titulo)}</span>
<span class="tarjeta__sub">${esc(p.obtienes)}</span>
<span class="tarjeta__familia">${esc(D.familias[p.familia].nombre)}</span>
</a>`;

export function lateralRP(ctx, rutaActual) {
  const D = ctx.rp;
  const enlace = (ruta, html, clase = "") =>
    `<a class="lateral__enlace ${clase}" href="${ruta}"${ruta === rutaActual ? ' aria-current="page"' : ""}>${html}</a>`;
  let h = `<div class="lateral__seccion"><p class="lateral__titulo">Resolver problemas</p>
${enlace("/resolver-problemas/", "Inicio y catálogo")}
${enlace("/resolver-problemas/guia/", "Guía de selección")}
${enlace("/resolver-problemas/rutas/", "Rutas de encadenamiento")}
${enlace("/resolver-problemas/buenas-practicas/", "Buenas prácticas")}
${enlace("/resolver-problemas/fundamentos/", "Fundamentos y fuentes")}</div>`;
  for (const [k, f] of Object.entries(D.familias)) {
    const lista = D.prompts.filter((p) => p.familia === k);
    h += `<div class="lateral__seccion"><p class="lateral__grupo"><i style="--c:${colorFamilia(k)}"></i>${esc(f.nombre)}</p>`;
    h += lista.map((p) => enlace(rutaPrompt(p), `<span class="lateral__numero" style="--c:${colorFamilia(k)}">${p.numero}</span><span class="lateral__texto">${esc(p.titulo)}</span>`, "lateral__enlace--elemento")).join("");
    h += `</div>`;
  }
  return h;
}

const migasBase = [{ nombre: "Inicio", ruta: "/" }, { nombre: "Resolver problemas", ruta: "/resolver-problemas/" }];

/* ---------- Inicio y catálogo ---------- */
export function inicioRP(ctx) {
  const D = ctx.rp;
  const ruta = "/resolver-problemas/";
  const p1 = D.prompts[0];
  const contenido = `<section class="portada-rp">
<div>
<h1><span class="portada-rp__cifra">${D.prompts.length}</span> prompts para resolver problemas</h1>
<p class="entradilla">Plantillas para pensar un problema con la IA: diagnosticarlo, decidir, replantearlo, planear y anticipar riesgos. Cada una trae un constructor, un ejemplo educativo y su fundamento.</p>
<div class="fila"><a class="boton boton--principal" href="#catalogo">Ver los ${D.prompts.length} prompts</a><a class="boton" href="/resolver-problemas/guia/">Ayúdame a elegir</a></div>
</div>
<div class="demostracion" data-demo style="--c:${colorFamilia(p1.familia)}">
<p class="demostracion__etiqueta">Así se lee cada prompt: lo resaltado es lo que tú completas.</p>
<p class="demostracion__texto" data-demo-texto><span class="demostracion__titulo">${esc(p1.titulo)}:</span> ${plantillaHTML(p1)}</p>
<div class="fila"><button class="boton boton--principal" type="button" data-accion="demo">Completar con un ejemplo</button><a class="boton" href="${rutaPrompt(p1)}">Abrir el prompt 1</a></div>
<script type="application/json" data-demo-datos>${jsonIncrustado({ titulo: p1.titulo, plantilla: p1.plantilla, variables: p1.variables, ejemplo: p1.ejemplo })}</script>
</div>
</section>
<section>
<h2 id="como-usar">Cómo usar estos prompts</h2>
<ol class="pasos-uso">
<li><strong>Elige</strong> un prompt por su familia, desde el catálogo o con la guía de selección.</li>
<li><strong>Completa</strong> las variables resaltadas en el constructor con datos concretos de tu caso.</li>
<li><strong>Copia y pega</strong> el prompt en tu asistente de IA; añade tu rol y el formato de salida si lo necesitas.</li>
<li><strong>Verifica e itera:</strong> contrasta la respuesta y encadena otro prompt si el problema lo pide.</li>
</ol>
</section>
<section>
<h2 id="familias">Cinco familias de problemas</h2>
<p class="tenue">Los ${D.prompts.length} prompts se agrupan según lo que te ayudan a hacer.</p>
<div class="familias">${Object.entries(D.familias).map(([k, f]) => {
    const nums = D.prompts.filter((p) => p.familia === k).map((p) => p.numero);
    return `<a class="familia" style="--c:${colorFamilia(k)}" href="/resolver-problemas/?familia=${k}#catalogo"><span class="familia__nombre">${esc(f.nombre)}</span><span class="familia__texto">${esc(f.descripcion)}</span><span class="familia__ids">Prompts ${nums.join(", ")}</span></a>`;
  }).join("")}</div>
</section>
<section class="catalogo" id="catalogo" data-catalogo data-parametro="familia">
<h2>Catálogo</h2>
<div class="filtros" role="group" aria-label="Filtrar por familia">
<button class="chip" type="button" data-filtro-cat="" aria-pressed="true">Todos</button>
${Object.entries(D.familias).map(([k, f]) => `<button class="chip" type="button" data-filtro-cat="${k}" aria-pressed="false"><i style="--c:${colorFamilia(k)}"></i>${esc(f.nombre)}</button>`).join("\n")}
</div>
<p class="contador" data-contador aria-live="polite">${D.prompts.length} prompts</p>
<div class="rejilla">${D.prompts.map((p) => tarjetaPrompt(D, p)).join("\n")}</div>
<h3 id="tabla-comparativa">Tabla comparativa</h3>
<div class="tabla-envoltura"><table>
<thead><tr><th scope="col">N.º</th><th scope="col">Prompt</th><th scope="col">Úsalo cuando</th><th scope="col">Obtienes</th></tr></thead>
<tbody>${D.prompts.map((p) => `<tr data-cat="${p.familia}"><td class="celda-numero" style="--c:${colorFamilia(p.familia)}">${p.numero}</td><td class="celda-titulo"><a href="${rutaPrompt(p)}">${esc(p.titulo)}</a></td><td>${esc(p.cuandoUsarlo)}</td><td>${esc(p.obtienes)}</td></tr>`).join("\n")}</tbody>
</table></div>
</section>`;
  return {
    ruta,
    titulo: `${D.prompts.length} prompts para resolver problemas`,
    descripcion: `${D.prompts.length} plantillas de prompts para diagnosticar causas, decidir, replantear, planear y anticipar riesgos, con constructor, ejemplos educativos y fundamentos.`,
    seccion: "rp",
    lateral: lateralRP(ctx, ruta),
    migas: migasBase,
    jsonld: [{
      "@type": "CollectionPage",
      name: `${D.prompts.length} prompts para resolver problemas`,
      url: ctx.sitio.url + ruta,
      isPartOf: { "@id": `${ctx.sitio.url}/#sitio` },
      hasPart: D.prompts.map((p) => ({ "@id": `${ctx.sitio.url}${rutaPrompt(p)}#recurso` })),
    }],
    contenido,
  };
}

/* ---------- Ficha de un prompt ---------- */
export function fichaPrompt(ctx, p, i) {
  const D = ctx.rp;
  const fam = D.familias[p.familia];
  const ruta = rutaPrompt(p);
  const anterior = D.prompts[i - 1], siguiente = D.prompts[i + 1];
  const porNumero = (n) => D.prompts.find((x) => x.numero === n);
  const pestanas = [["prompt", "Prompt"], ["constructor", "Constructor"], ["ejemplo", "Ejemplo educativo"], ["fundamento", "Fundamento y buenas prácticas"]];
  const datos = {
    tipo: "rp", numero: p.numero, id: p.id, titulo: p.titulo, plantilla: p.plantilla, variables: p.variables, ejemplo: p.ejemplo,
    formatos: D.formatos, calidad: D.instruccionDeCalidad,
  };
  const textoOriginal = p.textoOriginal
    ? esc(p.titulo + ": " + p.textoOriginal).replace(/\[([^\]]+)\]/g, '<span class="marcador">[$1]</span>')
    : "";

  const contenido = `<article class="ficha ficha--rp" data-modulo="ficha-rp" style="--c:${colorFamilia(p.familia)}">
<header class="ficha-rp__cabecera">
<p class="ficha-rp__numero" aria-hidden="true">${p.numero}</p>
<div>
<h1><span class="solo-lectores">Prompt ${p.numero}: </span>${esc(p.titulo)}</h1>
<ul class="insignias" aria-label="Clasificación">
<li class="insignia insignia--categoria" style="--c:${colorFamilia(p.familia)}">${esc(fam.nombre)}</li>
<li class="insignia">${p.variables.length} variables</li>
${p.notaEditorial ? `<li class="insignia insignia--revisada">Redacción revisada</li>` : ""}
</ul>
</div>
</header>
<p class="ficha-rp__obtienes">${esc(p.obtienes)}</p>
<p class="ficha-rp__cuando"><strong>Úsalo cuando:</strong> ${esc(p.cuandoUsarlo)}</p>
<div class="pestanas" data-pestanas="rp">
<div class="pestanas__lista" role="tablist" aria-label="Contenido de la ficha">
${pestanas.map(([k, t], j) => `<button type="button" role="tab" id="pestana-${k}" aria-controls="panel-${k}" aria-selected="${j === 0}" data-pestana="${k}">${t}</button>`).join("")}
</div>
<section class="panel" id="panel-prompt" role="tabpanel" aria-labelledby="pestana-prompt">
<h2 class="panel__titulo">Prompt</h2>
${p.notaEditorial ? `<div class="nota-editorial"><p class="nota-editorial__titulo">Nota editorial</p><p>${esc(p.notaEditorial)}</p></div>` : ""}
<div class="caja-prompt"><span class="caja-prompt__titulo">${esc(p.titulo)}:</span> ${plantillaHTML(p)}</div>
<div class="variables">${p.variables.map((v) => `<span><span class="marcador">[${esc(v.marcador)}]</span>${v.etiqueta.toLowerCase() !== v.marcador.toLowerCase() ? " " + esc(v.etiqueta) : ""}</span>`).join("")}</div>
${p.textoOriginal ? `<details class="texto-original" open><summary>Texto tal como aparece en el documento fuente</summary><p>${textoOriginal}</p></details>` : ""}
<div class="fila"><button class="boton boton--principal fila--js-boton" type="button" data-accion="ir-constructor">Completar en el constructor</button><button class="boton" type="button" data-accion="copiar-plantilla">Copiar la plantilla</button></div>
</section>
<section class="panel" id="panel-constructor" role="tabpanel" aria-labelledby="pestana-constructor">
<h2 class="panel__titulo">Constructor</h2>
<div class="constructor-rp"><div>
${p.variables.map((v) => `<div class="campo"><label for="var-${v.clave}">${esc(v.etiqueta)}</label><textarea id="var-${v.clave}" data-clave="${v.clave}" placeholder="${esc(v.marcador)}"></textarea></div>`).join("")}
<div class="opciones"><p class="opciones__titulo">Opcional: mejora el prompt</p>
<div class="campo"><label for="opcion-rol">Quién eres y en qué contexto</label><input id="opcion-rol" data-opcion="rol" placeholder="p. ej., docente de una licenciatura en línea"><p class="campo__ayuda">Se añade al inicio como contexto.</p></div>
<div class="campo"><label for="opcion-formato">Formato de la respuesta</label><select id="opcion-formato" data-opcion="formato">${D.formatos.map((f) => `<option value="${esc(f.texto)}">${esc(f.etiqueta)}</option>`).join("")}</select></div>
<label class="casilla"><input type="checkbox" data-opcion="calidad"> Pedir que pregunte lo que falte y distinga hechos de suposiciones</label>
</div></div>
<div class="salida-rp"><div class="salida-rp__texto" data-salida aria-live="polite">${plantillaHTML(p)}</div><p class="medidor" data-medidor>Variables completas: 0 de ${p.variables.length}. Lo resaltado aún falta.</p>
<div class="fila"><button class="boton boton--principal" type="button" data-accion="copiar-prompt">Copiar prompt</button><button class="boton" type="button" data-accion="cargar-ejemplo">Cargar ejemplo</button><button class="boton" type="button" data-accion="borrar-campos">Borrar campos</button></div></div>
</div>
</section>
<section class="panel" id="panel-ejemplo" role="tabpanel" aria-labelledby="pestana-ejemplo">
<h2 class="panel__titulo">Ejemplo educativo</h2>
<p class="tenue">Un caso de educación superior en línea. Lo subrayado es lo que se escribió en cada variable.</p>
<div class="ejemplo"><p class="ejemplo__fuente">Contexto sobre mí: soy ${esc(p.ejemplo.rol)}.</p><span class="caja-prompt__titulo">${esc(p.titulo)}:</span> ${plantillaHTML(p, p.ejemplo)}</div>
<div class="tabla-envoltura"><table><thead><tr><th scope="col">Variable</th><th scope="col">Valor de ejemplo</th></tr></thead>
<tbody>${p.variables.map((v) => `<tr><td class="celda-sin-corte"><span class="marcador">[${esc(v.marcador)}]</span></td><td>${esc(p.ejemplo[v.clave])}</td></tr>`).join("")}</tbody></table></div>
<div class="fila fila--js"><button class="boton boton--principal" type="button" data-accion="llevar-ejemplo">Adaptar este ejemplo en el constructor</button></div>
</section>
<section class="panel" id="panel-fundamento" role="tabpanel" aria-labelledby="pestana-fundamento">
<h2 class="panel__titulo">Fundamento y buenas prácticas</h2>
<div class="columnas">
<div class="recuadro"><h3>Fundamento</h3><p>${esc(p.fundamento)}</p></div>
<div class="recuadro"><h3>Buenas prácticas</h3><ul>${p.buenasPracticas.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
</div>
<h3>Combínalo con</h3>
<div class="relacionados">${p.relacionados.map((n) => { const q = porNumero(n); return `<a href="${rutaPrompt(q)}" style="--c:${colorFamilia(q.familia)}">${q.numero}. ${esc(q.titulo)}</a>`; }).join("")}</div>
</section>
</div>
<nav class="anterior-siguiente" aria-label="Otros prompts">
${anterior ? `<a href="${rutaPrompt(anterior)}" rel="prev"><small>Anterior</small>${anterior.numero}. ${esc(anterior.titulo)}</a>` : "<span></span>"}
${siguiente ? `<a href="${rutaPrompt(siguiente)}" rel="next" class="anterior-siguiente__siguiente"><small>Siguiente</small>${siguiente.numero}. ${esc(siguiente.titulo)}</a>` : ""}
</nav>
${bloqueCita(ctx, `${p.titulo} (prompt ${p.numero})`, ruta)}
<script type="application/json" id="datos-ficha">${jsonIncrustado(datos)}</script>
</article>`;

  return {
    ruta,
    titulo: `${p.titulo}: prompt para resolver problemas`,
    descripcion: recortar(`Prompt ${p.numero}, ${p.titulo}. Úsalo cuando: ${p.cuandoUsarlo} Obtienes: ${p.obtienes}`),
    seccion: "rp",
    tipoOG: "article",
    lateral: lateralRP(ctx, ruta),
    migas: [...migasBase, { nombre: `${p.numero}. ${p.titulo}`, ruta }],
    jsonld: [{
      "@type": "LearningResource",
      "@id": `${ctx.sitio.url}${ruta}#recurso`,
      name: p.titulo,
      description: p.obtienes,
      url: ctx.sitio.url + ruta,
      inLanguage: ctx.sitio.idioma,
      isPartOf: { "@id": `${ctx.sitio.url}/#sitio` },
      author: { "@id": `${ctx.sitio.url}/#autor` },
      license: ctx.sitio.licencias.contenido.url,
      isAccessibleForFree: true,
      learningResourceType: "Plantilla de prompt",
      keywords: [p.titulo, fam.nombre, "resolución de problemas", "prompt", "inteligencia artificial"].join(", "),
      audience: { "@type": "EducationalAudience", educationalRole: ["teacher", "student"] },
    }],
    contenido,
  };
}

/* ---------- Guía de selección ---------- */
export function guiaRP(ctx) {
  const D = ctx.rp;
  const ruta = "/resolver-problemas/guia/";
  const porNumero = (n) => D.prompts.find((x) => x.numero === n);
  const contenido = `<header class="encabezado-pagina"><h1>Guía de selección</h1>
<p class="entradilla">Elige lo que necesitas y consulta los prompts más adecuados.</p></header>
<nav class="indice-chips" aria-label="Necesidades">${D.necesidades.map((n) => `<a class="chip" href="#${slug(n.necesidad)}">${esc(n.necesidad)}</a>`).join("")}</nav>
${D.necesidades.map((n) => `<section class="recomendacion" id="${slug(n.necesidad)}"><h2>${esc(n.necesidad)}</h2><p class="tenue">${esc(n.razon)}</p>
<div class="rejilla">${n.prompts.map((x) => tarjetaPrompt(D, porNumero(x))).join("")}</div></section>`).join("\n")}
<section><h2 id="preguntas">Preguntas para orientarte</h2>
<div class="tabla-envoltura"><table><thead><tr><th scope="col">Si tu pregunta es…</th><th scope="col">Empieza por</th></tr></thead>
<tbody>${D.preguntas.map((q) => `<tr><td>${esc(q.pregunta)}</td><td>${q.prompts.map((n) => `<a href="${rutaPrompt(porNumero(n))}">${n}. ${esc(porNumero(n).titulo)}</a>`).join("<br>")}</td></tr>`).join("")}</tbody></table></div></section>`;
  return {
    ruta,
    titulo: "Guía para elegir un prompt de resolución de problemas",
    descripcion: "Qué prompt usar según tu problema: entender causas, aprender de un fracaso, elegir entre opciones, salir de un atasco o prever riesgos.",
    seccion: "rp",
    lateral: lateralRP(ctx, ruta),
    migas: [...migasBase, { nombre: "Guía de selección", ruta }],
    contenido,
  };
}

/* ---------- Rutas de encadenamiento ---------- */
export function rutasRP(ctx) {
  const D = ctx.rp;
  const ruta = "/resolver-problemas/rutas/";
  const porNumero = (n) => D.prompts.find((x) => x.numero === n);
  const contenido = `<header class="encabezado-pagina"><h1>Rutas de encadenamiento</h1>
<p class="entradilla">Un problema complejo rara vez se resuelve con un solo prompt. Estas secuencias usan la respuesta de cada paso como insumo del siguiente, dentro de la misma conversación.</p></header>
${D.rutas.map((r) => `<section class="ruta" id="${slug(r.titulo)}"><h2>${esc(r.titulo)}</h2><p>${esc(r.descripcion)}</p>
<ol class="cadena">${r.prompts.map((n, j) => { const q = porNumero(n); return `<li><a href="${rutaPrompt(q)}" style="--c:${colorFamilia(q.familia)}"><b>${j + 1}</b>${n}. ${esc(q.titulo)}</a></li>`; }).join("")}</ol></section>`).join("\n")}
<details><summary>Cómo encadenar sin perder el hilo</summary><ul>
<li>Trabaja la ruta en una sola conversación para que la IA conserve el contexto de los pasos anteriores.</li>
<li>Al pasar al siguiente prompt, indica qué parte de la respuesta anterior debe tomar como base (por ejemplo, «a partir de la causa raíz que identificaste…»).</li>
<li>Revisa y corrige cada respuesta antes de avanzar: un error temprano se arrastra en toda la cadena.</li>
<li>Cierra con una síntesis que reúna las decisiones tomadas en cada paso.</li></ul></details>`;
  return {
    ruta,
    titulo: "Rutas para encadenar prompts de resolución de problemas",
    descripcion: "Secuencias de prompts para resolver problemas complejos: de síntoma a solución, decisiones difíciles, atascos, fallos, cambio institucional y proyectos que abruman.",
    seccion: "rp",
    lateral: lateralRP(ctx, ruta),
    migas: [...migasBase, { nombre: "Rutas de encadenamiento", ruta }],
    contenido,
  };
}

export function buenasPracticasRP(ctx, fragmento) {
  const ruta = "/resolver-problemas/buenas-practicas/";
  return {
    ruta,
    titulo: "Buenas prácticas para resolver problemas con IA",
    descripcion: "Recomendaciones para usar prompts de resolución de problemas: datos concretos, contexto, formato, iteración, verificación y protección de datos personales.",
    seccion: "rp",
    lateral: lateralRP(ctx, ruta),
    migas: [...migasBase, { nombre: "Buenas prácticas", ruta }],
    contenido: `<header class="encabezado-pagina"><h1>Buenas prácticas</h1>
<p class="entradilla">Recomendaciones transversales para sacar más provecho de los ${ctx.rp.prompts.length} prompts, basadas en las guías de ingeniería de prompts y en el uso académico responsable de la IA.</p></header>
<div class="prosa">${fragmento}</div>`,
  };
}

export function fundamentosRP(ctx, fragmento) {
  const ruta = "/resolver-problemas/fundamentos/";
  return {
    ruta,
    titulo: "Fundamentos y fuentes de los prompts para resolver problemas",
    descripcion: "Origen de los 20 prompts, criterios de edición, tradiciones de las que procede cada uno y referencias en formato APA 7.",
    seccion: "rp",
    lateral: lateralRP(ctx, ruta),
    migas: [...migasBase, { nombre: "Fundamentos y fuentes", ruta }],
    contenido: `<header class="encabezado-pagina"><h1>Fundamentos y fuentes</h1>
<p class="entradilla">De dónde vienen estos prompts, qué se cambió en esta edición y en qué tradiciones se apoya cada uno.</p></header>
<div class="prosa">${fragmento}</div>`,
  };
}
