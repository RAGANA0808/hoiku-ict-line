import { describe, expect, it } from 'vitest';
import { generateInviteCode, newId } from './id';

describe('newId', () => {
  it('returns a UUID-ish string', () => {
    const id = newId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('returns distinct values', () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
  });
});

describe('generateInviteCode', () => {
  it('returns the requested length', () => {
    expect(generateInviteCode(8)).toHaveLength(8);
    expect(generateInviteCode(12)).toHaveLength(12);
  });

  it('uses only the allowed alphabet (no confusable chars)', () => {
    const code = generateInviteCode(32);
    expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
    // exclude: I, O, 0, 1
    expect(code).not.toMatch(/[IO01]/);
  });

  it('generates different codes on each call', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateInviteCode(8)));
    expect(codes.size).toBeGreaterThan(40);
  });
});
