import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function authenticated() {
  const token = (await cookies()).get("grupo-e-session")?.value;
  if (!token) return false;
  const row = db()
    .prepare("SELECT expires FROM sessions WHERE token=?")
    .get(hash(token)) as { expires: number } | undefined;
  return !!row && row.expires > Date.now();
}
export async function requireAdmin() {
  if (!(await authenticated())) redirect("/admin/login");
}
export async function createSession() {
  const token = randomBytes(32).toString("hex");
  db().prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  db()
    .prepare("INSERT INTO sessions(token,expires) VALUES(?,?)")
    .run(hash(token), Date.now() + 1000 * 60 * 60 * 8);
  (await cookies()).set("grupo-e-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get("grupo-e-session")?.value;
  if (token)
    db().prepare("DELETE FROM sessions WHERE token=?").run(hash(token));
  jar.delete("grupo-e-session");
}
export function allowLogin() {
  const now = Date.now();
  const row = db()
    .prepare("SELECT count,expires FROM attempts WHERE key=?")
    .get("admin") as { count: number; expires: number } | undefined;
  if (row && row.expires > now && row.count >= 10) return false;
  if (!row || row.expires <= now)
    db()
      .prepare(
        "INSERT INTO attempts(key,count,expires) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET count=excluded.count,expires=excluded.expires",
      )
      .run("admin", 1, now + 15 * 60 * 1000);
  else
    db().prepare("UPDATE attempts SET count=count+1 WHERE key=?").run("admin");
  return true;
}
