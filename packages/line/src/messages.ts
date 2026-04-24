export type TextMessage = {
  type: 'text';
  text: string;
};

export type FlexMessage = {
  type: 'flex';
  altText: string;
  contents: unknown;
};

export type Message = TextMessage | FlexMessage;

export const text = (body: string): TextMessage => ({ type: 'text', text: body });

export const flex = (altText: string, contents: unknown): FlexMessage => ({
  type: 'flex',
  altText,
  contents,
});
