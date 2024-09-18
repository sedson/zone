import { server } from "./src/server";
import { join } from "path";

const PORT = 8712;

console.log(`http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  fetch: await server({
    notes: join(import.meta.dir, "notes"),
    pub: join(import.meta.dir, "public"),
  }),
});