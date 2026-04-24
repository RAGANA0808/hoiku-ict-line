import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export const parseEncryptionKey = (base64Key: string | undefined): Buffer => {
  if (!base64Key) {
    throw new Error(
      'APP_ENCRYPTION_KEY が設定されていません。以下のコマンドで生成してください:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"',
    );
  }
  const key = Buffer.from(base64Key, 'base64');
  if (key.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY は 32 バイト (base64) である必要があります。');
  }
  return key;
};

export const encryptSecret = (plaintext: string, key: Buffer): string => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
};

export const decryptSecret = (encoded: string, key: Buffer): string => {
  const data = Buffer.from(encoded, 'base64');
  if (data.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('暗号文のフォーマットが不正です。');
  }
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};
