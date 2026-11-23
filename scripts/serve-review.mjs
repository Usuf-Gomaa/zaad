// Loopback-only, read-only static review runner. No accounts, uploads or remote hosting.
import http from "node:http";
import { readFileSync, statSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
const root = resolve(".review-dist");
const marker = JSON.parse(
  readFileSync(resolve(root, "review-build.json"), "utf8"),
);
if (marker.privateReview !== true || marker.publicDistribution !== false)
  throw Error("Refusing to serve an unmarked review artifact");
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
http
  .createServer((req, res) => {
    if (
      !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(
        req.socket.remoteAddress,
      ) ||
      !["127.0.0.1:4180", "localhost:4180"].includes(req.headers.host || "")
    ) {
      res.writeHead(403);
      res.end("Local review only");
      return;
    }
    if (!["GET", "HEAD"].includes(req.method || "")) {
      res.writeHead(405);
      res.end();
      return;
    }
    let path;
    try {
      const url = new URL(req.url, "http://127.0.0.1:4180");
      path = resolve(root, "." + decodeURIComponent(url.pathname));
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      if (!statSync(path).isFile()) path = resolve(root, "index.html");
    } catch {
      if (extname(path)) {
        res.writeHead(404);
        res.end();
        return;
      }
      path = resolve(root, "index.html");
    }
    try {
      const data = readFileSync(path);
      res.writeHead(200, {
        "Content-Type": types[extname(path)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(4180, "127.0.0.1", () =>
    console.log(
      "Private local review: http://127.0.0.1:4180/review (not a public deployment)",
    ),
  );
