import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';
import { tenants } from './tenants';
import { children } from './children';

export const guardians = pgTable(
  'guardians',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    familyName: text('family_name').notNull(),
    givenName: text('given_name').notNull(),
    relation: text('relation'),
    phone: text('phone'),
    email: text('email'),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('guardians_tenant_idx').on(t.tenantId),
  }),
);

export const guardianChildLinks = pgTable(
  'guardian_child_links',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    guardianId: uuid('guardian_id')
      .notNull()
      .references(() => guardians.id, { onDelete: 'cascade' }),
    childId: uuid('child_id')
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').notNull().default(false),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('guardian_child_links_tenant_idx').on(t.tenantId),
    guardianIdx: index('guardian_child_links_guardian_idx').on(t.guardianId),
    childIdx: index('guardian_child_links_child_idx').on(t.childId),
  }),
);
