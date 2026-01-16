import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  decimal,
} from 'drizzle-orm/pg-core';
import { users } from './user.model.js';

export const businesses = pgTable('businesses', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  ownerId: integer('owner_id')
    .references(() => users.id)
    .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
