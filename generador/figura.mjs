// Diagrama de pasos de cada marco (imagen representativa), generado como SVG en el servidor.
// Se generan dos versiones: horizontal (pantallas anchas) y vertical (teléfonos).
import { esc, partirLineas, tintaSobre } from "./utilidades.mjs";

const FUENTE = 'font-family="Bricolage Grotesque, system-ui, sans-serif"';
const etiquetaMarco = (m) => m.sigla + (m.variante ? ` (${m.variante})` : "");

function horizontal(m, cat, paleta) {
  const n = m.pasos.length;
  const W = 900, pad = 26, gap = 36;
  const tw = Math.min(132, (W - 2 * pad - (n - 1) * gap) / n);
  const total = n * tw + (n - 1) * gap, x0 = (W - total) / 2, ty = 118, th = 118;
  const maxc = Math.max(8, Math.floor(tw / 8.2));
  const lineasMax = Math.max(...m.pasos.map((p) => partirLineas(p.espanol, maxc).length));
  const H = ty + th + 34 + lineasMax * 19 + 22 + 26;
  let s = `<svg class="figura figura--horizontal" viewBox="0 0 ${W} ${H}" role="group" aria-label="Diagrama de pasos de ${esc(etiquetaMarco(m))}: ${esc(m.pasos.map((p) => p.espanol).join(", "))}">`;
  s += `<rect width="${W}" height="${H}" rx="20" fill="var(--superficie)" stroke="var(--borde)"/>`;
  s += `<path d="M0 20 Q0 0 20 0 H${W - 20} Q${W} 0 ${W} 20 V88 H0 Z" fill="${cat.color}"/>`;
  s += `<text x="30" y="50" fill="#fff" ${FUENTE} font-size="34" font-weight="800">${esc(m.sigla)}${m.variante ? `<tspan font-size="18" font-weight="600" dx="10" opacity=".9">${esc(m.variante)}</tspan>` : ""}</text>`;
  s += `<text x="30" y="74" fill="#fff" opacity=".92" ${FUENTE} font-size="15">${esc(m.nombreEspanol)}</text>`;
  s += `<text x="${W - 34}" y="60" text-anchor="end" font-size="40" aria-hidden="true">${m.icono}</text>`;
  m.pasos.forEach((p, i) => {
    const x = x0 + i * (tw + gap), c = paleta[i % 6], fg = tintaSobre(i);
    s += `<g class="ficha-paso" data-paso="${i}" tabindex="0" role="button" aria-label="Paso ${i + 1}: ${esc(p.espanol)}">`;
    s += `<rect class="ficha-paso__caja" x="${x}" y="${ty}" width="${tw}" height="${th}" rx="18" fill="${c}"/>`;
    s += `<text x="${x + tw / 2}" y="${ty + 34}" text-anchor="middle" font-size="22" aria-hidden="true">${p.icono}</text>`;
    s += `<text x="${x + tw / 2}" y="${ty + th - 22}" text-anchor="middle" fill="${fg}" ${FUENTE} font-weight="800" font-size="${p.letra.length > 1 ? 36 : 48}">${esc(p.letra)}</text>`;
    const L = partirLineas(p.espanol, maxc);
    L.forEach((ln, k) => {
      s += `<text x="${x + tw / 2}" y="${ty + th + 28 + k * 19}" text-anchor="middle" fill="var(--texto)" ${FUENTE} font-weight="600" font-size="15">${esc(ln)}</text>`;
    });
    s += `<text x="${x + tw / 2}" y="${ty + th + 28 + L.length * 19 + 2}" text-anchor="middle" fill="var(--tenue)" ${FUENTE} font-size="12" font-style="italic">${esc(p.ingles)}</text>`;
    s += `</g>`;
    if (i < n - 1) {
      const ax = x + tw + 7, bx = x + tw + gap - 7, ay = ty + th / 2;
      s += `<line x1="${ax}" y1="${ay}" x2="${bx - 8}" y2="${ay}" stroke="var(--tenue)" stroke-width="3" stroke-linecap="round"/><path d="M${bx - 10} ${ay - 7} L${bx} ${ay} L${bx - 10} ${ay + 7} Z" fill="var(--tenue)"/>`;
    }
  });
  s += `<text x="30" y="${H - 18}" fill="var(--tenue)" ${FUENTE} font-size="13">${esc(cat.nombre)}, ${n} pasos</text>`;
  return s + `</svg>`;
}

function vertical(m, cat, paleta) {
  const n = m.pasos.length;
  const W = 380, rh = 82, top = 112, H = top + n * rh + 20;
  let s = `<svg class="figura figura--vertical" viewBox="0 0 ${W} ${H}" role="group" aria-label="Diagrama de pasos de ${esc(etiquetaMarco(m))}">`;
  s += `<rect width="${W}" height="${H}" rx="18" fill="var(--superficie)" stroke="var(--borde)"/>`;
  s += `<path d="M0 18 Q0 0 18 0 H${W - 18} Q${W} 0 ${W} 18 V86 H0 Z" fill="${cat.color}"/>`;
  s += `<text x="20" y="44" fill="#fff" ${FUENTE} font-size="28" font-weight="800">${esc(m.sigla)}${m.variante ? `<tspan font-size="14" dx="8">${esc(m.variante)}</tspan>` : ""}</text>`;
  const sub = partirLineas(m.nombreEspanol, 40);
  s += `<text x="20" y="68" fill="#fff" ${FUENTE} font-size="12.5">${esc(sub[0] + (sub.length > 1 ? "…" : ""))}</text>`;
  s += `<text x="${W - 20}" y="54" text-anchor="end" font-size="32" aria-hidden="true">${m.icono}</text>`;
  m.pasos.forEach((p, i) => {
    const cy = top + i * rh + 28, c = paleta[i % 6];
    if (i < n - 1)
      s += `<line x1="44" y1="${cy + 30}" x2="44" y2="${cy + rh - 30}" stroke="var(--tenue)" stroke-width="3"/><path d="M38 ${cy + rh - 34} L44 ${cy + rh - 26} L50 ${cy + rh - 34} Z" fill="var(--tenue)"/>`;
    s += `<g class="ficha-paso" data-paso="${i}" tabindex="0" role="button" aria-label="Paso ${i + 1}: ${esc(p.espanol)}">`;
    s += `<rect class="ficha-paso__caja" x="16" y="${cy - 26}" width="56" height="56" rx="14" fill="${c}"/>`;
    s += `<text x="44" y="${cy + 11}" text-anchor="middle" fill="${tintaSobre(i)}" ${FUENTE} font-weight="800" font-size="${p.letra.length > 1 ? 22 : 30}">${esc(p.letra)}</text>`;
    s += `<text x="88" y="${cy - 2}" fill="var(--texto)" ${FUENTE} font-weight="600" font-size="16">${p.icono} ${esc(p.espanol)}</text>`;
    s += `<text x="88" y="${cy + 18}" fill="var(--tenue)" ${FUENTE} font-style="italic" font-size="12.5">${esc(p.ingles)}</text></g>`;
  });
  return s + `</svg>`;
}

export const figuraMarco = (m, cat, paleta) => horizontal(m, cat, paleta) + vertical(m, cat, paleta);
