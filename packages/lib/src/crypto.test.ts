import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret, parseEncryptionKey } from './crypto';

const key = randomBytes(32);
const validBase64 = key.toString('base64');

describe('parseEncryptionKey', () => {
  it('accepts valid 32-byte base64 key', () => {
    const buf = parseEncryptionKey(validBase64);
    expect(buf.length).toBe(32);
  });

  it('throws on missing key', () => {
    expect(() => parseEncryptionKey(undefined)).toThrow();
  });

  it('throws on wrong key length', () => {
    const shortKey = randomBytes(16).toString('base64');
    expect(() => parseEncryptionKey(shortKey)).toThrow();
  });
});

describe('encryptSecret / decryptSecret', () => {
  it('roundtrips ASCII text', () => {
    const enc = encryptSecret('hello world', key);
    expect(decryptSecret(enc, key)).toBe('hello world');
  });

  it('roundtrips Japanese text', () => {
    const enc = encryptSecret('チャネルシークレット', key);
    expect(decryptSecret(enc, key)).toBe('チャネルシークレット');
  });

  it('produces different ciphertext each time (random IV)', () => {
    const a = encryptSecret('same', key);
    const b = encryptSecret('same', key);
    expect(a).not.toBe(b);
  });

  it('fails to decrypt with different key', () => {
    const enc = encryptSecret('secret', key);
    const otherKey = randomBytes(32);
    expect(() => decryptSecret(enc, otherKey)).toThrow();
  });

  it('fails to decrypt tampered ciphertext', () => {
    const enc = encryptSecret('secret', key);
    const tampered = enc.slice(0, -4) + 'AAAA';
    expect(() => decryptSecret(tampered, key)).toThrow();
  });
});
