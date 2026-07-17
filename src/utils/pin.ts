const HASH_ALGORITHM = 'SHA-256';
const SALT_BYTES = 16;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function digest(salt: Uint8Array, pin: string): Promise<string> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(salt.length + pinBytes.length);
  combined.set(salt, 0);
  combined.set(pinBytes, salt.length);
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, combined);
  return toHex(hashBuffer);
}

// Stored as `${saltHex}:${hashHex}`. A PIN is a 4-6 digit UX gate on an
// already-authenticated parent session, not an independent auth boundary,
// so a fast salted hash (rather than bcrypt/scrypt) is an intentional choice.
export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await digest(salt, pin);
  return `${toHex(salt)}:${hash}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const candidate = await digest(fromHex(saltHex), pin);
  return candidate === hashHex;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
