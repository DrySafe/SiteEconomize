import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
const terminal = createInterface({ input: stdin, output: stdout });
const email = (await terminal.question("E-mail do administrador: "))
  .trim()
  .toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  terminal.close();
  throw new Error("E-mail inválido.");
}
terminal.close();
if (!stdin.isTTY) throw new Error("Execute em um terminal interativo.");
stdout.write("Senha (mínimo 12 caracteres, entrada oculta): ");
stdin.setRawMode(true);
stdin.resume();
let password = "";
await new Promise((resolve) => {
  const onData = (chunk) => {
    for (const char of chunk.toString()) {
      if (char === "\u0003") {
        process.exit(130);
      }
      if (char === "\r" || char === "\n") {
        stdin.off("data", onData);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write("\n");
        resolve();
        return;
      }
      if (char === "\u007f") password = password.slice(0, -1);
      else password += char;
    }
  };
  stdin.on("data", onData);
});
if (password.length < 12)
  throw new Error("Use uma senha com pelo menos 12 caracteres.");
const salt = randomBytes(16).toString("hex");
const encoded = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
stdout.write(
  `\nAdicione em .env.local (não envie este arquivo ao GitHub):\nADMIN_EMAIL=${email}\nADMIN_PASSWORD_HASH=${encoded}\n`,
);
