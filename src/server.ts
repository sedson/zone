import { Files } from "./files";
import { extname, join } from "path";

type Server = (req: Request) => Promise<Response>;
type ServerConfig = {
  notes: string,
  pub: string,
}

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};


function json(data: Object): Response {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}


async function serveFile(path: string): Promise<Response> {
  const ext = extname(path);
  const file = Bun.file(path);
  if (!await file.exists()) {
    return new Response("not found", { status: 404 });
  }
  return new Response(file, {
    headers: {
      "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
    }
  });
}


/**
 * Set up the notes server
 * @param {ServerConfig} { pub, notes }
 * @return {Promise<Server>}
 */
export async function server({ pub, notes }: ServerConfig): Promise<Server> {
  await Files.init(notes);

  return async function (req: Request): Promise<Response> {
    const method = req.method.toUpperCase();
    let path = new URL(req.url).pathname;
    console.log(method + " " + path);

    let parts = path.split("/").filter(p => p);
    let start = parts.shift();

    // /notes
    if (start === "notes") {
      if (!parts.length) {

        // POST /notes
        if (method === "POST") {
          const body = await req.json();
          return json(await Files.create(body) ?? {});
        }

        // GET /notes
        const daily = await Files.allDaily();
        const named = await Files.allNamed();
        return json({ daily, named })
      }

      const id = parts.shift();

      if (id) {
        // GET /nodes/:id 
        if (method === "GET") {
          console.log(id)
          return json(await Files.getById(id) ?? {});
        }

        // PUT /nodes/:id 
        if (method === "PUT") {
          const updates = await req.json();
          return json(await Files.update(id, updates) ?? {});
        }

        // DELETE /notes/:id
        if (method === "DELETE") {
          return json(await Files.delete(id) ?? {});
        }
      }
    }

    // TODO: search
    if (start === "search") {
      return json({});
    }

    // Handle directories  
    if (path.endsWith("/")) {
      const index = Bun.file(join(pub, path, "index.html"));
      if (await index.exists()) {
        // Index exists -> serve it!
        path = join(path, "index.html"); 
      }
    }

    // Redirect "raw" URLs to directories.
    const ext = extname(path);
    if (!ext) {
      return Response.redirect(join(path, "/"), 301);
    }
    
    const file = Bun.file(join(pub, path));
    if (!await file.exists()) {
      return new Response("not found", { status: 404 });
    }

    return serveFile(join(pub, path));
  }
}