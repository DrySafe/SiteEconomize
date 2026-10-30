import { copyFile } from "node:fs/promises";
import { constants } from "node:fs";

const source = new URL("../.env.example", import.meta.url);
const destination = new URL("../.env.local", import.meta.url);

try {
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  console.log(".env.local criado. Abra o arquivo e preencha os campos vazios.");
  console.log("Depois execute npm run admin:setup e npm run env:check.");
  console.log("As chaves reais ficam no .env.local; nunca no .env.example.");
} catch (error) {
  if (error.code === "EEXIST") {
    console.log(".env.local já existe e foi preservado.");
    console.log("Compare com .env.example e atualize somente os campos necessários.");
  } else {
    console.error("Não foi possível criar .env.local. Confira as permissões da pasta.");
    process.exitCode = 1;
  }
}
