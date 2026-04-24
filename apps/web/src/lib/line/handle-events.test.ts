import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { handleLineEvent, type ChannelContext } from './handle-events';

const mockReply = vi.fn().mockResolvedValue(undefined);
vi.mock('@hoiku/line', async () => {
  const actual = await vi.importActual<typeof import('@hoiku/line')>('@hoiku/line');
  return {
    ...actual,
    replyMessage: (...args: Parameters<typeof actual.replyMessage>) => mockReply(...args),
  };
});

const makeSupabaseMock = (options: { existingId?: string | null } = {}) => {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const insert = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn().mockReturnValue({ eq: updateEq });
  const maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: options.existingId ? { id: options.existingId } : null });

  const from = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
    }),
    update,
    insert,
  });

  return {
    client: { from } as unknown as SupabaseClient,
    insert,
    updateEq,
  };
};

const ctx: ChannelContext = {
  tenantId: 'tenant-1',
  lineChannelId: 'channel-1',
  accessToken: 'token-xyz',
};

beforeEach(() => {
  mockReply.mockClear();
});

describe('handleLineEvent — follow', () => {
  it('inserts line_user and sends welcome reply when user not yet known', async () => {
    const sb = makeSupabaseMock({ existingId: null });
    await handleLineEvent(sb.client, ctx, {
      type: 'follow',
      timestamp: Date.now(),
      source: { type: 'user', userId: 'U1' },
      replyToken: 'rt-1',
    });

    expect(sb.insert).toHaveBeenCalledOnce();
    const insertArg = sb.insert.mock.calls[0]![0] as Record<string, unknown>;
    expect(insertArg).toMatchObject({
      tenant_id: 'tenant-1',
      line_channel_id: 'channel-1',
      line_user_id: 'U1',
      unfollowed_at: null,
    });
    expect(insertArg.followed_at).toBeTruthy();

    expect(mockReply).toHaveBeenCalledOnce();
    const [replyToken, messages, token] = mockReply.mock.calls[0]!;
    expect(replyToken).toBe('rt-1');
    expect(token).toBe('token-xyz');
    expect(messages).toHaveLength(2);
  });

  it('updates existing line_user instead of inserting', async () => {
    const sb = makeSupabaseMock({ existingId: 'lu-1' });
    await handleLineEvent(sb.client, ctx, {
      type: 'follow',
      timestamp: Date.now(),
      source: { type: 'user', userId: 'U1' },
      replyToken: 'rt-1',
    });

    expect(sb.insert).not.toHaveBeenCalled();
    expect(sb.updateEq).toHaveBeenCalled();
  });
});

describe('handleLineEvent — unfollow', () => {
  it('sets unfollowed_at, does not reply', async () => {
    const sb = makeSupabaseMock({ existingId: 'lu-1' });
    await handleLineEvent(sb.client, ctx, {
      type: 'unfollow',
      timestamp: Date.now(),
      source: { type: 'user', userId: 'U1' },
    });
    expect(mockReply).not.toHaveBeenCalled();
    expect(sb.updateEq).toHaveBeenCalled();
  });
});

describe('handleLineEvent — message', () => {
  it('replies when text contains 欠席', async () => {
    const sb = makeSupabaseMock();
    await handleLineEvent(sb.client, ctx, {
      type: 'message',
      timestamp: Date.now(),
      source: { type: 'user', userId: 'U1' },
      replyToken: 'rt-1',
      message: { id: 'm1', type: 'text', text: '今日欠席します' },
    });
    expect(mockReply).toHaveBeenCalledOnce();
  });

  it('does not reply to unrelated text', async () => {
    const sb = makeSupabaseMock();
    await handleLineEvent(sb.client, ctx, {
      type: 'message',
      timestamp: Date.now(),
      source: { type: 'user', userId: 'U1' },
      replyToken: 'rt-1',
      message: { id: 'm1', type: 'text', text: 'こんにちは' },
    });
    expect(mockReply).not.toHaveBeenCalled();
  });
});
