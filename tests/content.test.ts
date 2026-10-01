import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { verifyPassword } from "../src/lib/password.ts";
import {
  validateEntry,
  safeLink,
  isPast,
} from "../src/lib/event-validation.ts";
function form() {
  const f = new FormData();
  f.set("title", "Oficina de confeitaria");
  f.set("excerpt", "Uma oficina para aprender técnicas de confeitaria.");
  f.set(
    "body",
    "Conteúdo completo da oficina, com demonstração de técnicas e apresentação de receitas.",
  );
  f.set("category", "Cursos");
  f.set("status", "published");
  return f;
}
test("publicação de curso exige data e converte horário de Brasília", () => {
  const f = form();
  assert.throws(() => validateEntry(f), /data e o horário/);
  f.set("eventDate", "2027-03-10T14:30");
  assert.equal(validateEntry(f).eventDate, "2027-03-10T17:30:00.000Z");
});
test("rascunho e arquivo podem ser salvos sem inventar data de realização", () => {
  const f = form();
  f.set("status", "draft");
  assert.equal(validateEntry(f).eventDate, "");
  f.set("status", "published");
  f.set("archived", "on");
  assert.equal(validateEntry(f).archived, true);
  assert.equal(isPast({ archived: true, eventDate: "" }), true);
});
test("links de inscrição rejeitam javascript, HTTP e credenciais embutidas", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.com",
    "https://user:secret@example.com",
  ])
    assert.throws(() => safeLink(url));
  assert.equal(
    safeLink("https://www.sympla.com.br/evento/123"),
    "https://www.sympla.com.br/evento/123",
  );
});
test("hash de senha valida senha correta e rejeita entradas incorretas", () => {
  const salt = "0123456789abcdef0123456789abcdef";
  const password = "senha-de-teste-nao-real";
  const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  assert.equal(verifyPassword(password, hash), true);
  assert.equal(verifyPassword("incorreta", hash), false);
  assert.equal(verifyPassword(password, "invalido"), false);
});
