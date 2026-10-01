import { createServer } from "node:http";
import { seed } from "../src/lib/seed.ts";

// API isolada para os testes HTTP do SDK. Não simula nem substitui as regras RLS:
// a migração e as políticas são verificadas separadamente em Postgres/PGlite.
export async function startFixture(key) {
  const tables = {
    grupo_e_events: seed.map((e) => ({
      id: e.id,
      slug: e.slug,
      status: e.status,
      published_at: e.publishedAt,
      data: structuredClone(e),
    })),
    grupo_e_sessions: [],
    grupo_e_media: [],
    grupo_e_login_attempts: [],
  };
  const files = new Map();
  let attempts = 0;
  const matches = (row, params) =>
    [...params.entries()].every(([column, value]) => {
      if (["select", "order", "limit", "on_conflict"].includes(column))
        return true;
      const item = column.startsWith("data->>")
        ? row.data?.[column.slice(7)]
        : row[column];
      if (value.startsWith("eq.")) return String(item) === value.slice(3);
      if (value.startsWith("lt.")) return String(item) < value.slice(3);
      return false;
    });
  const api = createServer(async (req, res) => {
    const json = (value, status = 200) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(value));
    };
    try {
      if (req.headers.apikey !== key)
        return json({ message: "Unauthorized" }, 401);
      const url = new URL(req.url, "http://localhost");
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const bytes = Buffer.concat(chunks);
      if (url.pathname === "/rest/v1/rpc/grupo_e_allow_login")
        return json(++attempts <= 10);
      if (url.pathname.startsWith("/rest/v1/")) {
        const name = url.pathname.split("/").pop();
        const table = tables[name];
        if (!table) return json({ message: "Unknown table" }, 404);
        if (req.method === "GET") {
          let result = table.filter((row) => matches(row, url.searchParams));
          if (url.searchParams.get("order") === "published_at.desc")
            result.sort((a, b) => b.published_at.localeCompare(a.published_at));
          if (url.searchParams.has("limit"))
            result = result.slice(0, Number(url.searchParams.get("limit")));
          return json(
            req.headers.accept?.includes("vnd.pgrst.object")
              ? result[0] || null
              : result,
          );
        }
        if (req.method === "DELETE") {
          const removed = table.filter((row) => matches(row, url.searchParams));
          tables[name] = table.filter((row) => !matches(row, url.searchParams));
          if (name === "grupo_e_login_attempts") attempts = 0;
          return json(removed);
        }
        if (req.method === "POST") {
          const body = JSON.parse(bytes.toString());
          const rows = Array.isArray(body) ? body : [body];
          for (const row of rows) {
            const primary =
              name === "grupo_e_sessions"
                ? "token"
                : name === "grupo_e_login_attempts"
                  ? "key"
                  : "id";
            const old = table.findIndex(
              (item) => item[primary] === row[primary],
            );
            if (old >= 0) table[old] = row;
            else table.push(row);
          }
          return json(rows, 201);
        }
      }
      if (url.pathname.startsWith("/storage/v1/object/")) {
        const path = decodeURIComponent(
          url.pathname.slice("/storage/v1/object/".length),
        );
        if (req.method === "POST") {
          files.set(path, { bytes, type: req.headers["content-type"] });
          return json({ Key: path }, 200);
        }
        if (req.method === "GET") {
          const file = files.get(path);
          if (!file) return json({ message: "Not found" }, 404);
          res.writeHead(200, { "Content-Type": file.type });
          return res.end(file.bytes);
        }
        if (req.method === "DELETE") {
          const body = JSON.parse(bytes.toString());
          for (const prefix of body.prefixes || [])
            files.delete(`${path}/${prefix}`);
          return json([]);
        }
      }
      return json({ message: "Unhandled fixture route" }, 404);
    } catch (error) {
      return json({ message: error.message }, 500);
    }
  });
  await new Promise((r) => api.listen(0, "127.0.0.1", r));
  return {
    url: `http://127.0.0.1:${api.address().port}`,
    close: () => new Promise((r) => api.close(r)),
    tables,
    files,
  };
}
