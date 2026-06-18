/**
 * Access-key crypto shared by CLI scripts.
 * Server implementation: src/lib/accessKey.server.ts (keep in sync).
 */
import { createHash, randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function normalizeAccessKey(raw) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function internalEmail(userId) {
  return `${userId}@users.roidersclub.internal`;
}

export function generateAccessKey() {
  const bytes = randomBytes(16);
  const groups = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) group += ALPHABET[bytes[g * 4 + i] % ALPHABET.length];
    groups.push(group);
  }
  return `roiders_${groups.join("_")}`;
}

export function fingerprintAccessKey(key) {
  return createHash("sha256").update(normalizeAccessKey(key)).digest("hex").slice(0, 16);
}

export async function hashAccessKey(key) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(normalizeAccessKey(key), salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}