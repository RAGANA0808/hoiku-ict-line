import type { Message } from './messages.js';

const LINE_API_BASE = 'https://api.line.me/v2/bot';

export type LineApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const post = async (
  path: string,
  body: unknown,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> => {
  const res = await fetchImpl(`${LINE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = await res.text();
    const err: LineApiError = {
      status: res.status,
      message: `LINE API ${path} failed: ${res.status}`,
      details: payload,
    };
    throw err;
  }
};

export const replyMessage = async (
  replyToken: string,
  messages: Message[],
  accessToken: string,
  fetchImpl?: typeof fetch,
): Promise<void> => post('/message/reply', { replyToken, messages }, accessToken, fetchImpl);

export const pushMessage = async (
  to: string,
  messages: Message[],
  accessToken: string,
  fetchImpl?: typeof fetch,
): Promise<void> => post('/message/push', { to, messages }, accessToken, fetchImpl);

export const multicastMessage = async (
  to: string[],
  messages: Message[],
  accessToken: string,
  fetchImpl?: typeof fetch,
): Promise<void> => post('/message/multicast', { to, messages }, accessToken, fetchImpl);
