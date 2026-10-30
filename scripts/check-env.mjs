import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";

let local = {};
try {
  local = parseEnv(await readFile(new URL("../.env.local", import.meta.url), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error("Não foi possível ler .env.local. Confira o arquivo e suas permissões.");
    process.exit(1);
  }
}
// Variáveis do processo têm prioridade, como no Next.js.
const env = { ...local, ...process.env };
const errors = [];
const warnings = [];
const get = (key) => String(env[key] || "").trim();

let url;
try {
  url = new URL(get("SUPABASE_URL"));
  if (url.protocol !== "https:") throw new Error("https");
} catch {
  errors.push("SUPABASE_URL: informe uma URL HTTPS válida.");
}
if (url && url.hostname !== "rjcovpfddmwwetqlrnas.supabase.co") {
  warnings.push("SUPABASE_URL aponta para outro projeto. Confirme o ambiente antes de continuar.");
}
const key = get("SUPABASE_SECRET_KEY") || get("SUPABASE_SERVICE_ROLE_KEY");
if (!key) {
  errors.push("SUPABASE_SECRET_KEY: preencha a chave secreta do projeto.");
} else if (!key.startsWith("sb_secret_") && !key.startsWith("eyJ")) {
  errors.push("Chave do servidor: use uma Secret key ou a service_role legada.");
}
if (get("SUPABASE_SECRET_KEY") && get("SUPABASE_SERVICE_ROLE_KEY")) {
  warnings.push("Duas chaves de servidor preenchidas. SUPABASE_SECRET_KEY terá prioridade.");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("ADMIN_EMAIL"))) {
  errors.push("ADMIN_EMAIL: preencha o e-mail do administrador.");
}
if (!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(get("ADMIN_PASSWORD_HASH"))) {
  errors.push("ADMIN_PASSWORD_HASH: gere o hash com npm run admin:setup.");
}
for (const [name, value] of Object.entries(env)) {
  if (name.startsWith("NEXT_PUBLIC_") && String(value).startsWith("sb_secret_")) {
    errors.push(name + ": contém uma chave secreta em uma variável pública. Remova-a e rotacione a chave se já houve publicação.");
  }
}
const publicKey = get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
if (publicKey && !publicKey.startsWith("sb_publishable_")) {
  errors.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: use a Publishable key do projeto.");
}
if (publicKey && get("NEXT_PUBLIC_SUPABASE_URL") !== get("SUPABASE_URL")) {
  errors.push("As URLs pública e do servidor devem apontar para o mesmo projeto neste ambiente.");
}
for (const name of ["NEXT_PUBLIC_WHATSAPP_LOJAS", "NEXT_PUBLIC_WHATSAPP_EMBALACENTER"]) {
  if (get(name) && !/^[1-9]\d{9,14}$/.test(get(name))) {
    errors.push(name + ": use apenas dígitos, incluindo país e DDD.");
  }
}
for (const warning of warnings) console.warn("ATENÇÃO: " + warning);
for (const error of errors) console.error("PENDENTE: " + error);
if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("Formato dos campos obrigatórios conferido. Nenhum valor de credencial foi exibido.");
}
console.log("Esta checagem não acessa o Supabase nem confirma credenciais, tabelas, usuários ou permissões.");
