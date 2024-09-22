import { server } from "./src/server";
import { join } from "path";

const PORT = 8712;

// @ts-ignore : bun supports import toml as pojo
import config from "./zone-config.toml";

console.log(`http://localhost:${PORT}`);

Bun.serve({
  port: PORT,
  fetch: await server({
    daily: config.daily,
    named: config.named,
    pub: join(import.meta.dir, "public"),
  }),
});