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
    secure: false, // Set to false for development
    sameSite: "lax",
    maxAge: 86400, // 24 hours
    path: "/", // Ensure the cookie is available for all paths
  });

  // await cookieStore.set("session", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   maxAge: 86400, // 24 hours
  // });
}

export async function getSession() {
  const cookieStore = cookies();
  const sessionCookie = await cookieStore.get("session");
  const token = sessionCookie?.value;

  console.log("Token exists:", !!token);

  if (!token) return null;

  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    console.log("JWT verified successfully:", verified.payload);
    return verified.payload;
  } catch (err) {
    console.error("JWT verification error:", err);
    return null;
  }
}

export async function destroySession() {
  const cookieStore = cookies();
  await cookieStore.delete("session");
}
