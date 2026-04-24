import { createHmac, timingSafeEqual } from 'node:crypto';

export const verifyLineSignature = (
  channelSecret: string,
  rawBody: string,
  signature: string,
): boolean => {
  if (!signature) return false;
  const expected = createHmac('sha256', channelSecret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};
