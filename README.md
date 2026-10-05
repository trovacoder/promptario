# Promptario

> Promptario, del latín *promptarium*: donde se guarda lo que está listo para usarse.

Aplicación web educativa con 32 marcos de trabajo para elaborar prompts y 20 prompts para resolver problemas. Cada marco y cada prompt tiene su ficha con pasos, ejemplos educativos, fundamentos y un constructor interactivo. Está dirigida a docentes y estudiantes hispanohablantes.

- **Sitio:** https://promptario.work
- **Autor:** Dr. Alejandro De Fuentes Martínez ([ORCID 0000-0001-8176-7542](https://orcid.org/0000-0001-8176-7542)). Idea, dirección académica y curaduría de contenidos.
- **Colaboración con IA:** Claude (Anthropic), asistente para el diseño, la programación y el maquetado web.
- **Versión histórica:** https://prompting-frameworks.netlify.app/

---

## Cómo funciona

```
datos/ + contenido/  →  build.mjs (generador)  →  dist/ (sitio listo)  →  Netlify lo publica
```

El contenido vive separado del código. Cuando guardas un cambio en GitHub, Netlify ejecuta el generador, que primero **valida los datos**. Si encuentra un error, explica cuál es y dónde, y no publica nada: el sitio anterior sigue en línea. Si todo está bien, genera las 68 páginas y las publica en un minuto aproximadamente.

## Estructura

```
promptario/
├── datos/                       ← EL CONTENIDO (aquí trabajarás casi siempre)
│   ├── sitio.json               Nombre, lema, versión, autor, licencias, portada
│   ├── marcos.json              Los 32 marcos, categorías, guía y elementos comunes
│   ├── resolver-problemas.json  Los 20 prompts, familias, rutas y guía
│   └── versiones.json           Historial que se muestra en /novedades/
├── contenido/                   Textos largos en HTML: Acerca, Talleres, buenas prácticas, fundamentos
├── generador/                   Plantillas de las páginas (código)
├── publico/                     Archivos que se copian tal cual: estilos, JavaScript, tipografías, imágenes
├── scripts/servidor.mjs         Vista previa local (opcional)
├── build.mjs                    Generador principal
├── netlify.toml                 Instrucciones para Netlify
├── CITATION.cff                 Metadatos de cita para GitHub y Zenodo
├── LICENSE                      Licencia MIT (código)
└── LICENCIA-CONTENIDO.md        Licencia CC BY 4.0 (contenido)
```

## Editar el contenido

Puedes editar directamente en GitHub: abre el archivo, pulsa el lápiz (**Edit this file**), haz el cambio y pulsa **Commit changes**. Netlify publicará solo.

Los archivos `.json` son estrictos con la puntuación. Las causas más comunes de error son una coma de más o de menos al final de un elemento, una comilla sin cerrar y, para escribir comillas dentro de un texto, usar las españolas « » en lugar de las rectas. Si cometes un error, el registro de Netlify te dirá en qué archivo está.

### Corregir un texto de un marco

En `datos/marcos.json`, busca el marco por su `id` (por ejemplo, `"id": "costar"`) y edita el campo que necesites.

### Agregar un marco

Copia un marco existente dentro del arreglo `"marcos"` y ajústalo. Campos:

| Campo | Qué es |
|---|---|
| `id` | Dirección de la ficha: `/marcos/<id>/`. Solo minúsculas, números y guiones. No lo cambies después de publicar, porque rompería los enlaces. |
| `sigla`, `variante` | Por ejemplo, `"CARE"` y `"NN/g"`. La variante es opcional. |
| `nombreIngles`, `nombreEspanol` | Expansión de la sigla en cada idioma. |
| `categoria` | Una de: `basicos`, `problemas`, `planeacion`, `comunicacion`, `educativos`. |
| `evidencia` | Una de: `aca` (académica), `ins` (institucional), `div` (divulgativa), `ada` (adaptada). `evidenciaTexto` es opcional, para matizarla. |
| `icono`, `complejidad`, `nivel`, `origen`, `descripcion` | Textos de la ficha. |
| `pasos` | Lista de pasos: `letra`, `ingles`, `espanol`, `icono`, `descripcion`. |
| `usos`, `buenasPracticas` | Listas de textos. |
| `ejemplo`, `ejemploEducativo` | `fuente` y `segmentos`. Cada segmento es `[número de paso, "texto"]`, y los pasos se cuentan **desde 0**. `ejemploEducativo` es opcional. |

Para que aparezca en la guía de selección, agrega su `id` en `"necesidades"`.

### Agregar o corregir un prompt de resolución de problemas

En `datos/resolver-problemas.json`, cada prompt tiene:

- un `numero` único;
- un `id` para su dirección;
- la `familia`, que puede ser `diag`, `dec`, `rep`, `plan` o `ant`;
- la `plantilla`, con marcas `{clave}`;
- `variables`, donde cada marca se describe con `clave`, `etiqueta` y `marcador`;
- un `ejemplo` con un valor para cada clave y un `rol`;
- los textos de la ficha y la lista de prompts `relacionados`.

El generador comprueba que cada `{clave}` de la plantilla tenga su variable y su valor de ejemplo.

### Cambiar el lema, la portada o los datos generales

Todo está en `datos/sitio.json`. Para poner una palabra en cursiva en el lema, escríbela entre asteriscos: `*promptarium*`. Ahí también eliges los doce marcos del gavetero de la portada (`portada.gavetero`) y los accesos de «¿Qué necesitas hacer?».

### Cambiar Acerca, Talleres, buenas prácticas o fundamentos

Edita los archivos de `contenido/`. Son fragmentos HTML sencillos. Puedes usar marcas que se sustituyen solas, como `{{version}}`, `{{numMarcos}}` o `{{numPrompts}}`; el comentario al inicio de cada archivo lista las disponibles.

### Cambiar colores o tipografía

Las variables están al inicio de `publico/css/promptario.css`, con un juego para el tema claro y otro para el oscuro.

## Publicar una versión nueva

Usa versionado semántico:

- **1.0.1** para correcciones;
- **1.1.0** para contenido o funciones nuevas;
- **2.0.0** para cambios de estructura.

Pasos:

1. En `datos/sitio.json`, cambia `version` y `fechaVersion`.
2. En `datos/versiones.json`, agrega al principio una entrada con los cambios.
3. En `CITATION.cff`, cambia `version` y `date-released`. El generador te avisa si no coinciden.
4. Guarda los cambios (commit).
5. En GitHub, crea una **Release** con la etiqueta de la versión (por ejemplo, `v1.1.0`). Si conectaste Zenodo, archivará la versión y le asignará un DOI.
6. Copia el DOI en `datos/sitio.json`, en el campo `doi`, sin el prefijo `https://doi.org/`. La página «Cómo citar» lo mostrará automáticamente.

## Medición de visitas y de uso

- **Visitas y páginas vistas:** usa Cloudflare Web Analytics, que es gratuito y no usa cookies. En Cloudflare, agrega el sitio `promptario.work` y copia el fragmento de JavaScript. Luego, en Netlify, ve a **Project configuration → Build & deploy → Post processing → Snippet injection → Add snippet**, elige *Before `</body>`* y pégalo. Así el código vive en Netlify y ninguna actualización lo borra.
- **Búsquedas en Google:** registra el dominio en Google Search Console y envía `https://promptario.work/sitemap.xml`.
- **Uso de las herramientas:** el sitio emite estos eventos:
  - `copiar_prompt`
  - `cargar_ejemplo`
  - `llevar_ejemplo`
  - `copiar_plantilla`
  - `copiar_cita`
  - `buscar`
  - `demo_completar`

  Si instalas Umami o GoatCounter con la misma inyección de fragmentos, los recibirán automáticamente. No se registran datos personales.

## Vista previa local (opcional)

Requiere Node.js 20 o posterior. En la carpeta del proyecto:

```
npm run vista-previa
```

Luego abre http://localhost:8080.

## Licencias

- **Código:** MIT (`LICENSE`).
- **Contenido:** CC BY 4.0 (`LICENCIA-CONTENIDO.md`).
- **Tipografías:** Bricolage Grotesque y Source Serif 4, bajo SIL Open Font License 1.1 (`publico/fuentes/LICENCIA-FUENTES.txt`).

Cómo citar: consulta https://promptario.work/citar/ o el archivo `CITATION.cff`.
