import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';
import { tenants } from './tenants';
import { guardians } from './guardians';

export const lineChannels = pgTable(
  'line_channels',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    webhookPathCode: text('webhook_path_code').notNull(),
    messagingChannelId: text('messaging_channel_id').notNull(),
    messagingChannelSecretEnc: text('messaging_channel_secret_enc').notNull(),
    messagingAccessTokenEnc: text('messaging_access_token_enc').notNull(),
    loginChannelId: text('login_channel_id'),
    loginChannelSecretEnc: text('login_channel_secret_enc'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('line_channels_tenant_idx').on(t.tenantId),
    webhookPathUnique: uniqueIndex('line_channels_webhook_path_unique').on(t.webhookPathCode),
  }),
);

export const lineLiffApps = pgTable(
  'line_liff_apps',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    lineChannelId: uuid('line_channel_id')
      .notNull()
      .references(() => lineChannels.id, { onDelete: 'cascade' }),
    kind: text('kind', {
      enum: ['register', 'messages', 'absence', 'attendance', 'invoice', 'newsletter'],
    }).notNull(),
    liffId: text('liff_id').notNull(),
    endpointPath: text('endpoint_path').notNull(),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('line_liff_apps_tenant_idx').on(t.tenantId),
    channelKindUnique: uniqueIndex('line_liff_apps_channel_kind_unique').on(
      t.lineChannelId,
      t.kind,
    ),
  }),
);

export const lineUsers = pgTable(
  'line_users',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    lineChannelId: uuid('line_channel_id')
      .notNull()
      .references(() => lineChannels.id, { onDelete: 'cascade' }),
    lineUserId: text('line_user_id').notNull(),
    guardianId: uuid('guardian_id').references(() => guardians.id, { onDelete: 'set null' }),
    displayName: text('display_name'),
    pictureUrl: text('picture_url'),
    followedAt: timestamp('followed_at', { withTimezone: true }),
    unfollowedAt: timestamp('unfollowed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    channelLineUnique: uniqueIndex('line_users_channel_line_unique').on(
      t.lineChannelId,
      t.lineUserId,
    ),
    guardianIdx: index('line_users_guardian_idx').on(t.guardianId),
  }),
);

export const guardianInviteCodes = pgTable(
  'guardian_invite_codes',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    guardianId: uuid('guardian_id')
      .notNull()
      .references(() => guardians.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => ({
    tenantCodeUnique: uniqueIndex('guardian_invite_codes_tenant_code_unique').on(
      t.tenantId,
      t.code,
    ),
  }),
);
