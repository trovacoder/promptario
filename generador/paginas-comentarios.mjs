// Página de comentarios (/comentarios/) y su página de confirmación, con Netlify Forms.
// Netlify detecta el formulario en el HTML publicado gracias al atributo data-netlify="true"
// y guarda las respuestas en la sección «Forms» del proyecto.
import { esc } from "./utilidades.mjs";

export const RUTA_COMENTARIOS = "/comentarios/";
const RUTA_GRACIAS = "/comentarios/gracias/";

/** Enlace para comentar una página concreta; la página de comentarios recibe su dirección y su título. */
export const enlaceComentar = (ruta, titulo) =>
  `${RUTA_COMENTARIOS}?pagina=${encodeURIComponent(ruta)}&titulo=${encodeURIComponent(titulo)}`;

/** Invitación a comentar que aparece al final de cada ficha. */
export const invitacionComentar = (ruta, titulo, sustantivo = "esta ficha") => `<aside class="invitacion-comentar" aria-label="Comentarios">
<p>¿Tienes una sugerencia, una duda o encontraste un error en ${esc(sustantivo)}?</p>
<a class="boton" href="${esc(enlaceComentar(ruta, titulo))}">Comenta ${esc(sustantivo)}</a>
</aside>`;

/** Revisa la configuración de comentarios de sitio.json. */
export function validarComentarios(sitio) {
  const c = sitio.comentarios, errores = [];
  if (!c) return ["sitio.json: falta el bloque «comentarios»"];
  if (!/^[a-z0-9-]+$/.test(c.nombreFormulario || "")) errores.push("sitio.json, comentarios: «nombreFormulario» debe usar solo minúsculas, números y guiones");
  for (const campo of ["tipos", "perfiles"])
    if (!Array.isArray(c[campo]) || c[campo].length < 2 || c[campo].some((x) => typeof x !== "string" || !x.trim()))
      errores.push(`sitio.json, comentarios: «${campo}» debe ser una lista de al menos dos textos`);
  for (const campo of ["entradilla", "privacidad"])
    if (typeof c[campo] !== "string" || !c[campo].trim()) errores.push(`sitio.json, comentarios: falta el texto «${campo}»`);
  return errores;
}

/** Página con el formulario. Funciona sin JavaScript: el envío normal lleva a /comentarios/gracias/. */
export function paginaComentarios(ctx) {
  const c = ctx.sitio.comentarios;
  const opciones = (nombre, lista, requerido) =>
    lista
      .map((t, i) => `<label class="opcion"><input type="radio" name="${nombre}" value="${esc(t)}"${requerido && i === 0 ? " required" : ""}${i === 0 && requerido ? " checked" : ""}><span>${esc(t)}</span></label>`)
      .join("\n");

  const contenido = `<header class="encabezado-pagina">
<h1>Comentarios</h1>
<p class="entradilla">${esc(c.entradilla)}</p>
</header>
<section class="comentarios" data-modulo="comentarios">
<form class="formulario-comentarios" name="${esc(c.nombreFormulario)}" method="POST" action="${RUTA_GRACIAS}" data-netlify="true" netlify-honeypot="campo-trampa" data-formulario-comentarios>
<input type="hidden" name="form-name" value="${esc(c.nombreFormulario)}">
<input type="hidden" name="url" value="" data-url>
<p class="solo-lectores" aria-hidden="true"><label>No llenes este campo si eres una persona: <input name="campo-trampa" tabindex="-1" autocomplete="off"></label></p>

<div class="comentario-sobre" data-sobre hidden>
<p><span class="comentario-sobre__etiqueta">Comentas sobre</span> <a href="/" data-sobre-enlace></a></p>
<button class="boton boton--discreto" type="button" data-accion="comentario-general">Hacer un comentario general</button>
</div>
<div class="campo" data-campo-pagina>
<label for="comentario-pagina">Página o sección <span class="opcional">(opcional)</span></label>
<input id="comentario-pagina" name="pagina" maxlength="160" placeholder="p. ej., CO-STAR, Guía de selección o todo el sitio" data-pagina>
</div>

<fieldset class="grupo-opciones">
<legend>Tipo de comentario</legend>
<div class="opciones-chips">
${opciones("tipo", c.tipos, true)}
</div>
</fieldset>

<div class="campo">
<label for="comentario-texto">Tu comentario</label>
<textarea id="comentario-texto" name="comentario" required minlength="10" maxlength="3000" rows="7" aria-describedby="comentario-contador" placeholder="Cuéntanos qué te pareció útil, qué cambiarías o qué falta."></textarea>
<p class="campo__ayuda" id="comentario-contador" data-contador-texto>Máximo 3000 caracteres.</p>
</div>

<fieldset class="grupo-opciones">
<legend>Te identificas como <span class="opcional">(opcional)</span></legend>
<div class="opciones-chips">
${opciones("perfil", c.perfiles, false)}
</div>
</fieldset>

<div class="campos-dobles">
<div class="campo">
<label for="comentario-nombre">Nombre <span class="opcional">(opcional)</span></label>
<input id="comentario-nombre" name="nombre" maxlength="120" autocomplete="name">
</div>
<div class="campo">
<label for="comentario-correo">Correo <span class="opcional">(opcional, solo si quieres respuesta)</span></label>
<input id="comentario-correo" name="correo" type="email" maxlength="160" autocomplete="email">
</div>
</div>

<p class="formulario-comentarios__privacidad">${esc(c.privacidad)}</p>
<p class="error-envio" data-error role="alert" hidden></p>
<div class="fila"><button class="boton boton--principal" type="submit" data-enviar>Enviar comentario</button></div>
</form>

<div class="confirmacion" data-confirmacion tabindex="-1" hidden>
<h2>Gracias, recibimos tu comentario</h2>
<p>Lo leeremos con atención para mejorar las siguientes versiones de Promptario.</p>
<div class="fila"><button class="boton" type="button" data-accion="otro-comentario">Escribir otro comentario</button><a class="boton boton--principal" href="/" data-volver>Volver a Promptario</a></div>
</div>
</section>`;

  return {
    ruta: RUTA_COMENTARIOS,
    titulo: "Comentarios",
    descripcion: "Comparte tus puntos de vista, recomendaciones y oportunidades de mejora para Promptario.",
    seccion: "",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Comentarios", ruta: RUTA_COMENTARIOS }],
    clase: "pagina-comentarios",
    contenido,
  };
}

/** Confirmación para quien envía el formulario sin JavaScript. */
export function paginaGracias() {
  return {
    ruta: RUTA_GRACIAS,
    titulo: "Gracias por tu comentario",
    descripcion: "Confirmación de envío de un comentario a Promptario.",
    robots: "noindex, follow",
    seccion: "",
    clase: "pagina-comentarios",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: "Comentarios", ruta: RUTA_COMENTARIOS }, { nombre: "Gracias", ruta: RUTA_GRACIAS }],
    contenido: `<header class="encabezado-pagina"><h1>Gracias, recibimos tu comentario</h1>
<p class="entradilla">Lo leeremos con atención para mejorar las siguientes versiones de Promptario.</p></header>
<div class="fila"><a class="boton boton--principal" href="/">Volver a Promptario</a><a class="boton" href="${RUTA_COMENTARIOS}">Escribir otro comentario</a></div>`,
  };
}
