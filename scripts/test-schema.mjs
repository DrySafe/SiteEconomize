import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import assert from "node:assert/strict";
const pg = new PGlite();
try {
  // Infraestrutura que o Supabase já fornece; somente para este Postgres isolado.
  await pg.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  const files = (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files)
    await pg.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  // A migração é repetível, sem duplicar os registros importados.
  for (const file of files)
    await pg.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
  await pg.exec(
    `insert into public.grupo_e_events(id,slug,status,published_at,data) values ('private-test','private-test','draft',now(),' {"id":"private-test","slug":"private-test","status":"draft"}'::jsonb);`,
  );
  await pg.exec("set role anon");
  const visible = await pg.query("select id,status from public.grupo_e_events");
  assert.equal(visible.rows.length, 5);
  assert.ok(visible.rows.every((r) => r.status === "published"));
  for (const table of [
    "grupo_e_sessions",
    "grupo_e_login_attempts",
    "grupo_e_media",
  ])
    await assert.rejects(
      pg.query(`select * from public.${table}`),
      /permission denied/,
    );
  await assert.rejects(
    pg.query("select public.grupo_e_allow_login()"),
    /permission denied/,
  );
  await assert.rejects(
    pg.query("delete from public.grupo_e_events"),
    /permission denied/,
  );
  await pg.exec("reset role; set role service_role");
  assert.equal(
    (await pg.query("select id from public.grupo_e_events")).rows.length,
    6,
  );
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await pg.query("select public.grupo_e_allow_login() as allowed")).rows[0]
        .allowed,
      true,
    );
  assert.equal(
    (await pg.query("select public.grupo_e_allow_login() as allowed")).rows[0]
      .allowed,
    false,
  );
  await pg.exec(
    "update public.grupo_e_login_attempts set expires_at=now()-interval '1 minute'",
  );
  assert.equal(
    (await pg.query("select public.grupo_e_allow_login() as allowed")).rows[0]
      .allowed,
    true,
  );
  await pg.exec("reset role");
  assert.equal(
    (
      await pg.query(
        "select public from storage.buckets where id='grupo-e-eventos'",
      )
    ).rows[0].public,
    false,
  );
  assert.ok(
    (
      await pg.query(
        "select relrowsecurity from pg_class where relname like 'grupo_e_%' and relkind='r'",
      )
    ).rows.every((r) => r.relrowsecurity),
  );
  console.log(
    "PASS Postgres: migração repetível, arquivo importado, RLS, rascunhos privados, tabelas restritas, RPC restrita, limite de login e bucket privado.",
  );
} finally {
  await pg.close();
}
