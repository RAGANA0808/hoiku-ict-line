import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';

export const tenants = pgTable(
  'tenants',
  {
    id: primaryId(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    plan: text('plan').notNull().default('free'),
    ...timestamps,
  },
  (t) => ({
    codeUnique: uniqueIndex('tenants_code_unique').on(t.code),
  }),
);
