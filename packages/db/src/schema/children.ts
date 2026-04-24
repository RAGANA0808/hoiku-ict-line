import { boolean, date, index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';
import { tenants } from './tenants';

export const children = pgTable(
  'children',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    familyName: text('family_name').notNull(),
    givenName: text('given_name').notNull(),
    familyNameKana: text('family_name_kana'),
    givenNameKana: text('given_name_kana'),
    birthDate: date('birth_date').notNull(),
    enrolledOn: date('enrolled_on').notNull(),
    withdrewOn: date('withdrew_on'),
    photoConsent: boolean('photo_consent').notNull().default(false),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('children_tenant_idx').on(t.tenantId),
  }),
);

export const classes = pgTable(
  'classes',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    fiscalYear: integer('fiscal_year').notNull(),
    name: text('name').notNull(),
    ageGroup: text('age_group'),
    ...timestamps,
  },
  (t) => ({
    tenantYearIdx: index('classes_tenant_year_idx').on(t.tenantId, t.fiscalYear),
  }),
);

export const classEnrollments = pgTable(
  'class_enrollments',
  {
    id: primaryId(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    childId: uuid('child_id')
      .notNull()
      .references(() => children.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => ({
    tenantIdx: index('class_enrollments_tenant_idx').on(t.tenantId),
    classIdx: index('class_enrollments_class_idx').on(t.classId),
  }),
);
