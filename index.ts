import { server } from "./src/server";
import { join } from "path";

// @ts-ignore : bun supports import toml as js object.
import config from "./zone-config.toml";

const PORT = 8712;

console.log(`http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  fetch: await server({
    daily: config.daily,
    named: config.named,
    pub: join(import.meta.dir, "public"),
  }),
});