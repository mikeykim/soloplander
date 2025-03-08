import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 솔로프리너 테이블
export const solopreneurs = pgTable('solopreneurs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  region: varchar('region', { length: 50 }).notNull(),
  image: text('image').notNull(),
  description: text('description').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 소셜 미디어 링크 테이블
export const solopreneurLinks = pgTable('solopreneur_links', {
  id: serial('id').primaryKey(),
  solopreneurId: serial('solopreneur_id').references(() => solopreneurs.id, { onDelete: 'cascade' }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(), // youtube, twitter, website, instagram, linkedin
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 미리보기 이미지 테이블
export const solopreneurPreviews = pgTable('solopreneur_previews', {
  id: serial('id').primaryKey(),
  solopreneurId: serial('solopreneur_id').references(() => solopreneurs.id, { onDelete: 'cascade' }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(), // youtube, twitter, website, linkedin
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 키워드 테이블
export const solopreneurKeywords = pgTable('solopreneur_keywords', {
  id: serial('id').primaryKey(),
  solopreneurId: serial('solopreneur_id').references(() => solopreneurs.id, { onDelete: 'cascade' }).notNull(),
  keyword: varchar('keyword', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 관계 정의
export const solopreneursRelations = relations(solopreneurs, ({ many }) => ({
  links: many(solopreneurLinks),
  previews: many(solopreneurPreviews),
  keywords: many(solopreneurKeywords),
}));

export const solopreneurLinksRelations = relations(solopreneurLinks, ({ one }) => ({
  solopreneur: one(solopreneurs, {
    fields: [solopreneurLinks.solopreneurId],
    references: [solopreneurs.id],
  }),
}));

export const solopreneurPreviewsRelations = relations(solopreneurPreviews, ({ one }) => ({
  solopreneur: one(solopreneurs, {
    fields: [solopreneurPreviews.solopreneurId],
    references: [solopreneurs.id],
  }),
}));

export const solopreneurKeywordsRelations = relations(solopreneurKeywords, ({ one }) => ({
  solopreneur: one(solopreneurs, {
    fields: [solopreneurKeywords.solopreneurId],
    references: [solopreneurs.id],
  }),
}));
