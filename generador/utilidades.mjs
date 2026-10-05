// Utilidades compartidas por todas las plantillas del generador.

/** Escapa texto para insertarlo en HTML. */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Convierte un texto en un identificador de URL: sin acentos, minúsculas y guiones. */
export const slug = (t) =>
  String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Recorta un texto a un máximo de caracteres sin partir palabras (para meta descripciones). */
export const recortar = (t, max = 158) => {
  const s = String(t).replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const corte = s.slice(0, max - 1);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
};

/** Convierte *texto* en cursiva latina; se usa para el lema. */
export const conCursivas = (t) => esc(t).replace(/\*([^*]+)\*/g, '<i lang="la">$1</i>');

/** Quita las marcas de cursiva para usos en texto plano (metadatos). */
export const sinMarcas = (t) => String(t).replace(/\*/g, "");

/** Fecha ISO (2026-10-03) a «3 de octubre de 2026». */
export const fechaLarga = (iso) => {
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const [a, m, d] = iso.split("-").map(Number);
  return d ? `${d} de ${meses[m - 1]} de ${a}` : `${meses[m - 1]} de ${a}`;
};

/** Color de texto legible sobre un color de la paleta de pasos (amarillo y azul claro llevan texto oscuro). */
export const tintaSobre = (i) => (i % 6 === 1 || i % 6 === 4 ? "#17212b" : "#ffffff");

/** Divide un texto en líneas de un máximo aproximado de caracteres. */
export const partirLineas = (t, max) => {
  const lineas = [];
  let actual = "";
  for (const palabra of String(t).split(" ")) {
    if ((actual + " " + palabra).trim().length > max && actual) {
      lineas.push(actual);
      actual = palabra;
    } else actual = (actual + " " + palabra).trim();
  }
  if (actual) lineas.push(actual);
  return lineas;
};

/** Sustituye marcas {{clave}} en los fragmentos de contenido. */
export const sustituir = (html, valores) =>
  html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in valores ? String(valores[k]) : m));

/** JSON seguro para incrustar dentro de <script>. */
export const jsonIncrustado = (obj) => JSON.stringify(obj).replace(/</g, "\\u003c");
