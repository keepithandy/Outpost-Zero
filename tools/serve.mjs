import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const port = Number.parseInt(process.env.OUTPOST_ZERO_PORT ?? "4173", 10);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

function extension(pathname) {
  const index = pathname.lastIndexOf(".");
  return index === -1 ? "" : pathname.slice(index);
}

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
    const target = new URL(relativePath, root);

    if (!target.href.startsWith(root.href) || !(await stat(target)).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    const content = await readFile(target);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extension(pathname)) ?? "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Outpost Zero is running at http://127.0.0.1:${port}`);
});
