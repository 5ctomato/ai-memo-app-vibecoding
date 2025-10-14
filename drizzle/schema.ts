// drizzle/schema.ts
// DrizzleORM 스키마 정의 파일
// 데이터베이스 테이블 구조를 TypeScript로 정의

import { pgTable, text, timestamp, uuid, boolean, index } from 'drizzle-orm/pg-core';

// 사용자 테이블 (Supabase Auth와 연동)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 노트 테이블
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // 사용자별 노트 조회를 위한 인덱스
  userIdIdx: index('notes_user_id_idx').on(table.userId),
  // 정렬을 위한 인덱스들
  updatedAtIdx: index('notes_updated_at_idx').on(table.updatedAt),
  createdAtIdx: index('notes_created_at_idx').on(table.createdAt),
  titleIdx: index('notes_title_idx').on(table.title),
  // 복합 인덱스: 사용자별 + 정렬 기준
  userUpdatedIdx: index('notes_user_updated_idx').on(table.userId, table.updatedAt),
  userCreatedIdx: index('notes_user_created_idx').on(table.userId, table.createdAt),
  userTitleIdx: index('notes_user_title_idx').on(table.userId, table.title),
}));

// 태그 테이블
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#3B82F6'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 노트-태그 연결 테이블 (다대다 관계)
export const noteTags = pgTable('note_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI 요약 테이블
export const summaries = pgTable('summaries', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  model: text('model').notNull(), // 사용된 AI 모델 (예: gemini-2.0-flash-001)
  content: text('content').notNull(), // 요약 내용
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // 노트별 요약 조회를 위한 인덱스
  noteIdIdx: index('summaries_note_id_idx').on(table.noteId),
  // 최신 요약 조회를 위한 인덱스
  createdAtIdx: index('summaries_created_at_idx').on(table.createdAt),
  // 복합 인덱스: 노트별 + 생성일시
  noteCreatedIdx: index('summaries_note_created_idx').on(table.noteId, table.createdAt),
}));
