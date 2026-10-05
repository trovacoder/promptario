/* Promptario · comportamiento del sitio
   Idea, dirección académica y curaduría: Dr. Alejandro De Fuentes Martínez
   Diseño, programación y maquetado web: Claude (Anthropic), asistente de IA
   Las páginas funcionan sin JavaScript; este archivo añade el buscador, los filtros,
   las pestañas, los constructores de prompts y la medición de uso. */
(() => {
  "use strict";

  /* ---------- Direcciones de la versión histórica (#/fw/rtf → /marcos/rtf/) ---------- */
  if (location.pathname === "/" && location.hash.startsWith("#/")) {
    const h = location.hash.slice(2);
    const destino = h.startsWith("fw/") ? `/marcos/${h.slice(3)}/` : { comparar: "/marcos/comparativa/", guia: "/marcos/guia/", practicas: "/marcos/buenas-practicas/" }[h];
    if (destino) { location.replace(destino); return; }
  }

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const almacen = {
    get(k, d) { try { const v = localStorage.getItem("promptario:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("promptario:" + k, JSON.stringify(v)); } catch (e) { /* almacenamiento no disponible */ } },
  };

  /* ---------- Medición de uso ----------
     Envía eventos a Umami o GoatCounter si alguno está instalado (por inyección de código en Netlify).
     Sin ellos, solo emite el evento «promptario:evento» en el documento; no guarda datos personales. */
  function registrarEvento(nombre, datos = {}) {
    try {
      if (window.umami && typeof window.umami.track === "function") window.umami.track(nombre, datos);
      if (window.goatcounter && typeof window.goatcounter.count === "function")
        window.goatcounter.count({ path: `evento/${nombre}${datos.id != null ? "/" + datos.id : ""}`, title: nombre, event: true });
      document.dispatchEvent(new CustomEvent("promptario:evento", { detail: { nombre, ...datos } }));
    } catch (e) { /* la medición nunca debe interrumpir la página */ }
  }
  window.promptario = { registrarEvento };

  /* ---------- Avisos y copiado ---------- */
  function avisar(mensaje) {
    const a = $("#aviso");
    if (!a) return;
    a.textContent = mensaje;
    a.classList.add("visible");
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => a.classList.remove("visible"), 2000);
  }
  function copiar(texto, mensaje = "Copiado") {
    const respaldo = () => {
      const ta = document.createElement("textarea");
      ta.value = texto; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      avisar(ok ? mensaje : "Selecciona el texto y cópialo manualmente");
    };
    try { navigator.clipboard.writeText(texto).then(() => avisar(mensaje), respaldo); } catch (e) { respaldo(); }
  }

  /* ---------- Tema claro u oscuro ---------- */
  $("#boton-tema")?.addEventListener("click", () => {
    const actual = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const nuevo = actual === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nuevo;
    almacen.set("tema", nuevo);
  });

  /* ---------- Menú en pantallas pequeñas ---------- */
  const lateral = $("#lateral"), velo = $("#velo"), botonMenu = $("#boton-menu");
  function abrirMenu(abrir) {
    lateral.classList.toggle("abierto", abrir);
    velo.hidden = !abrir;
    botonMenu.setAttribute("aria-expanded", String(abrir));
    botonMenu.setAttribute("aria-label", abrir ? "Cerrar el menú" : "Abrir el menú");
    document.body.style.overflow = abrir ? "hidden" : "";
    if (abrir) {
      const actual = $('[aria-current="page"]', lateral);
      if (actual) actual.scrollIntoView({ block: "center" });
      $("a, input", lateral)?.focus({ preventScroll: true });
    }
  }
  botonMenu?.addEventListener("click", () => abrirMenu(!lateral.classList.contains("abierto")));
  $("#boton-buscar")?.addEventListener("click", () => { abrirMenu(true); $("#buscar-movil")?.focus(); });
  velo?.addEventListener("click", () => abrirMenu(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lateral?.classList.contains("abierto")) { abrirMenu(false); botonMenu.focus(); }
  });
  matchMedia("(min-width: 1001px)").addEventListener("change", (e) => { if (e.matches) abrirMenu(false); });

  /* ---------- Buscador ---------- */
  const normalizar = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const compactar = (t) => t.replace(/[^a-z0-9ñ]/g, ""); // «co-star» y «costar» coinciden
  let indice = [], promesaIndice = null;
  const cargarIndice = () =>
    (promesaIndice ||= fetch("/indice-busqueda.json")
      .then((r) => r.json())
      .then((d) => {
        indice = d.map((x) => {
          const _t = normalizar(x.t), _k = normalizar(`${x.t} ${x.d} ${x.k}`);
          return { ...x, _t, _k, _tc: compactar(_t), _kc: compactar(_k) };
        });
      })
      .catch(() => { indice = []; }));
  const buscar = (q) => {
    const terminos = normalizar(q).split(/\s+/).filter(Boolean);
    if (!terminos.length) return [];
    const t0 = compactar(terminos[0]);
    return indice
      .filter((x) => terminos.every((t) => x._k.includes(t) || (compactar(t) && x._kc.includes(compactar(t)))))
      .map((x) => ({ x, p: x._t.startsWith(terminos[0]) || x._tc.startsWith(t0) ? 0 : x._t.includes(terminos[0]) || x._tc.includes(t0) ? 1 : 2 }))
      .sort((a, b) => a.p - b.p)
      .slice(0, 8)
      .map((r) => r.x);
  };
  $$(".campo-busqueda").forEach((campo) => {
    const caja = document.getElementById(campo.getAttribute("aria-controls"));
    let activo = -1;
    const cerrar = () => { caja.hidden = true; campo.setAttribute("aria-expanded", "false"); };
    const pintar = async () => {
      await cargarIndice();
      const q = campo.value.trim();
      if (!q) { cerrar(); return; }
      const r = buscar(q);
      activo = -1;
      caja.innerHTML = r.length
        ? r.map((x) => `<a href="${x.u}"><strong>${esc(x.t)}</strong><span>${esc(x.d)}</span></a>`).join("")
        : `<p>Sin resultados para «${esc(q)}». Prueba con otra palabra, como rol, tutoría o decisión.</p>`;
      caja.hidden = false;
      campo.setAttribute("aria-expanded", "true");
    };
    campo.addEventListener("focus", cargarIndice, { once: true });
    campo.addEventListener("input", pintar);
    campo.addEventListener("keydown", (e) => {
      const enlaces = $$("a", caja);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!enlaces.length || caja.hidden) return;
        e.preventDefault();
        activo = (activo + (e.key === "ArrowDown" ? 1 : -1) + enlaces.length) % enlaces.length;
        enlaces.forEach((a, i) => a.classList.toggle("activo", i === activo));
        enlaces[activo].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        const destino = enlaces[activo] || enlaces[0];
        if (destino && !caja.hidden) { e.preventDefault(); registrarEvento("buscar", { termino: campo.value.trim().slice(0, 60) }); location.href = destino.href; }
      } else if (e.key === "Escape") cerrar();
    });
    caja.addEventListener("click", (e) => { if (e.target.closest("a")) registrarEvento("buscar", { termino: campo.value.trim().slice(0, 60) }); });
    document.addEventListener("click", (e) => { if (!campo.parentElement.contains(e.target)) cerrar(); });
  });

  /* ---------- Catálogos filtrables ---------- */
  $$("[data-catalogo]").forEach((cat) => {
    const chips = $$("[data-filtro-cat]", cat), selector = $("[data-filtro-ev]", cat);
    const tarjetas = $$(".rejilla > [data-cat]", cat), filas = $$("tbody tr[data-cat]", cat);
    const contador = $("[data-contador]", cat), vacio = $("[data-vacio]", cat);
    const sustantivo = contador ? contador.textContent.replace(/^\d+\s*/, "") : "";
    let fc = "", fe = "";
    const param = cat.dataset.parametro && new URLSearchParams(location.search).get(cat.dataset.parametro);
    if (param && chips.some((c) => c.dataset.filtroCat === param)) fc = param;
    const coincide = (el) => (!fc || el.dataset.cat === fc) && (!fe || el.dataset.ev === fe);
    const aplicar = () => {
      let n = 0;
      tarjetas.forEach((t) => { const ver = coincide(t); t.hidden = !ver; if (ver) n++; });
      filas.forEach((f) => { f.hidden = !coincide(f); });
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filtroCat === fc)));
      if (contador) contador.textContent = `${n} ${n === 1 ? sustantivo.replace(/s$/, "") : sustantivo}`;
      if (vacio) vacio.hidden = n > 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => { fc = c.dataset.filtroCat; aplicar(); }));
    selector?.addEventListener("change", () => { fe = selector.value; aplicar(); });
    aplicar();
  });

  /* ---------- Tablas filtrables ---------- */
  $$("[data-tabla-filtrable]").forEach((zona) => {
    const selectores = $$("[data-filtro-tabla]", zona), filas = $$("tbody tr", zona), vacio = $("[data-vacio]", zona);
    const aplicar = () => {
      let n = 0;
      filas.forEach((f) => {
        const ver = selectores.every((s) => !s.value || f.dataset[s.dataset.filtroTabla] === s.value);
        f.hidden = !ver;
        if (ver) n++;
      });
      if (vacio) vacio.hidden = n > 0;
    };
    selectores.forEach((s) => s.addEventListener("change", aplicar));
  });

  /* ---------- Pestañas accesibles ---------- */
  function prepararPestanas(raiz) {
    const botones = $$('[role="tab"]', raiz);
    const paneles = botones.map((b) => document.getElementById(b.getAttribute("aria-controls")));
    const clave = "pestana:" + raiz.dataset.pestanas;
    const activar = (k, foco = false, guardar = true) => {
      botones.forEach((b, i) => {
        const on = b.dataset.pestana === k;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        paneles[i].hidden = !on;
        if (on && foco) b.focus();
      });
      if (guardar) almacen.set(clave, k);
      raiz.dispatchEvent(new CustomEvent("pestana", { detail: k }));
    };
    botones.forEach((b, i) => {
      b.addEventListener("click", () => activar(b.dataset.pestana));
      b.addEventListener("keydown", (e) => {
        const n = botones.length;
        const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
        if (j !== undefined) { e.preventDefault(); activar(botones[j].dataset.pestana, true); }
      });
    });
    paneles.forEach((p) => { p.tabIndex = 0; });
    const guardada = almacen.get(clave, botones[0].dataset.pestana);
    activar(botones.some((b) => b.dataset.pestana === guardada) ? guardada : botones[0].dataset.pestana, false, false);
    return activar;
  }
  const llevarA = (el) => { const r = el.getBoundingClientRect(); if (r.top < 70 || r.top > innerHeight * 0.6) el.scrollIntoView({ behavior: reducido() ? "auto" : "smooth", block: "start" }); };

  /* ---------- Ficha de un marco ---------- */
  const fichaMarco = $('[data-modulo="ficha-marco"]');
  if (fichaMarco) {
    const D = JSON.parse($("#datos-ficha").textContent);
    const raizPestanas = $("[data-pestanas]", fichaMarco);
    const bloques = $$(".ficha-paso", fichaMarco), pasos = $$(".paso", fichaMarco);
    const anterior = $('[data-accion="paso-anterior"]', fichaMarco), siguiente = $('[data-accion="paso-siguiente"]', fichaMarco);
    let paso = 0, pestana = "";
    raizPestanas.addEventListener("pestana", (e) => { pestana = e.detail; marcar(); });
    const activar = prepararPestanas(raizPestanas);
    function marcar() {
      bloques.forEach((b) => b.classList.toggle("activo", +b.dataset.paso === paso && pestana === "pasos"));
      pasos.forEach((p) => p.setAttribute("aria-pressed", String(+p.dataset.paso === paso)));
      if (anterior) anterior.disabled = paso === 0;
      if (siguiente) siguiente.disabled = paso === D.pasos.length - 1;
    }
    bloques.forEach((b) => {
      const ir = () => { paso = +b.dataset.paso; activar("pasos"); marcar(); llevarA(raizPestanas); };
      b.addEventListener("click", ir);
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); } });
    });
    pasos.forEach((p) => p.addEventListener("click", () => { paso = +p.dataset.paso; marcar(); }));

    // Constructor
    const campos = $$("[data-campo]", fichaMarco), etiquetas = $('[data-opcion="etiquetas"]', fichaMarco), salida = $("[data-salida]", fichaMarco);
    const claveBorrador = "borrador:marco:" + D.id;
    const borrador = almacen.get(claveBorrador, { v: D.pasos.map(() => ""), etiquetas: true });
    const componer = () => {
      const partes = D.pasos.map((p, i) => [p, String(borrador.v[i] || "").trim()]).filter((x) => x[1]);
      return partes.map(([p, v]) => (borrador.etiquetas ? `${p.espanol}: ${v}` : v)).join(borrador.etiquetas ? "\n" : " ");
    };
    const actualizar = () => {
      const t = componer();
      salida.textContent = t || "Tu prompt aparecerá aquí.";
      salida.classList.toggle("tenue", !t);
      almacen.set(claveBorrador, borrador);
    };
    const volcar = () => {
      campos.forEach((c) => { c.value = borrador.v[+c.dataset.campo] || ""; });
      etiquetas.checked = borrador.etiquetas !== false;
      actualizar();
    };
    const limpiar = (t) => t.replace(/^#\s*[^#]+#\s*/, "").replace(/^(Tarea|Acción|Meta|Antes|Después|Puente|Tema|Objetivo|Plan|Contexto|Datos|Salida|Instrucción):\s*/i, "");
    const cargarEjemplo = () => {
      const ej = D.ejemploEducativo || D.ejemplo;
      borrador.v = D.pasos.map(() => "");
      ej.segmentos.forEach(([k, t]) => { t = limpiar(t); borrador.v[k] = (borrador.v[k] ? borrador.v[k] + " " : "") + t; });
      volcar();
    };
    campos.forEach((c) => c.addEventListener("input", () => { borrador.v[+c.dataset.campo] = c.value; actualizar(); }));
    etiquetas.addEventListener("change", () => { borrador.etiquetas = etiquetas.checked; actualizar(); });
    fichaMarco.addEventListener("click", (e) => {
      const b = e.target.closest("[data-accion]");
      if (!b) return;
      const ev = { tipo: "marco", id: D.id };
      switch (b.dataset.accion) {
        case "paso-anterior": if (paso > 0) { paso--; marcar(); } break;
        case "paso-siguiente": if (paso < D.pasos.length - 1) { paso++; marcar(); } break;
        case "copiar-prompt": {
          const t = componer();
          if (!t) { avisar("Escribe al menos un componente para copiar"); break; }
          copiar(t, "Prompt copiado"); registrarEvento("copiar_prompt", ev); break;
        }
        case "cargar-ejemplo": cargarEjemplo(); avisar("Ejemplo cargado"); registrarEvento("cargar_ejemplo", ev); break;
        case "borrar-campos": borrador.v = D.pasos.map(() => ""); volcar(); break;
        case "llevar-ejemplo": cargarEjemplo(); activar("constructor"); llevarA(raizPestanas); registrarEvento("llevar_ejemplo", ev); break;
      }
    });
    volcar();
    marcar();
  }

  /* ---------- Ficha de un prompt para resolver problemas ---------- */
  const fichaRP = $('[data-modulo="ficha-rp"]');
  if (fichaRP) {
    const D = JSON.parse($("#datos-ficha").textContent);
    const raizPestanas = $("[data-pestanas]", fichaRP);
    const activar = prepararPestanas(raizPestanas);
    const campos = $$("textarea[data-clave]", fichaRP);
    const rol = $('[data-opcion="rol"]', fichaRP), formato = $('[data-opcion="formato"]', fichaRP), calidad = $('[data-opcion="calidad"]', fichaRP);
    const salida = $("[data-salida]", fichaRP), medidor = $("[data-medidor]", fichaRP);
    const clave = "borrador:rp:" + D.numero;
    const b = almacen.get(clave, { v: {}, rol: "", formato: "", calidad: false });
    const variable = (k) => D.variables.find((x) => x.clave === k);
    const plantillaTexto = (val) => D.plantilla.replace(/\{(\w+)\}/g, (m, k) => String(val[k] || "").trim() || `[${variable(k)?.marcador || k}]`);
    const plantillaHTML = (val) => esc(D.plantilla).replace(/\{(\w+)\}/g, (m, k) => {
      const v = String(val[k] || "").trim();
      return v ? `<span class="relleno">${esc(v)}</span>` : `<span class="marcador">[${esc(variable(k)?.marcador || k)}]</span>`;
    });
    const extra = () => [b.formato, b.calidad ? D.calidad : ""].filter(Boolean).join(" ");
    const rolTexto = () => (b.rol || "").trim().replace(/\.$/, "");
    const componer = () => [rolTexto() && `Contexto sobre mí: soy ${rolTexto()}.`, plantillaTexto(b.v), extra()].filter(Boolean).join("\n\n");
    const faltan = () => D.variables.filter((v) => !String(b.v[v.clave] || "").trim()).length;
    const actualizar = () => {
      let h = rolTexto() ? `<span class="relleno">Contexto sobre mí: soy ${esc(rolTexto())}.</span>\n\n` : "";
      h += plantillaHTML(b.v);
      if (extra()) h += `\n\n<span class="relleno">${esc(extra())}</span>`;
      salida.innerHTML = h;
      const f = faltan();
      medidor.textContent = f === 0 ? "Todas las variables están completas." : `Variables completas: ${D.variables.length - f} de ${D.variables.length}. Lo resaltado aún falta.`;
      almacen.set(clave, b);
    };
    const volcar = () => {
      campos.forEach((c) => { c.value = b.v[c.dataset.clave] || ""; });
      rol.value = b.rol || ""; formato.value = b.formato || ""; calidad.checked = Boolean(b.calidad);
      actualizar();
    };
    const cargarEjemplo = () => { D.variables.forEach((v) => { b.v[v.clave] = D.ejemplo[v.clave] || ""; }); b.rol = D.ejemplo.rol || ""; volcar(); };
    campos.forEach((c) => c.addEventListener("input", () => { b.v[c.dataset.clave] = c.value; actualizar(); }));
    rol.addEventListener("input", () => { b.rol = rol.value; actualizar(); });
    formato.addEventListener("change", () => { b.formato = formato.value; actualizar(); });
    calidad.addEventListener("change", () => { b.calidad = calidad.checked; actualizar(); });
    fichaRP.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-accion]");
      if (!boton) return;
      const ev = { tipo: "rp", id: D.numero };
      switch (boton.dataset.accion) {
        case "ir-constructor": activar("constructor"); llevarA(raizPestanas); break;
        case "copiar-plantilla": copiar(`${D.titulo}: ${plantillaTexto({})}`, "Plantilla copiada"); registrarEvento("copiar_plantilla", ev); break;
        case "copiar-prompt": {
          const f = faltan();
          copiar(componer(), f ? `Prompt copiado; faltan ${f} variable(s) por completar` : "Prompt copiado");
          registrarEvento("copiar_prompt", ev); break;
        }
        case "cargar-ejemplo": cargarEjemplo(); avisar("Ejemplo cargado"); registrarEvento("cargar_ejemplo", ev); break;
        case "borrar-campos": b.v = {}; b.rol = ""; b.formato = ""; b.calidad = false; volcar(); break;
        case "llevar-ejemplo": cargarEjemplo(); activar("constructor"); llevarA(raizPestanas); registrarEvento("llevar_ejemplo", ev); break;
      }
    });
    volcar();
  }

  /* ---------- Demostración en el inicio de Resolver problemas ---------- */
  const demo = $("[data-demo]");
  if (demo) {
    const D = JSON.parse($("[data-demo-datos]", demo).textContent);
    const texto = $("[data-demo-texto]", demo), boton = $('[data-accion="demo"]', demo);
    const original = texto.innerHTML;
    boton.addEventListener("click", () => {
      const marcas = $$(".marcador", texto);
      if (!marcas.length) { texto.innerHTML = original; boton.textContent = "Completar con un ejemplo"; return; }
      boton.disabled = true;
      const paso = (i) => {
        if (i >= marcas.length) { boton.disabled = false; boton.textContent = "Volver a la plantilla"; return; }
        const n = document.createElement("span");
        n.className = "relleno";
        n.textContent = D.ejemplo[marcas[i].dataset.clave];
        marcas[i].replaceWith(n);
        setTimeout(() => paso(i + 1), reducido() ? 0 : 520);
      };
      paso(0);
      registrarEvento("demo_completar");
    });
  }

  /* ---------- Acciones generales ---------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-accion]");
    if (!b) return;
    if (b.dataset.accion === "copiar-cita") {
      const el = document.getElementById(b.dataset.objetivo);
      if (el) { copiar(el.innerText.trim(), "Referencia copiada"); registrarEvento("copiar_cita", { pagina: location.pathname }); }
    } else if (b.dataset.accion === "pantalla-completa") {
      const r = document.documentElement.requestFullscreen?.();
      if (r && r.catch) r.catch(() => avisar("Usa la tecla F11 para ver en pantalla completa"));
    }
  });
})();
