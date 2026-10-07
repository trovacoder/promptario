// Páginas con formularios incrustados (Google Forms u otros), definidas en datos/formularios.json.
import { esc } from "./utilidades.mjs";

const RUTA_VALIDA = /^\/[A-Za-z0-9_\-/]+\/$/;

/** Revisa formularios.json y devuelve una lista de errores en español. */
export function validarFormularios(datos) {
  const errores = [];
  const rutas = new Set();
  (datos.formularios || []).forEach((f, i) => {
    const donde = `formularios.json, formulario ${i + 1} (${f.titulo || "sin título"})`;
    if (typeof f.ruta !== "string" || !RUTA_VALIDA.test(f.ruta))
      errores.push(`${donde}: «ruta» debe empezar y terminar con «/» y usar solo letras sin acentos, números, guiones o guiones bajos`);
    if (rutas.has(f.ruta)) errores.push(`${donde}: la ruta «${f.ruta}» está repetida`);
    rutas.add(f.ruta);
    for (const c of ["titulo", "descripcion", "formularioUrl"])
      if (typeof f[c] !== "string" || !f[c].trim()) errores.push(`${donde}: falta el campo «${c}»`);
    if (f.formularioUrl && !/^https:\/\//.test(f.formularioUrl)) errores.push(`${donde}: «formularioUrl» debe empezar con https://`);
    if (!Number.isInteger(f.altura) || f.altura < 300 || f.altura > 8000)
      errores.push(`${donde}: «altura» debe ser un número entero entre 300 y 8000 (píxeles)`);
  });
  return errores;
}

/** Genera la página de un formulario con la plantilla común del sitio. */
export function paginaFormulario(ctx, f) {
  const contenido = `<article class="formulario" style="--alto:${f.altura}px">
<header class="encabezado-pagina">
<h1>${esc(f.titulo)}</h1>
<p class="entradilla">${esc(f.descripcion)}</p>
${f.nota ? `<p class="formulario__nota">${f.nota}</p>` : ""}
</header>
<div class="formulario__marco">
<iframe src="${esc(f.formularioUrl)}" title="Formulario: ${esc(f.titulo)}" loading="eager">Cargando el formulario…</iframe>
</div>
<p class="formulario__ayuda">¿No se muestra el formulario? <a href="${esc(f.enlaceDirecto || f.formularioUrl.replace("?embedded=true", ""))}" target="_blank" rel="noopener">Ábrelo en una pestaña nueva</a>.</p>
${f.privacidad ? `<p class="formulario__privacidad">${esc(f.privacidad)}</p>` : ""}
</article>`;
  return {
    ruta: f.ruta,
    titulo: f.titulo,
    descripcion: f.descripcion,
    robots: f.indexar ? "index, follow" : "noindex, follow",
    seccion: "",
    migas: [{ nombre: "Inicio", ruta: "/" }, { nombre: f.titulo, ruta: f.ruta }],
    contenido,
  };
}
