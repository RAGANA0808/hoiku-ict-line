import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyLineSignature } from './signature';

const channelSecret = 'test-channel-secret';
const body = JSON.stringify({ destination: 'U123', events: [] });
const sign = (s: string, b: string) => createHmac('sha256', s).update(b).digest('base64');

describe('verifyLineSignature', () => {
  it('accepts correct signature', () => {
    const sig = sign(channelSecret, body);
    expect(verifyLineSignature(channelSecret, body, sig)).toBe(true);
  });

  it('rejects wrong signature', () => {
    expect(verifyLineSignature(channelSecret, body, 'wrong-signature-base64==')).toBe(false);
  });

  it('rejects empty signature', () => {
    expect(verifyLineSignature(channelSecret, body, '')).toBe(false);
  });

  it('rejects signature from different secret', () => {
    const sig = sign('other-secret', body);
    expect(verifyLineSignature(channelSecret, body, sig)).toBe(false);
  });

  it('rejects signature when body is altered', () => {
    const sig = sign(channelSecret, body);
    expect(verifyLineSignature(channelSecret, body + ' ', sig)).toBe(false);
  });
});
