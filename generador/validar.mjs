// Revisa los archivos de datos antes de generar el sitio.
// Si encuentra un error, el proceso se detiene y Netlify conserva publicada la versión anterior.

const ID_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validar({ sitio, marcos, rp, versiones }) {
  const errores = [];
  const avisos = [];
  const err = (donde, msg) => errores.push(`${donde}: ${msg}`);
  const texto = (v) => typeof v === "string" && v.trim().length > 0;

  /* sitio.json */
  for (const campo of ["nombre", "titulo", "descripcion", "lema", "url", "version", "fechaVersion"])
    if (!texto(sitio[campo])) err("sitio.json", `falta el campo «${campo}»`);
  if (sitio.url && /\/$/.test(sitio.url)) err("sitio.json", "«url» no debe terminar en «/»");
  if (sitio.version && !/^\d+\.\d+\.\d+$/.test(sitio.version)) err("sitio.json", `la versión «${sitio.version}» debe tener el formato 1.0.0`);
  if (sitio.fechaVersion && !/^\d{4}-\d{2}-\d{2}$/.test(sitio.fechaVersion)) err("sitio.json", "«fechaVersion» debe tener el formato AAAA-MM-DD");
  if (!versiones.versiones.some((v) => v.version === sitio.version))
    err("versiones.json", `no hay una entrada para la versión ${sitio.version} indicada en sitio.json`);

  /* marcos.json */
  const ids = new Set();
  marcos.marcos.forEach((m, i) => {
    const donde = `marcos.json, marco ${i + 1} (${m.id || m.sigla || "sin id"})`;
    if (!texto(m.id) || !ID_VALIDO.test(m.id)) err(donde, "«id» debe usar solo minúsculas, números y guiones (p. ej., «co-star»)");
    if (ids.has(m.id)) err(donde, `el id «${m.id}» está repetido`);
    ids.add(m.id);
    for (const campo of ["sigla", "nombreIngles", "nombreEspanol", "icono", "complejidad", "nivel", "origen", "descripcion"])
      if (!texto(m[campo])) err(donde, `falta el campo «${campo}»`);
    if (!marcos.categorias[m.categoria]) err(donde, `la categoría «${m.categoria}» no existe en «categorias»`);
    if (!marcos.evidencias[m.evidencia]) err(donde, `la evidencia «${m.evidencia}» no existe; usa una de: ${Object.keys(marcos.evidencias).join(", ")}`);
    if (!Array.isArray(m.pasos) || m.pasos.length < 2) err(donde, "«pasos» debe tener al menos dos pasos");
    else m.pasos.forEach((p, j) => {
      for (const c of ["letra", "ingles", "espanol", "icono", "descripcion"])
        if (!texto(p[c])) err(`${donde}, paso ${j + 1}`, `falta el campo «${c}»`);
    });
    if (!Array.isArray(m.usos) || !m.usos.length) err(donde, "«usos» debe tener al menos un caso de uso");
    if (!Array.isArray(m.buenasPracticas) || !m.buenasPracticas.length) err(donde, "«buenasPracticas» debe tener al menos una práctica");
    for (const clave of ["ejemplo", "ejemploEducativo"]) {
      const ej = m[clave];
      if (!ej) { if (clave === "ejemplo") err(donde, "falta «ejemplo»"); continue; }
      if (!texto(ej.fuente)) err(`${donde}, ${clave}`, "falta «fuente»");
      if (!Array.isArray(ej.segmentos) || !ej.segmentos.length) err(`${donde}, ${clave}`, "«segmentos» está vacío");
      else ej.segmentos.forEach(([k, t], j) => {
        if (!Number.isInteger(k) || !m.pasos || k < 0 || k >= m.pasos.length)
          err(`${donde}, ${clave}, segmento ${j + 1}`, `el número de paso ${k} no existe (los pasos van de 0 a ${(m.pasos || []).length - 1})`);
        if (!texto(t)) err(`${donde}, ${clave}, segmento ${j + 1}`, "el texto está vacío");
      });
    }
  });
  marcos.necesidades.forEach((n, i) =>
    n.marcos.forEach((id) => { if (!ids.has(id)) err(`marcos.json, necesidad ${i + 1} («${n.necesidad}»)`, `el marco «${id}» no existe`); })
  );
  (sitio.portada?.gavetero || []).forEach((id) => { if (!ids.has(id)) err("sitio.json, portada.gavetero", `el marco «${id}» no existe`); });
  if (marcos.paleta?.length !== 6) err("marcos.json", "«paleta» debe tener exactamente seis colores");

  /* resolver-problemas.json */
  const numeros = new Set(), slugs = new Set();
  rp.prompts.forEach((p, i) => {
    const donde = `resolver-problemas.json, prompt ${i + 1} (${p.titulo || "sin título"})`;
    if (!Number.isInteger(p.numero)) err(donde, "«numero» debe ser un número entero");
    if (numeros.has(p.numero)) err(donde, `el número ${p.numero} está repetido`);
    numeros.add(p.numero);
    if (!texto(p.id) || !ID_VALIDO.test(p.id)) err(donde, "«id» debe usar solo minúsculas, números y guiones");
    if (slugs.has(p.id)) err(donde, `el id «${p.id}» está repetido`);
    slugs.add(p.id);
    for (const c of ["titulo", "plantilla", "obtienes", "cuandoUsarlo", "fundamento"]) if (!texto(p[c])) err(donde, `falta el campo «${c}»`);
    if (!rp.familias[p.familia]) err(donde, `la familia «${p.familia}» no existe`);
    const claves = new Set((p.variables || []).map((v) => v.clave));
    const enPlantilla = [...String(p.plantilla).matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
    enPlantilla.forEach((k) => { if (!claves.has(k)) err(donde, `la plantilla usa {${k}}, pero no hay una variable con esa clave`); });
    claves.forEach((k) => { if (!enPlantilla.includes(k)) avisos.push(`${donde}: la variable «${k}» no aparece en la plantilla`); });
    claves.forEach((k) => { if (!texto(p.ejemplo?.[k])) err(donde, `el ejemplo no tiene valor para la variable «${k}»`); });
    if (!texto(p.ejemplo?.rol)) err(donde, "el ejemplo necesita «rol»");
  });
  rp.prompts.forEach((p) => (p.relacionados || []).forEach((n) => { if (!numeros.has(n)) err(`resolver-problemas.json, prompt ${p.numero}`, `relacionado con el prompt ${n}, que no existe`); }));
  rp.rutas.forEach((r) => r.prompts.forEach((n) => { if (!numeros.has(n)) err(`resolver-problemas.json, ruta «${r.titulo}»`, `el prompt ${n} no existe`); }));
  rp.necesidades.forEach((r) => r.prompts.forEach((n) => { if (!numeros.has(n)) err(`resolver-problemas.json, necesidad «${r.necesidad}»`, `el prompt ${n} no existe`); }));
  rp.preguntas.forEach((r) => r.prompts.forEach((n) => { if (!numeros.has(n)) err(`resolver-problemas.json, pregunta «${r.pregunta}»`, `el prompt ${n} no existe`); }));

  return { errores, avisos };
}
