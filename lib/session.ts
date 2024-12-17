"use server";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretKey } from "./auth.config";

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  const cookieStore = cookies();
  await cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400, // 24 hours
  });
}

export async function getSession() {
  const cookieStore = cookies();
  const token = await cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (err) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = cookies();
  await cookieStore.delete("session");
}
