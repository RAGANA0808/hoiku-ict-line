import { encryptSecret, decryptSecret, parseEncryptionKey } from '@hoiku/lib';
import { requireEncryptionKey } from './env';

let cachedKey: Buffer | null = null;

const getKey = (): Buffer => {
  if (cachedKey) return cachedKey;
  cachedKey = parseEncryptionKey(requireEncryptionKey());
  return cachedKey;
};

export const encrypt = (plaintext: string): string => encryptSecret(plaintext, getKey());

export const decrypt = (ciphertext: string): string => decryptSecret(ciphertext, getKey());
