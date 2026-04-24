import { describe, expect, it, vi } from 'vitest';
import { text } from './messages';
import { multicastMessage, pushMessage, replyMessage } from './messaging';

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>;

const mockFetch = (status = 200, body = ''): FetchMock =>
  vi.fn(async () =>
    new Response(body, { status, headers: { 'content-type': 'application/json' } }),
  ) as unknown as FetchMock;

describe('replyMessage', () => {
  it('POSTs to /message/reply with bearer auth', async () => {
    const fetchImpl = mockFetch();
    await replyMessage('rt-1', [text('hello')], 'token-xyz', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.line.me/v2/bot/message/reply');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token-xyz',
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      replyToken: 'rt-1',
      messages: [{ type: 'text', text: 'hello' }],
    });
  });

  it('throws on non-2xx with status info', async () => {
    const fetchImpl = mockFetch(400, '{"message":"bad"}');
    await expect(replyMessage('rt', [text('x')], 'token', fetchImpl)).rejects.toMatchObject({
      status: 400,
    });
  });
});

describe('pushMessage', () => {
  it('POSTs to /message/push with `to`', async () => {
    const fetchImpl = mockFetch();
    await pushMessage('U123', [text('hi')], 'token', fetchImpl);
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual({ to: 'U123', messages: [{ type: 'text', text: 'hi' }] });
  });
});

describe('multicastMessage', () => {
  it('POSTs to /message/multicast with `to` array', async () => {
    const fetchImpl = mockFetch();
    await multicastMessage(['U1', 'U2'], [text('all')], 'token', fetchImpl);
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string);
    expect(body).toEqual({ to: ['U1', 'U2'], messages: [{ type: 'text', text: 'all' }] });
  });
});
