import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  decimal,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user.model.js';
import { businesses } from './business.model.js';

export const deals = pgTable('deals', {
  id: serial('id').primaryKey(),
  businessId: integer('business_id')
    .references(() => businesses.id)
    .notNull(),
  buyerId: integer('buyer_id')
    .references(() => users.id)
    .notNull(),
  offerAmount: decimal('offer_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, accepted, rejected, cancelled
  message: text('message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
