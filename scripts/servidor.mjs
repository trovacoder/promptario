// Servidor local para revisar el sitio generado antes de publicarlo.
// Uso: npm run vista-previa   y abre http://localhost:8080
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8" };
const PUERTO = Number(process.env.PORT) || 8080;

http.createServer((req, res) => {
  let ruta = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let archivo = path.join(DIST, ruta);
  if (!archivo.startsWith(DIST)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(archivo) && fs.statSync(archivo).isDirectory()) archivo = path.join(archivo, "index.html");
  if (!fs.existsSync(archivo)) {
    if (!ruta.endsWith("/") && fs.existsSync(path.join(DIST, ruta, "index.html"))) { res.writeHead(301, { Location: ruta + "/" }).end(); return; }
    res.writeHead(404, { "Content-Type": TIPOS[".html"] }).end(fs.readFileSync(path.join(DIST, "404.html")));
    return;
  }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream" }).end(fs.readFileSync(archivo));
}).listen(PUERTO, () => console.log(`Vista previa de Promptario en http://localhost:${PUERTO}  (Ctrl+C para detener)`));
