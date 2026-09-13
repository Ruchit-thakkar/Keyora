/**
 * Keyora Zero-Knowledge Cryptographic Engine
 * Uses the native browser Web Crypto API (SubtleCrypto)
 * - AES-GCM 256-bit for encrypted payload storage
 * - PBKDF2-HMAC-SHA256 for key derivation (100,000 iterations)
 * - SHA-256 for PIN hashing with cryptographic salt
 */

// Convert ArrayBuffer to Base64 string
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert ArrayBuffer to Hex string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate cryptographically secure random bytes
export function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

// Generate random hex salt
export function generateSalt(length = 16): string {
  return bufferToHex(getRandomBytes(length));
}

/**
 * Derives an AES-GCM 256-bit CryptoKey using PBKDF2
 * @param secret Master password or user secret
 * @param salt Unique user salt string (hex or base64)
 * @param iterations Standard 100,000 rounds
 */
export async function deriveKey(
  secret: string,
  salt: string,
  iterations = 100000
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false, // non-exportable for high security
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt plaintext using AES-GCM 256-bit
 * Returns ciphertext and IV both encoded in Base64
 */
export async function encryptText(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = getRandomBytes(12); // standard 96-bit IV for AES-GCM
  const enc = new TextEncoder();
  const encodedData = enc.encode(plaintext);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
  };
}

/**
 * Decrypt AES-GCM 256-bit ciphertext
 */
export async function decryptText(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const ciphertext = base64ToBuffer(ciphertextBase64);
  const iv = base64ToBuffer(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
    },
    key,
    ciphertext as unknown as BufferSource
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Computes a salted SHA-256 hash for PIN verification
 * Never store raw 4-digit PIN anywhere!
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pin}:${salt}`);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/**
 * Verify if an entered PIN matches stored hash
 */
export async function verifyPin(
  enteredPin: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const computed = await hashPin(enteredPin, storedSalt);
  return computed === storedHash;
}

export const derivePinVerifier = hashPin;
export const verifyPinVerifier = verifyPin;
