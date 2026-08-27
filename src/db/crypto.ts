const encoder = new TextEncoder()
const decoder = new TextDecoder()

export interface EncryptedValue {
  iv: string
  ciphertext: string
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function randomSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function deriveDeviceKey(pin: string, salt: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromBase64(salt), iterations: 210_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedValue> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(value)))
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) }
}

export async function decryptJson<T>(key: CryptoKey, value: EncryptedValue): Promise<T> {
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(value.iv) }, key, fromBase64(value.ciphertext))
  return JSON.parse(decoder.decode(plaintext)) as T
}
