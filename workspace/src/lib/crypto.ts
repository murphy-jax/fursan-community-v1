/**
 * Client-side crypto utilities.
 * - Passwords are hashed with bcrypt (cost 10). Plaintext passwords are never stored.
 * - The Discord bot token is sealed with AES-256-GCM under a locally generated vault key.
 *   In a hosted deployment this logic moves to the server, where the vault key lives in
 *   environment variables and cookies become HttpOnly/SameSite — see README.
 */
import { hashSync, compareSync } from "bcryptjs";

export function hashPassword(plain: string): string {
  return hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return compareSync(plain, hash);
  } catch {
    return false;
  }
}

const VAULT_KEY = "fursan_vault_key_v1";

function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBuf(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function getVaultKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(VAULT_KEY);
  if (stored) {
    try {
      return await crypto.subtle.importKey("jwk", JSON.parse(stored), { name: "AES-GCM" }, false, [
        "encrypt",
        "decrypt",
      ]);
    } catch {
      /* regenerate below */
    }
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const jwk = await crypto.subtle.exportKey("jwk", key);
  localStorage.setItem(VAULT_KEY, JSON.stringify(jwk));
  return key;
}

/** Returns base64(iv).base64(ciphertext) */
export async function encryptText(plain: string): Promise<string> {
  const key = await getVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain)
  );
  return `${bufToB64(iv)}.${bufToB64(ct)}`;
}

export async function decryptText(payload: string): Promise<string> {
  const key = await getVaultKey();
  const [ivB64, ctB64] = payload.split(".");
  if (!ivB64 || !ctB64) throw new Error("Malformed sealed value");
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBuf(ivB64) as BufferSource },
    key,
    b64ToBuf(ctB64) as BufferSource
  );
  return new TextDecoder().decode(pt);
}

export function randomToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
