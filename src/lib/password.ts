import { scryptSync, timingSafeEqual } from "node:crypto";
export function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, hex] = encoded.split(":");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(hex || "")
  )
    return false;
  const expected = Buffer.from(hex, "hex");
  const actual = scryptSync(password, salt, 64);
  return timingSafeEqual(expected, actual);
}
