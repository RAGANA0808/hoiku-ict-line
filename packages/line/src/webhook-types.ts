export type LineWebhookSource = {
  type: 'user' | 'group' | 'room';
  userId?: string;
  groupId?: string;
  roomId?: string;
};

export type LineFollowEvent = {
  type: 'follow';
  timestamp: number;
  source: LineWebhookSource;
  replyToken: string;
};

export type LineUnfollowEvent = {
  type: 'unfollow';
  timestamp: number;
  source: LineWebhookSource;
};

export type LineTextMessageEvent = {
  type: 'message';
  timestamp: number;
  source: LineWebhookSource;
  replyToken: string;
  message: { id: string; type: 'text'; text: string };
};

export type LinePostbackEvent = {
  type: 'postback';
  timestamp: number;
  source: LineWebhookSource;
  replyToken: string;
  postback: { data: string; params?: Record<string, string> };
};

export type LineWebhookEvent =
  | LineFollowEvent
  | LineUnfollowEvent
  | LineTextMessageEvent
  | LinePostbackEvent
  | { type: string; timestamp: number; source: LineWebhookSource; [key: string]: unknown };

export type LineWebhookBody = {
  destination: string;
  events: LineWebhookEvent[];
};
