import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';
import { tenants } from './tenants';

export const staffUsers = pgTable(
  'staff_users',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    authUserId: uuid('auth_user_id').notNull(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    role: text('role', { enum: ['admin', 'teacher', 'office'] }).notNull(),
    ...timestamps,
  },
  (t) => ({
    authUserUnique: uniqueIndex('staff_users_auth_user_unique').on(t.authUserId),
    tenantEmailUnique: uniqueIndex('staff_users_tenant_email_unique').on(t.tenantId, t.email),
  }),
);
