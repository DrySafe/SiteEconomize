import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

// Credenciais temporárias, exclusivamente para este teste isolado.
const directory = await mkdtemp(join(tmpdir(), "grupoe-verify-"));
const password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3001"],
  {
    env: {
      ...process.env,
      DATA_DIR: directory,
      ADMIN_EMAIL: "admin@example.test",
      ADMIN_PASSWORD_HASH: `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverErrors = "";
server.stderr.on("data", (d) => (serverErrors += d.toString()));
let browser;
try {
  const base = "http://localhost:3001";
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) break;
    } catch {}
    if (i === 59) throw new Error("Servidor não iniciou: " + serverErrors);
    await new Promise((r) => setTimeout(r, 250));
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.getByRole("heading", { name: /Conectamos/ }).waitFor();
  assert.equal(
    await page
      .locator("body")
      .evaluate((el) => el.scrollWidth <= window.innerWidth),
    true,
  );
  await page.screenshot({ path: "/tmp/grupoe-home.png", fullPage: true });
  await page.goto(base + "/cursos-e-eventos");
  await page.getByRole("heading", { name: /Aprender/, level: 1 }).waitFor();
  await page
    .getByRole("textbox", { name: "Buscar cursos e eventos" })
    .fill("licor");
  assert.equal(await page.locator(".event-card").count(), 1);
  await page.getByRole("textbox", { name: "Buscar cursos e eventos" }).fill("");
  await page
    .getByRole("combobox", { name: "Filtrar por período" })
    .selectOption("Próximos");
  await page
    .getByRole("heading", { name: "Novos encontros vêm por aí." })
    .waitFor();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await page.screenshot({ path: "/tmp/grupoe-blog.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page
      .locator("body")
      .evaluate((el) => el.scrollWidth <= window.innerWidth),
    true,
  );
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "O grupo" })
    .click();
  await page.getByRole("heading", { name: /Conectamos/ }).waitFor();
  await page.screenshot({ path: "/tmp/grupoe-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/admin/novo");
  await page.waitForURL("**/admin/login");
  await page.getByLabel("E-mail", { exact: true }).fill("admin@example.test");
  await page.getByLabel("Senha", { exact: true }).fill("incorreta");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "E-mail ou senha incorretos." })
    .waitFor();
  await page.getByLabel("Senha", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await page
    .waitForURL(base + "/admin", { timeout: 10000 })
    .catch(async (error) => {
      await page.screenshot({ path: "/tmp/grupoe-login-debug.png" });
      console.log("Login: ", await page.locator("body").innerText());
      console.log(
        "Cookies: ",
        (await context.cookies()).map((c) => ({
          name: c.name,
          secure: c.secure,
        })),
      );
      throw error;
    });
  await page.getByRole("link", { name: "Novo conteúdo", exact: true }).click();
  await page.getByLabel(/^Título/).fill("Oficina de teste de publicação");
  await page
    .getByLabel(/^Resumo/)
    .fill(
      "Uma oficina temporária para verificar o fluxo completo de publicação.",
    );
  await page
    .getByLabel(/^Texto completo/)
    .fill(
      "Esta oficina existe somente no banco temporário de verificação.\n\nNão será publicada no site entregue ao cliente.",
    );
  await page
    .getByLabel("Imagem de capa", { exact: false })
    .setInputFiles("public/images/Logo-PNG.png");
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .first()
    .click();
  await page.waitForURL("**/admin?saved=1");
  assert.equal(
    await page
      .locator(".admin-list-row")
      .filter({ hasText: "Oficina de teste" })
      .locator(".publication-status")
      .innerText(),
    "Rascunho",
  );
  let response = await context.request.get(base + "/cursos-e-eventos");
  assert.equal(
    (await response.text()).includes("Oficina de teste de publicação"),
    false,
  );
  await page
    .getByRole("link", { name: "Editar Oficina de teste de publicação" })
    .click();
  await page.getByLabel("Visibilidade").selectOption("published");
  await page
    .getByLabel("Data e horário", { exact: false })
    .fill("2027-03-10T14:30");
  await page.getByLabel("Local", { exact: true }).fill("Aracaju");
  await page
    .getByLabel("Link de inscrição", { exact: false })
    .fill("https://www.sympla.com.br/");
  await page
    .getByRole("button", { name: "Salvar conteúdo", exact: true })
    .first()
    .click();
  await page.waitForURL("**/admin?saved=1");
  await page.screenshot({ path: "/tmp/grupoe-admin.png", fullPage: true });
  const row = page
    .locator(".admin-list-row")
    .filter({ hasText: "Oficina de teste" });
  const link = await row
    .getByRole("link", { name: "Ver Oficina de teste de publicação no site" })
    .getAttribute("href");
  const publicPage = await context.newPage();
  await publicPage.goto(base + link);
  await publicPage
    .getByRole("heading", { name: "Oficina de teste de publicação" })
    .waitFor();
  assert.equal(
    await publicPage
      .getByRole("link", { name: "Quero me inscrever" })
      .getAttribute("href"),
    "https://www.sympla.com.br/",
  );
  const imageSrc = await publicPage
    .locator(".article-cover img")
    .getAttribute("src");
  assert.ok(imageSrc.includes("media"));
  await publicPage.close();
  await row
    .getByRole("button", { name: "Excluir Oficina de teste de publicação" })
    .click();
  await row.getByRole("button", { name: "Sim, excluir" }).click();
  await row.waitFor({ state: "detached" });
  response = await context.request.get(base + link);
  assert.equal(response.status(), 404);
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL("**/admin/login");
  await page.goto(base + "/admin");
  await page.waitForURL("**/admin/login");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop/mobile, menu, busca, filtros, acesso protegido, login, upload, rascunho privado, edição, publicação, inscrição, exclusão e logout. Nenhum erro de página.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise((r) => server.once("exit", r));
  await rm(directory, { recursive: true, force: true });
}
